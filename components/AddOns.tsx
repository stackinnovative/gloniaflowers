"use client";

import { addOnChoices, addOns, type AddOnOption } from "@/lib/site";
import { formatPrice } from "@/lib/whatsapp";
import "./ProductControls.css";

type AddOnsProps = {
  value: string[];
  onChange: (ids: string[]) => void;
};

type ChoiceProps = AddOnsProps & { choice: AddOnOption };

function choicePrice(price: number | null): string {
  return price === null ? "Price to confirm" : price === 0 ? "No charge" : formatPrice(price);
}

function Choice({ choice, value, onChange }: ChoiceProps) {
  return (
    <label className="gl-detail-addons-option">
      <input
        className="gl-detail-controls-choice"
        type="checkbox"
        name="product-addons"
        value={choice.id}
        checked={value.includes(choice.id)}
        onChange={(event) => onChange(event.target.checked
          ? [...value, choice.id]
          : value.filter((id) => id !== choice.id))}
      />
      <span className="gl-detail-addons-tile">
        <svg className="gl-detail-addons-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path className="gl-detail-addons-plus" d="M8 3v10M3 8h10" />
          <path className="gl-detail-addons-check" d="M3 8.5l3 3 7-7" />
        </svg>
        <span>{choice.name}</span>
        {/* No price line for ₹0 add-ons. */}
        {choice.price !== 0 && <span className="gl-detail-addons-price">{choicePrice(choice.price)}</span>}
      </span>
    </label>
  );
}

export function AddOns({ value, onChange }: AddOnsProps) {
  const plain = addOnChoices.filter((choice) => choice.id === choice.group);
  const withOptions = addOns.filter((addOn) => addOn.options?.length);

  return (
    <fieldset className="gl-detail-controls-fieldset gl-detail-addons">
      <legend className="gl-detail-controls-legend">Make it extra special</legend>
      {plain.length > 0 && (
        <div className="gl-detail-addons-options">
          {plain.map((addOn) => <Choice key={addOn.id} choice={addOn} value={value} onChange={onChange} />)}
        </div>
      )}
      {/* Add-ons with several choices (e.g. different chocolates) are a dropdown: one pick each. */}
      {withOptions.length > 0 && (
        <div className="gl-detail-addons-selects">
          {withOptions.map((addOn) => {
            const choices = addOnChoices.filter((choice) => choice.group === addOn.id);
            const others = value.filter((id) => !choices.some((choice) => choice.id === id));
            return (
              <label key={addOn.id} className="gl-detail-addons-select">
                {addOn.name}
                <select
                  name={`addon-${addOn.id}`}
                  value={choices.find((choice) => value.includes(choice.id))?.id ?? ""}
                  onChange={(event) => onChange(event.target.value ? [...others, event.target.value] : others)}
                >
                  <option value="">None</option>
                  {choices.map((choice) => (
                    <option key={choice.id} value={choice.id}>{choice.name} — {choicePrice(choice.price)}</option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
