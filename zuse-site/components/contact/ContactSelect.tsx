"use client";

import { useEffect, useId, useRef, useState } from "react";

type ContactSelectProps = {
  name: string;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
  /** Bump to clear selection after successful submit */
  resetKey?: number;
};

export default function ContactSelect({
  name,
  placeholder,
  options,
  required = false,
  resetKey = 0,
}: ContactSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
    setOpen(false);
  }, [resetKey]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (option: string) => {
    setValue(option);
    setOpen(false);
    if (selectRef.current) {
      selectRef.current.value = option;
      selectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  return (
    <div
      ref={rootRef}
      className={`contact-select${open ? " is-open" : ""}${value ? " has-value" : ""}`}
    >
      {/* Native select for form submit + HTML5 required validation */}
      <select
        ref={selectRef}
        name={name}
        required={required}
        value={value}
        tabIndex={-1}
        aria-hidden="true"
        className="contact-select-native"
        onChange={(event) => setValue(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="contact-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((prev) => !prev);
          selectRef.current?.setCustomValidity("");
        }}
      >
        <span className="contact-select-value">{value || placeholder}</span>
      </button>

      {open ? (
        <ul id={listId} className="contact-select-menu" role="listbox">
          {options.map((option) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                className={`contact-select-option${value === option ? " is-selected" : ""}`}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
