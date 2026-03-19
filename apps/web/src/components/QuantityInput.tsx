import React, { useState, useRef } from 'react';

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

interface QuantityInputProps {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export function QuantityInput({ value, onChange, min = 1, max = 9999 }: QuantityInputProps): React.JSX.Element {
  const [display, setDisplay] = useState(String(value));
  const debouncedChange = useRef(debounce((v: number) => onChange(v), 250)).current;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, (parseInt(display, 10) || 0) + delta));
    setDisplay(String(next));
    onChange(next); // steps fire immediately, no debounce
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplay(raw); // immediate display update
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      debouncedChange(parsed);
    }
  };

  return (
    <div className="qty-input">
      <button className="qty-input__btn" onClick={() => step(-1)} aria-label="Decrease">−</button>
      <input
        className="qty-input__field"
        type="number"
        min={min}
        max={max}
        value={display}
        onChange={handleChange}
        aria-label="Quantity"
      />
      <button className="qty-input__btn" onClick={() => step(1)} aria-label="Increase">+</button>
    </div>
  );
}
