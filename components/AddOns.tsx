"use client";

import { addOns } from "@/lib/site";
import { formatPrice } from "@/lib/whatsapp";
import "./ProductControls.css";

type AddOnsProps = {
  value: string[];
  onChange: (ids: string[]) => void;
};

export function AddOns({ value, onChange }: AddOnsProps) {
  return (
    <fieldset className="gl-detail-controls-fieldset gl-detail-addons">
      <legend className="gl-detail-controls-legend">Make it extra special</legend>
      <div className="gl-detail-addons-options">
        {addOns.map((addOn) => (
          <label className="gl-detail-addons-option" key={addOn.id}>
            <input
              className="gl-detail-controls-choice"
              type="checkbox"
              name="product-addons"
              value={addOn.id}
              checked={value.includes(addOn.id)}
              onChange={(event) => onChange(event.target.checked
                ? [...value, addOn.id]
                : value.filter((id) => id !== addOn.id))}
            />
            <span className="gl-detail-addons-tile">
              <svg className="gl-detail-addons-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path className="gl-detail-addons-plus" d="M8 3v10M3 8h10" />
                <path className="gl-detail-addons-check" d="M3 8.5l3 3 7-7" />
              </svg>
              <span>{addOn.name}</span>
              <span className="gl-detail-addons-price">
                {addOn.price === null ? "Price to confirm" : addOn.price === 0 ? "Free" : formatPrice(addOn.price)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
