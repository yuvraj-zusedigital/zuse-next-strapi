"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";
import { submitEzForm } from "@/lib/ezforms";
import { orDefault, SUBSCRIBE_DEFAULTS } from "@/lib/form-defaults";
import type { SubscribeFormSection } from "@/lib/sections";

/** Newsletter sign-up (sections.subscribe-form); empty CMS fields use the original wording. */
export default function BlogSubscribe({ data }: { data?: SubscribeFormSection | null }) {
  const text = <K extends keyof typeof SUBSCRIBE_DEFAULTS>(key: K) =>
    orDefault<(typeof SUBSCRIBE_DEFAULTS)[K]>(data?.[key] as (typeof SUBSCRIBE_DEFAULTS)[K] | null | undefined, SUBSCRIBE_DEFAULTS[key]);
  const requireFullName = data?.requireFullName !== false;
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") || "").trim();
    const [firstName = "", ...lastNameParts] = fullName.split(/\s+/);
    const values = {
      firstName,
      lastName: lastNameParts.join(" "),
      email: String(formData.get("email") || ""),
    };

    try {
      await submitEzForm("sub", values);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="zuse-blog-subscribe" aria-labelledby="blog-subscribe-title">
      <div className="zuse-blog-subscribe-inner">
        {status !== "success" ? (
          <div className="zuse-blog-subscribe-copy">
            <h2 id="blog-subscribe-title">{text("title")}</h2>
            {text("description") ? <p>{text("description")}</p> : null}
          </div>
        ) : null}

        {status === "success" ? (
          <div
            className="zuse-blog-subscribe-success"
            role="status"
            aria-live="polite"
          >
            <h3 id="blog-subscribe-title">{text("successTitle")}</h3>
            <p>{text("successText")}</p>
          </div>
        ) : (
          <div className="zuse-blog-subscribe-form-wrap">
            <form className="zuse-blog-subscribe-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="blog-subscriber-name">
                Full name
              </label>
              <input
                id="blog-subscriber-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder={text("namePlaceholder")}
                pattern={requireFullName ? String.raw`.*\S+\s+\S+.*` : undefined}
                title={requireFullName ? "Please enter both your first and last name" : undefined}
                required
              />

              <label className="sr-only" htmlFor="blog-subscriber-email">
                Email address
              </label>
              <input
                id="blog-subscriber-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={text("emailPlaceholder")}
                required
              />

              <Button
                type="submit"
                variant="secondary"
                className="zuse-blog-subscribe-button"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Subscribing…" : text("buttonLabel")}
              </Button>
            </form>
            {status === "error" ? (
              <p className="zuse-blog-subscribe-error" role="alert">
                {text("errorMessage")}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
