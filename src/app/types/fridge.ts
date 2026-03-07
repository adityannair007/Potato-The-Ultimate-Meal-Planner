export type Unit = "piece" | "g" | "kg" | "ml" | "l";

export type QuantityConfidence = "exact" | "estimated" | "unknown";

export type ingredient = {
  fridge_id: string;
  name: string;
  quantity: number;
  unit: Unit;
  quantity_confidence: QuantityConfidence;
};

export type FridgeDraftItem = {
  name: string;
  quantity: number;
  unit: Unit;
  quantity_confidence?: QuantityConfidence;
};
