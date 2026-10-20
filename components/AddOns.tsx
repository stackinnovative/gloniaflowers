"use client";

import { addOnChoices, addOns, type AddOnOption } from "@/lib/site";
import { formatPrice } from "@/lib/whatsapp";
import "./ProductControls.css";

type AddOnsProps = {
  value: string[];
  onChange: (ids: string[]) => void;
};

type ChoiceProps = AddOnsProps & { choice: AddOnOption };

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
        {/* No price line for ₹0 add-ons (e.g. the message card). */}
        {choice.price !== 0 && (
          <span className="gl-detail-addons-price">
            {choice.price === null ? "Price to confirm" : formatPrice(choice.price)}
          </span>
        )}
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
      {/* Add-ons with several choices (e.g. different chocolates) get their own labelled row. */}
      {withOptions.map((addOn) => (
        <div key={addOn.id} role="group" aria-labelledby={`addon-${addOn.id}`} className="gl-detail-addons-group">
          <p id={`addon-${addOn.id}`} className="gl-detail-addons-group-name">{addOn.name}</p>
          <div className="gl-detail-addons-options">
            {addOnChoices.filter((choice) => choice.group === addOn.id).map((choice) => (
              <Choice key={choice.id} choice={choice} value={value} onChange={onChange} />
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
