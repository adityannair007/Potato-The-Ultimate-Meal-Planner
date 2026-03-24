import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type CsvRow = Record<string, string>;

type IngestedRow = {
  externalRowId: string;
  food: string;
  canonicalKey: string;
  payload: Record<string, string>;
  energyKcal: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  sourceRowId: string;
  hash: string;
};

type CliOptions = {
  filePath: string;
  sourceName: string;
  sourcePriority: number;
  dryRun: boolean;
};

const REQUIRED_HEADERS = [
  "Unnamed: 0",
  "food",
  "Caloric Value",
  "Fat",
  "Carbohydrates",
  "Protein",
  "Dietary Fiber",
  "Sugars",
  "Sodium",
] as const;

function parseArgs(argv: string[]): CliOptions {
  let filePath = "";
  let sourceName = "nutrition_csv_v1";
  let sourcePriority = 1;
  let dryRun = false;

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--file") {
      filePath = argv[i + 1] ?? "";
      i += 1;
      continue;
    }

    if (arg === "--source") {
      sourceName = argv[i + 1] ?? sourceName;
      i += 1;
      continue;
    }

    if (arg === "--priority") {
      const parsed = Number(argv[i + 1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        sourcePriority = parsed;
      }
      i += 1;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  if (!filePath) {
    throw new Error(
      "Missing --file argument. Example: --file data/nutrition.csv",
    );
  }

  return {
    filePath,
    sourceName,
    sourcePriority,
    dryRun,
  };
}

function normalizeFoodKey(input: string) {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseNumeric(input: string | undefined): number | null {
  const cleaned = (input ?? "")
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/[^0-9.+-]/g, "")
    .trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV file has no data rows.");
  }

  const headers = parseCsvLine(lines[0]);

  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      throw new Error(`CSV missing required header: ${required}`);
    }
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const columns = parseCsvLine(lines[i]);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = columns[index] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

function toIngestedRows(rows: CsvRow[]): IngestedRow[] {
  return rows
    .map((row, index) => {
      const food = (row.food ?? "").trim();
      if (!food) return null;

      const externalRowId =
        (row["Unnamed: 0"] ?? "").trim() || `row-${index + 1}`;
      const canonicalKey = normalizeFoodKey(food);
      const payload = { ...row };

      const energy = parseNumeric(row["Caloric Value"]);
      if (energy === null) return null;

      const hash = createHash("sha256")
        .update(JSON.stringify(payload))
        .digest("hex");

      return {
        externalRowId,
        food,
        canonicalKey,
        payload,
        energyKcal: energy,
        proteinG: parseNumeric(row.Protein),
        carbsG: parseNumeric(row.Carbohydrates),
        fatG: parseNumeric(row.Fat),
        fiberG: parseNumeric(row["Dietary Fiber"]),
        sugarG: parseNumeric(row.Sugars),
        sodiumMg: parseNumeric(row.Sodium),
        sourceRowId: externalRowId,
        hash,
      } satisfies IngestedRow;
    })
    .filter((row): row is IngestedRow => Boolean(row));
}

