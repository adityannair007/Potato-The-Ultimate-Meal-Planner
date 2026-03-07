"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustIngredientQuantity, deleteIngredient, saveIngredients } from "./actions";
import { LoaderCircle, Plus } from "lucide-react";
import { useFridge } from "@/app/context/FridgeContext";
import { Unit } from "@/app/types/fridge";

function normalizeIngredientName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

type DraftTrayItem = {
  draft_id: string;
  name: string;
  quantity: number;
  unit: Unit;
};

const UNIT_OPTIONS: Unit[] = ["piece", "g", "kg", "ml", "l"];

export default function FridgeClient() {
  const { ingredients, setIngredients } = useFridge();
  const [veggie, setVeggie] = useState<string>("");
  const [draftQuantity, setDraftQuantity] = useState<string>("1");
  const [draftUnit, setDraftUnit] = useState<Unit>("piece");
  const [draftItems, setDraftItems] = useState<DraftTrayItem[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isAdjustingId, setIsAdjustingId] = useState<string | null>(null);

  const persistedItemsByName = useMemo(
    () =>
      new Map(
        ingredients.map((item) => [normalizeIngredientName(item.name), item]),
      ),
    [ingredients],
  );

  const handleAddDraftItem = () => {
    const trimmed = veggie.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    const parsedQuantity = Number(draftQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setFeedback("Please enter a valid quantity greater than 0.");
      return;
    }

    const normalizedName = normalizeIngredientName(trimmed);
    const draftKey = `${normalizedName}::${draftUnit}`;

    setDraftItems((prev) => {
      const existingDraftItem = prev.find(
        (item) => `${normalizeIngredientName(item.name)}::${item.unit}` === draftKey,
      );

      if (existingDraftItem) {
        return prev.map((item) =>
          item.draft_id === existingDraftItem.draft_id
            ? { ...item, quantity: item.quantity + parsedQuantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          draft_id: `draft-${Date.now()}-${prev.length}`,
          name: trimmed,
          quantity: parsedQuantity,
          unit: draftUnit,
        },
      ];
    });
    setVeggie("");
    setDraftQuantity("1");

    if (persistedItemsByName.has(normalizedName)) {
      const savedItem = persistedItemsByName.get(normalizedName);
      setFeedback(
        `"${trimmed}" will be added to the saved quantity${savedItem ? ` (currently ${savedItem.quantity})` : ""}.`,
      );
      return;
    }

    setFeedback("");
  };

  const removeDraftItem = (draftId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.draft_id !== draftId));
  };

  const handleSaveIngredient = async () => {
    if (draftItems.length === 0 || isSaving) return;

    setIsSaving(true);
    setFeedback("");

    const result = await saveIngredients(
      draftItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        quantity_confidence: "exact",
      })),
    );

    if (result?.success && result.ingredients) {
      setIngredients(result.ingredients);
      setDraftItems([]);
      setFeedback("Tray saved to your fridge.");
    } else if (result?.error) {
      setFeedback(result.error);
    }

    setIsSaving(false);
  };

  const handleDeleteIngredient = async (id: string) => {
    if (isDeletingId) return;

    setIsDeletingId(id);
    setFeedback("");

    const result = await deleteIngredient(id);

    if (result?.success && result.ingredients) {
      setIngredients(result.ingredients);
    } else if (result?.error) {
      setFeedback(result.error);
    }

    setIsDeletingId(null);
  };

  const handleAdjustIngredient = async (id: string, delta: number) => {
    if (isAdjustingId || isDeletingId === id) return;

    setIsAdjustingId(id);
    setFeedback("");

    const result = await adjustIngredientQuantity(id, delta);

    if (result?.success && result.ingredients) {
      setIngredients(result.ingredients);
    } else if (result?.error) {
      setFeedback(result.error);
    }

    setIsAdjustingId(null);
  };

  return (
    <div className="min-h-full w-full bg-background p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-4 rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/5">
        <h2 className="border-b border-border pb-4 text-2xl font-semibold text-card-foreground">
          Manage Your Fridge
        </h2>

        <div className="flex gap-x-2">
          <Input
            value={veggie}
            onChange={(e) => setVeggie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddDraftItem();
            }}
            placeholder="Add an ingredient to your tray..."
            className="flex-grow border-input bg-background"
          />
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={draftQuantity}
            onChange={(e) => setDraftQuantity(e.target.value)}
            className="w-24 border-input bg-background"
            placeholder="Qty"
          />
          <select
            value={draftUnit}
            onChange={(e) => setDraftUnit(e.target.value as Unit)}
            className="h-10 rounded-md border border-input bg-background px-2 text-sm"
          >
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <Button onClick={handleAddDraftItem} className="shrink-0">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>

        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Tray (Items to add)
          </label>
          <div className="flex min-h-[80px] w-full flex-wrap gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-4">
            {draftItems.length === 0 && (
              <span className="text-muted-foreground">Your tray is empty.</span>
            )}
            {draftItems.map((item) => (
              <span
                key={item.draft_id}
                className="flex items-center gap-x-2 rounded-full border border-border bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
              >
                <span>
                  {item.name}
                  <span className="ml-2 rounded-full bg-accent-foreground/10 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </span>
                <button
                  onClick={() => removeDraftItem(item.draft_id)}
                  className="font-bold text-accent-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {draftItems.length > 0 && (
            <Button
              onClick={handleSaveIngredient}
              variant="secondary"
              className="mt-2 w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving Tray...
                </>
              ) : (
                "Add Tray to Fridge"
              )}
            </Button>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Items in Fridge
          </label>
          <div className="flex min-h-[120px] w-full flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-4">
            {ingredients.length === 0 && (
              <span className="text-muted-foreground">
                Your fridge is empty.
              </span>
            )}
            {ingredients.map((item) => (
              <span
                key={item.fridge_id}
                className="flex items-center gap-x-2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              >
                <button
                  onClick={() => handleAdjustIngredient(item.fridge_id, -1)}
                  disabled={isAdjustingId === item.fridge_id || isDeletingId === item.fridge_id}
                  className="font-bold text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  title="Decrease by 1"
                >
                  -
                </button>
                <span>
                  {item.name}
                  <span className="ml-2 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </span>
                <button
                  onClick={() => handleAdjustIngredient(item.fridge_id, 1)}
                  disabled={isAdjustingId === item.fridge_id || isDeletingId === item.fridge_id}
                  className="font-bold text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  title="Increase by 1"
                >
                  +
                </button>
                <button
                  onClick={() => handleDeleteIngredient(item.fridge_id)}
                  disabled={
                    isDeletingId === item.fridge_id || isAdjustingId === item.fridge_id
                  }
                  className="font-bold text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                >
                  {isDeletingId === item.fridge_id || isAdjustingId === item.fridge_id ? "..." : "×"}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
