"use server";

import { createClient } from "@/app/lib/supabase/server";
import { convertQuantity, isCompatibleUnit, normalizeQuantity } from "@/app/lib/quantity";
import { FridgeDraftItem, ingredient, QuantityConfidence, Unit } from "@/app/types/fridge";
import { revalidatePath } from "next/cache";

function normalizeIngredientName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function toSafeUnit(value: unknown): Unit {
  if (value === "piece" || value === "g" || value === "kg" || value === "ml" || value === "l") {
    return value;
  }
  return "piece";
}

function toSafeConfidence(value: unknown): QuantityConfidence {
  if (value === "exact" || value === "estimated" || value === "unknown") {
    return value;
  }
  return "exact";
}

function formatIngredientRows(rows: any[] | null | undefined): ingredient[] {
  return (rows || []).map((row) => ({
    fridge_id: String(row.fridge_id),
    name:
      Array.isArray(row.fridge) ? row.fridge[0]?.name || "" : row.fridge?.name || "",
    quantity: Number(row.quantity) || 1,
    unit: toSafeUnit(row.unit),
    quantity_confidence: toSafeConfidence(row.quantity_confidence),
  }));
}

async function getUserIngredients(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const enrichedResponse = await supabase
    .from("user_fridge")
    .select("fridge_id, quantity, unit, quantity_confidence, fridge(name)")
    .eq("user_id", userId)
    .order("fridge_id", { ascending: true });

  if (!enrichedResponse.error) {
    return formatIngredientRows(enrichedResponse.data);
  }

  const fallbackResponse = await supabase
    .from("user_fridge")
    .select("fridge_id, quantity, fridge(name)")
    .eq("user_id", userId)
    .order("fridge_id", { ascending: true });

  if (fallbackResponse.error) {
    throw fallbackResponse.error;
  }

  return formatIngredientRows(fallbackResponse.data);
}

