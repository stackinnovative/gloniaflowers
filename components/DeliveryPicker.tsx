"use client";

import { deliverySlots, type DeliverySlot } from "@/lib/site";
import "./ProductControls.css";

type DeliveryPickerProps = {
  date: string;
  slot: DeliverySlot;
  cardMessage: string;
  cardEnabled: boolean;
  minDate: string;
  error?: string;
  onDateChange: (value: string) => void;
  onSlotChange: (value: DeliverySlot) => void;
  onMessageChange: (value: string) => void;
};

export function DeliveryPicker({
  date,
  slot,
  cardMessage,
  cardEnabled,
  minDate,
  error,
  onDateChange,
  onSlotChange,
  onMessageChange,
}: DeliveryPickerProps) {
  return (
    <div className="gl-detail-delivery">
      <div className="gl-detail-delivery-row">
        <label className="gl-detail-delivery-label" htmlFor="delivery-date">
          Delivery date
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
          Delivery time
          <select
            id="delivery-slot"
            name="delivery-slot"
            value={slot}
            onChange={(event) => {
              const nextSlot = deliverySlots.find((option) => option === event.target.value);
              if (nextSlot) onSlotChange(nextSlot);
            }}
          >
            {deliverySlots.map((option) => <option key={option} value={option}>{option}</option>)}
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
