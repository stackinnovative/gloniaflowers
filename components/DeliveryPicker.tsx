"use client";

import type { DeliverySlot } from "@/lib/site";
import type { Method } from "@/lib/whatsapp";
import "./ProductControls.css";

const METHODS: { id: Method; label: string }[] = [
  { id: "delivery", label: "Delivery" },
  { id: "pickup", label: "Pick up from store" },
];

type DeliveryPickerProps = {
  method: Method;
  date: string;
  /** Slots still open for the chosen date (today hides those that are too soon). */
  slots: readonly DeliverySlot[];
  slot: DeliverySlot;
  cardMessage: string;
  cardEnabled: boolean;
  minDate: string;
  error?: string;
  onMethodChange: (value: Method) => void;
  onDateChange: (value: string) => void;
  onSlotChange: (value: DeliverySlot) => void;
  onMessageChange: (value: string) => void;
};

export function DeliveryPicker({
  method,
  date,
  slots,
  slot,
  cardMessage,
  cardEnabled,
  minDate,
  error,
  onMethodChange,
  onDateChange,
  onSlotChange,
  onMessageChange,
}: DeliveryPickerProps) {
  return (
    <div className="gl-detail-delivery">
      <div className="gl-detail-method" role="group" aria-label="Delivery or pickup">
        {METHODS.map((option) => (
          <button
            key={option.id}
            type="button"
            className="gl-detail-method-option"
            aria-pressed={method === option.id}
            onClick={() => onMethodChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="gl-detail-delivery-row">
        <label className="gl-detail-delivery-label" htmlFor="delivery-date">
          Date
          <input
            type="date"
            id="delivery-date"
            name="delivery-date"
            required
            min={minDate}
            value={date}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "delivery-date-error" : undefined}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>
        <label className="gl-detail-delivery-label" htmlFor="delivery-slot">
          Time
          <select
            id="delivery-slot"
            name="delivery-slot"
            value={slots.length ? slot : ""}
            disabled={!slots.length}
            onChange={(event) => {
              const nextSlot = slots.find((option) => option === event.target.value);
              if (nextSlot) onSlotChange(nextSlot);
            }}
          >
            {slots.length
              ? slots.map((option) => <option key={option} value={option}>{option}</option>)
              : <option value="">No times left on this day</option>}
          </select>
        </label>
      </div>
      {error && <p id="delivery-date-error" className="gl-detail-delivery-error" role="alert">{error}</p>}
      {cardEnabled && (
        <label className="gl-detail-delivery-label" htmlFor="card-message">
          Message for the card
          <textarea
            id="card-message"
            name="card-message"
            rows={2}
            maxLength={500}
            value={cardMessage}
            placeholder="Happy birthday, with love…"
            onChange={(event) => onMessageChange(event.target.value)}
          />
        </label>
      )}
    </div>
  );
}