export async function saveIngredients(
  draftItems: FridgeDraftItem[],
) {
  if (!draftItems || draftItems.length === 0) {
    return { success: false, error: "No ingredients to save." };
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    return { success: false, error: "Unable to identify the current user." };
  }

  const groupedDraftItems = Array.from(
    draftItems.reduce(
      (map, item) => {
        const name = item.name.trim().replace(/\s+/g, " ");
        if (!name) {
          return map;
        }

        const normalizedName = normalizeIngredientName(name);
        const safeUnit = toSafeUnit(item.unit);
        const safeQuantity = Math.max(0.01, item.quantity ?? 1);

        const current = map.get(normalizedName);

        if (current) {
          current.entries.push({
            quantity: safeQuantity,
            unit: safeUnit,
            quantity_confidence: item.quantity_confidence ?? "exact",
          });
          return map;
        }

        map.set(normalizedName, {
          name,
          entries: [
            {
              quantity: safeQuantity,
              unit: safeUnit,
              quantity_confidence: item.quantity_confidence ?? "exact",
            },
          ],
        });
        return map;
      },
      new Map<
        string,
        {
          name: string;
          entries: {
            quantity: number;
            unit: Unit;
            quantity_confidence: QuantityConfidence;
          }[];
        }
      >(),
    ).values(),
  );

  if (groupedDraftItems.length === 0) {
    return { success: false, error: "No ingredients to save." };
  }

  try {
    const currentIngredients = await getUserIngredients(supabase, userId);
    const currentIngredientsByName = new Map(
      currentIngredients.map((item) => [normalizeIngredientName(item.name), item]),
    );

    const rowsToUpsert: {
      user_id: string;
      fridge_id: string;
      quantity: number;
      unit: Unit;
      quantity_confidence: QuantityConfidence;
    }[] = [];

    const incompatibleItems: string[] = [];

    for (const draftItem of groupedDraftItems) {
      const { name, entries } = draftItem;
      const { data: existingIngredient, error: existingIngredientError } = await supabase
        .from("fridge")
        .select("fridge_id, name")
        .ilike("name", name)
        .limit(1)
        .maybeSingle();

      if (existingIngredientError) {
        throw existingIngredientError;
      }

      let fridgeId = existingIngredient?.fridge_id
        ? String(existingIngredient.fridge_id)
        : null;

      if (!fridgeId) {
        const { data: insertedIngredient, error: insertedIngredientError } = await supabase
          .from("fridge")
          .insert({ name })
          .select("fridge_id")
          .single();

        if (insertedIngredientError || !insertedIngredient?.fridge_id) {
          throw insertedIngredientError || new Error("Ingredient insert failed.");
        }

        fridgeId = String(insertedIngredient.fridge_id);
      }

      const currentIngredient = currentIngredientsByName.get(
        normalizeIngredientName(name),
      );

      const seedUnit = currentIngredient?.unit ?? entries[0].unit;
      const { normalizedUnit: canonicalUnit } = normalizeQuantity(1, seedUnit);

      const hasIncompatibleDraftUnit = entries.some(
        (entry) => !isCompatibleUnit(entry.unit, canonicalUnit),
      );

      if (hasIncompatibleDraftUnit) {
        incompatibleItems.push(name);
        continue;
      }

      if (
        currentIngredient &&
        !isCompatibleUnit(currentIngredient.unit, canonicalUnit)
      ) {
        incompatibleItems.push(name);
        continue;
      }

      const currentInCanonical = currentIngredient
        ? convertQuantity(
            currentIngredient.quantity || 0,
            currentIngredient.unit,
            canonicalUnit,
          )
        : 0;

      const draftInCanonical = entries.reduce(
        (sum, entry) =>
          sum + convertQuantity(entry.quantity, entry.unit, canonicalUnit),
        0,
      );

      const quantityConfidence: QuantityConfidence = entries.some(
        (entry) => entry.quantity_confidence !== "exact",
      )
        ? "estimated"
        : "exact";

      const nextQuantity = currentInCanonical + draftInCanonical;

      rowsToUpsert.push({
        user_id: userId,
        fridge_id: fridgeId,
        quantity: nextQuantity,
        unit: canonicalUnit,
        quantity_confidence: quantityConfidence,
      });
    }

    if (incompatibleItems.length > 0) {
      return {
        success: false,
        error: `Cannot merge incompatible units for: ${incompatibleItems.join(", ")}`,
      };
    }

    if (rowsToUpsert.length === 0) {
      return { success: false, error: "No valid ingredients to save." };
    }

    const enrichedUpsert = await supabase
      .from("user_fridge")
      .upsert(rowsToUpsert, { onConflict: "user_id,fridge_id" });

    if (enrichedUpsert.error) {
      const fallbackRows = rowsToUpsert.map((row) => ({
        user_id: row.user_id,
        fridge_id: row.fridge_id,
        quantity: row.quantity,
      }));

      const { error: fallbackLinkError } = await supabase
        .from("user_fridge")
        .upsert(fallbackRows, { onConflict: "user_id,fridge_id" });

      if (fallbackLinkError) {
        throw fallbackLinkError;
      }
    }

    const ingredients = await getUserIngredients(supabase, userId);

    revalidatePath("/fridge");
    revalidatePath("/home");
    revalidatePath("/planner");

    return { success: true, ingredients };
  } catch (error) {
    console.log("Error saving ingredients to fridge:", error);
    return { success: false, error: "Unable to save fridge items right now." };
  }
}

export async function deleteIngredient(fridgeId: string) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    return { success: false, error: "Unable to identify the current user." };
  }

  try {
    const { error } = await supabase
      .from("user_fridge")
      .delete()
      .eq("user_id", userId)
      .eq("fridge_id", fridgeId);

    if (error) {
      throw error;
    }

    const ingredients = await getUserIngredients(supabase, userId);

    revalidatePath("/fridge");
    revalidatePath("/home");
    revalidatePath("/planner");

    return { success: true, ingredients };
  } catch (error) {
    console.log("Deletion Error:", error);
    return { success: false, error: "Unable to delete the fridge item right now." };
  }
}

export async function adjustIngredientQuantity(fridgeId: string, delta: number) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (authError || !userId) {
    return { success: false, error: "Unable to identify the current user." };
  }

  try {
    const { data: currentRow, error: currentError } = await supabase
      .from("user_fridge")
      .select("quantity")
      .eq("user_id", userId)
      .eq("fridge_id", fridgeId)
      .maybeSingle();

    if (currentError) {
      throw currentError;
    }

    const currentQuantity = Number(currentRow?.quantity) || 0;
    const nextQuantity = Math.max(0.01, currentQuantity + delta);

    const { error: updateError } = await supabase
      .from("user_fridge")
      .update({ quantity: nextQuantity })
      .eq("user_id", userId)
      .eq("fridge_id", fridgeId);

    if (updateError) {
      throw updateError;
    }

    const ingredients = await getUserIngredients(supabase, userId);

    revalidatePath("/fridge");
    revalidatePath("/home");
    revalidatePath("/planner");

    return { success: true, ingredients };
  } catch (error) {
    console.log("Adjustment Error:", error);
    return { success: false, error: "Unable to update ingredient quantity right now." };
  }
}
