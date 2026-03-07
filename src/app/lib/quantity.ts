import { Unit } from "@/app/types/fridge";

const UNIT_CATEGORY: Record<Unit, "count" | "weight" | "volume"> = {
  piece: "count",
  g: "weight",
  kg: "weight",
  ml: "volume",
  l: "volume",
};

const BASE_UNIT: Record<"count" | "weight" | "volume", Unit> = {
  count: "piece",
  weight: "g",
  volume: "ml",
};

const TO_BASE_MULTIPLIER: Record<Unit, number> = {
  piece: 1,
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
};

function round(value: number, precision = 4) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function isCompatibleUnit(from: Unit, to: Unit) {
  return UNIT_CATEGORY[from] === UNIT_CATEGORY[to];
}

export function normalizeQuantity(quantity: number, unit: Unit) {
  const baseUnit = BASE_UNIT[UNIT_CATEGORY[unit]];
  const normalizedQuantity = round(quantity * TO_BASE_MULTIPLIER[unit]);

  return {
    normalizedQuantity,
    normalizedUnit: baseUnit,
  };
}

export function convertQuantity(quantity: number, from: Unit, to: Unit) {
  if (!isCompatibleUnit(from, to)) {
    throw new Error(`Incompatible units: ${from} and ${to}`);
  }

  const base = quantity * TO_BASE_MULTIPLIER[from];
  return round(base / TO_BASE_MULTIPLIER[to]);
}