async function main() {
  const options = parseArgs(process.argv);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.",
    );
  }

  const absolutePath = path.resolve(process.cwd(), options.filePath);
  const content = await readFile(absolutePath, "utf8");
  const parsedRows = parseCsv(content);
  const ingestedRows = toIngestedRows(parsedRows);

  if (ingestedRows.length === 0) {
    throw new Error("No valid rows found in CSV after parsing.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(
    `Parsed ${parsedRows.length} rows, ${ingestedRows.length} valid for ingest.`,
  );

  if (options.dryRun) {
    console.log("Dry run enabled, no DB writes performed.");
    return;
  }

  const { data: sourceSystem, error: sourceError } = await supabase
    .schema("dw")
    .from("source_systems")
    .upsert(
      {
        source_name: options.sourceName,
        source_type: "file",
        source_priority: options.sourcePriority,
        refresh_frequency: "ad-hoc",
        active: true,
      },
      { onConflict: "source_name" },
    )
    .select("source_system_id")
    .single();

  if (sourceError || !sourceSystem?.source_system_id) {
    throw sourceError ?? new Error("Unable to upsert source system.");
  }

  const sourceSystemId = sourceSystem.source_system_id;

  const { data: run, error: runError } = await supabase
    .schema("dw")
    .from("ingestion_runs")
    .insert({
      source_system_id: sourceSystemId,
      run_type: "full",
      status: "running",
      triggered_by: "typescript_csv_ingest",
    })
    .select("ingestion_run_id")
    .single();

  if (runError || !run?.ingestion_run_id) {
    throw runError ?? new Error("Unable to create ingestion run.");
  }

  const ingestionRunId = run.ingestion_run_id;
  console.log(`Created ingestion run ${ingestionRunId}.`);

  try {
    const uniqueFoods = new Map<string, string>();
    for (const row of ingestedRows) {
      if (!uniqueFoods.has(row.canonicalKey)) {
        uniqueFoods.set(row.canonicalKey, row.food);
      }
    }

    const foodUpserts = Array.from(uniqueFoods.entries()).map(
      ([canonicalKey, canonicalName]) => ({
        canonical_key: canonicalKey,
        canonical_name: canonicalName,
        state: "active",
      }),
    );

    for (const batch of chunk(foodUpserts, 500)) {
      const { error } = await supabase
        .schema("dw")
        .from("food_items")
        .upsert(batch, { onConflict: "canonical_key" });

      if (error) throw error;
    }

    const foodKeys = Array.from(uniqueFoods.keys());
    const keyChunks = chunk(foodKeys, 500);
    const foodItemRows: {
      canonical_food_id: number;
      canonical_key: string;
      canonical_name: string;
    }[] = [];

    for (const keyBatch of keyChunks) {
      const { data, error } = await supabase
        .schema("dw")
        .from("food_items")
        .select("canonical_food_id, canonical_key, canonical_name")
        .in("canonical_key", keyBatch);

      if (error) throw error;
      if (data) foodItemRows.push(...data);
    }

    //foodalias insertion

    const foodMap = new Map<
      string,
      { canonical_food_id: number; canonical_name: string }
    >();
    for (const row of foodItemRows) {
      foodMap.set(row.canonical_key, {
        canonical_food_id: row.canonical_food_id,
        canonical_name: row.canonical_name,
      });
    }

    const aliasRows = foodItemRows.map((row) => ({
      canonical_food_id: row.canonical_food_id,
      alias_text: row.canonical_name,
      alias_key: row.canonical_key,
      locale: "en",
      alias_type: "exact",
      confidence: 1,
      is_primary: true,
    }));

    for (const batch of chunk(aliasRows, 500)) {
      const { error } = await supabase
        .schema("dw")
        .from("food_aliases")
        .upsert(batch, { onConflict: "canonical_food_id,alias_key,locale" });

      if (error) throw error;
    }

    const sourceRecords = ingestedRows.map((row) => {
      const canonical = foodMap.get(row.canonicalKey); //connection of foodMap's cKey and ingestedRow's

      return {
        ingestion_run_id: ingestionRunId,
        source_system_id: sourceSystemId,
        external_row_id: row.externalRowId,
        record_hash: row.hash,
        raw_payload: row.payload,
        raw_food_name: row.food,
        canonical_food_id: canonical?.canonical_food_id ?? null,
        resolution_status: canonical ? "matched" : "unresolved",
        match_method: canonical ? "exact" : null,
        match_score: canonical ? 1 : null,
      };
    });

    let insertedSourceRecords = 0;

    for (const batch of chunk(sourceRecords, 500)) {
      const { error } = await supabase
        .schema("dw")
        .from("source_records")
        .upsert(batch, {
          onConflict: "source_system_id,external_row_id,record_hash",
        });

      if (error) throw error;
      insertedSourceRecords += batch.length;
    }

    const canonicalIds = Array.from(
      new Set(
        ingestedRows
          .map((row) => foodMap.get(row.canonicalKey)?.canonical_food_id)
          .filter((id): id is number => Number.isInteger(id)),
      ),
    );

    for (const ids of chunk(canonicalIds, 500)) {
      const { error } = await supabase
        .schema("dw")
        .from("nutrition_facts")
        .update({
          is_current: false,
          effective_to: new Date().toISOString().slice(0, 10),
        })
        .eq("is_current", true)
        .in("canonical_food_id", ids);

      if (error) throw error;
    }

    const nutritionRows = ingestedRows
      .map((row) => {
        const canonical = foodMap.get(row.canonicalKey);
        if (!canonical) return null;

        return {
          canonical_food_id: canonical.canonical_food_id,
          source_system_id: sourceSystemId,
          source_row_id: row.sourceRowId,
          basis_amount: 100,
          basis_unit: "g",
          energy_kcal: row.energyKcal,
          protein_g: row.proteinG,
          carbs_g: row.carbsG,
          fat_g: row.fatG,
          fiber_g: row.fiberG,
          sugar_g: row.sugarG,
          sodium_mg: row.sodiumMg,
          quality_tier: "medium",
          is_current: true,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    for (const batch of chunk(nutritionRows, 500)) {
      const { error } = await supabase
        .schema("dw")
        .from("nutrition_facts")
        .insert(batch);

      if (error) throw error;
    }

    const rejectedCount = sourceRecords.filter(
      (row) => row.resolution_status !== "matched",
    ).length;

    const { error: finishError } = await supabase
      .schema("dw")
      .from("ingestion_runs")
      .update({
        status: "succeeded",
        ended_at: new Date().toISOString(),
        rows_read: ingestedRows.length,
        rows_inserted: nutritionRows.length,
        rows_updated: canonicalIds.length,
        rows_rejected: rejectedCount,
      })
      .eq("ingestion_run_id", ingestionRunId);

    if (finishError) throw finishError;

    console.log("Ingestion completed successfully.");
    console.log({
      ingestionRunId,
      rowsRead: ingestedRows.length,
      sourceRecordsInserted: insertedSourceRecords,
      nutritionFactsInserted: nutritionRows.length,
      rejectedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await supabase
      .schema("dw")
      .from("ingestion_runs")
      .update({
        status: "failed",
        ended_at: new Date().toISOString(),
        error_summary: { message },
      })
      .eq("ingestion_run_id", ingestionRunId);

    throw error;
  }
}

main().catch((error) => {
  console.error("CSV ingest failed:", error);
  process.exit(1);
});
