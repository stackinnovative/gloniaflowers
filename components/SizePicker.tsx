"use client";

import { SIZE_INCHES, SIZE_NAMES, sizeKeys, sizePrice, type SizeKey, type Sizes } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";
import "./ProductControls.css";

type SizePickerProps = {
  sizes: Sizes;
  value: SizeKey;
  onChange: (size: SizeKey) => void;
};

const circleDiameters: Record<SizeKey, number> = { S: 36, M: 43, L: 50, XL: 60 };

export function SizePicker({ sizes, value, onChange }: SizePickerProps) {
  return (
    <fieldset className="gl-detail-controls-fieldset gl-size-picker">
      <legend className="gl-detail-controls-legend">
        <span className="gl-size-picker-heading">
          <span>Choose size</span>
          <a href="#sizes">Size guide</a>
        </span>
      </legend>
      <div className="gl-size-picker-options" data-count={sizeKeys(sizes).length}>
        {sizeKeys(sizes).map((size) => (
          <label className="gl-size-picker-option" key={size}>
            <input
              className="gl-detail-controls-choice"
              type="radio"
              name="product-size"
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
            />
            <span className="gl-size-picker-tile">
              <span className="gl-size-picker-circle-stage" aria-hidden="true">
                <span style={{ width: circleDiameters[size], height: circleDiameters[size] }} />
              </span>
              <span className="gl-size-picker-name">{SIZE_NAMES[size]}</span>
              <span className="gl-size-picker-inches">{size} · {SIZE_INCHES[size]}</span>
              <span className="gl-size-picker-price">{formatPrice(sizePrice(sizes, size))}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
