"use client";

import { CDN_URL } from "@/lib/config/cdn";
import type { FormEvent } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { GradientTitle, InlineText, LinkedText } from "@/components/sections/InlineText";
import type { ContactFormSection, FaqSection, TestimonialSliderSection } from "@/lib/sections";
import ReviewBadge from "@/components/reviews/ReviewBadge";
import ContactSelect from "@/components/contact/ContactSelect";
import { useStaggeredReveal } from "@/components/home/hooks/useStaggeredReveal";
import { submitEzForm } from "@/lib/ezforms";
import { CONTACT_FIELDS, CONTACT_TEXT, orDefault } from "@/lib/form-defaults";

function ContactReviewRow({ className = "" }: { className?: string }) {
  return (
    <div className={`contact-review-row ${className}`}>
      <ReviewBadge
        icon={`${CDN_URL}/images/cont-google-icon.svg`}
        label="Google Reviews"
      />
      <span className="contact-review-divider" aria-hidden="true" />
      <ReviewBadge
        icon={`${CDN_URL}/images/cont-clutch-icon.svg`}
        label="Clutch Reviews"
        iconWidth={31}
      />
    </div>
  );
}

/** Options fields hold one option per line. */
const linesOf = (text: string | null | undefined) =>
  (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const CONTACT_NAME_KEY = "contactName";

type FieldKey = keyof typeof CONTACT_FIELDS;

/** A field's wording and settings from the CMS, each falling back to the original. */
function fieldOf(data: ContactFormSection, key: FieldKey) {
  const fallback: { label: string; placeholder: string; required?: boolean; hidden?: boolean } = CONTACT_FIELDS[key];
  const cms = (data[key] ?? {}) as { label?: string | null; placeholder?: string | null; required?: boolean | null; hidden?: boolean | null };
  return {
    label: orDefault(cms.label, fallback.label),
    placeholder: orDefault(cms.placeholder, fallback.placeholder),
    // Name, email and message are always shown and required.
    required: "required" in fallback ? orDefault(cms.required, true) : true,
    hidden: "hidden" in fallback ? cms.hidden === true : false,
  };
}

function ContactForm({ data }: { data: ContactFormSection }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const service = fieldOf(data, "serviceField");
  const message = fieldOf(data, "messageField");
  const budget = fieldOf(data, "budgetField");
  const referral = fieldOf(data, "referralField");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      await submitEzForm("contact", values);
      window.localStorage.setItem(CONTACT_NAME_KEY, String(values.firstName || ""));
      router.push(data.successPath || "/thank-you");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="contact-enquiry-form" onSubmit={handleSubmit}>
      {(["nameField", "emailField", "phoneField"] as const).map((key) => {
        const field = fieldOf(data, key);
        if (field.hidden) return null;
        const input = { nameField: ["firstName", "text"], emailField: ["email", "email"], phoneField: ["phoneNumber", "tel"] }[key];
        return (
          <label key={key}>
            <span>{field.label}</span>
            <input name={input[0]} type={input[1]} placeholder={field.placeholder} required={field.required} />
          </label>
        );
      })}
      {!service.hidden && (
        <label>
          <span>{service.label}</span>
          <ContactSelect name="serviceType" placeholder={service.placeholder} options={linesOf(data.serviceOptions)} required={service.required} />
        </label>
      )}
      <label>
        <span>{message.label}</span>
        <textarea name="message" placeholder={message.placeholder} rows={4} required />
      </label>
      {!budget.hidden && (
        <label>
          <span>{budget.label}</span>
          <ContactSelect name="budget" placeholder={budget.placeholder} options={linesOf(data.budgetOptions)} required={budget.required} />
        </label>
      )}
      {!referral.hidden && (
        <label>
          <span>{referral.label}</span>
          <ContactSelect name="hearAboutUs" placeholder={referral.placeholder} options={linesOf(data.referralOptions)} required={referral.required} />
        </label>
      )}

      <label className="contact-enquiry-consent">
        <input name="getUpdate" type="checkbox" defaultChecked={orDefault(data.consentChecked, CONTACT_TEXT.consentChecked)} />
        <span className="contact-enquiry-consent-text">
          <LinkedText text={orDefault(data.consentText, CONTACT_TEXT.consentText)} />
        </span>
      </label>

      <Button
        type="submit"
        font="sans"
        className="contact-submit-btn"
        disabled={status === "submitting"}
      >
        <span className="flex items-center gap-[6px]">
          {status === "submitting" ? "Sending…" : orDefault(data.submitLabel, CONTACT_TEXT.submitLabel)}
          {status !== "submitting" && (
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-[1px]"
            >
              <path
                d="M2.5 7h9M7.5 3.5 11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </Button>

      <div className="contact-form-status" aria-live="polite">
        {status === "error" ? orDefault(data.errorMessage, CONTACT_TEXT.errorMessage) : null}
      </div>
    </form>
  );
}

function TestimonialSlider({ items }: { items: TestimonialSliderSection["items"] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const testimonial = items[activeIndex] ?? items[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReverse(false);
      setActiveIndex((index) => (index + 1) % items.length);
    }, 25_000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, items.length]);

  const showTestimonial = (index: number) => {
    if (index === activeIndex) return;
    setReverse(index < activeIndex);
    setActiveIndex(index);
  };

  return (
    <aside className="contact-testimonial-slider">
      {/* Figma decorative background blobs — aria-hidden, pointer-events-none */}
      {/* <div className="ts-blob ts-blob-1" aria-hidden="true" />
      <div className="ts-blob ts-blob-2" aria-hidden="true" />
      <div className="ts-blob ts-blob-3" aria-hidden="true" /> */}

      <ContactReviewRow />

      <div className="contact-testimonial-avatars" role="tablist">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={item.name}
              type="button"
              role="tab"
              className={isActive ? "is-active" : ""}
              aria-selected={isActive}
              aria-label={`Show testimonial from ${item.name}`}
              onClick={() => showTestimonial(index)}
            >
              <Image
                src={item.image?.url ?? ""}
                alt=""
                width={60}
                height={60}
                unoptimized
              />
              {isActive ? (
                <svg
                  key={`progress-${activeIndex}`}
                  viewBox="0 0 66 66"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="contact-avatar-ring-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="28%" stopColor="#060A6A" />
                      <stop offset="56%" stopColor="#75BAFF" />
                      <stop offset="97%" stopColor="#131ACA" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="33"
                    cy="33"
                    r="32"
                    stroke="url(#contact-avatar-ring-gradient)"
                  />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>

      {testimonial ? (
      <div
        className={`contact-testimonial-copy${reverse ? " is-reverse" : ""}`}
        key={testimonial.name}
        role="tabpanel"
      >
        <h2>
          <strong>{testimonial.name}</strong>
          <span aria-hidden="true"> • </span>
          {testimonial.company}
        </h2>
        <h3>{testimonial.role}</h3>
        <blockquote>“{testimonial.quote}”</blockquote>
      </div>
      ) : null}

      <div className="contact-testimonial-controls">
        <Link href="/testimonials" className="contact-testimonials-link link-sweep">
          View All Testimonials
          <span aria-hidden="true">
            <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.56353 5.39583L0.169428 1.00173C0.0535385 0.885842 -0.00289931 0.747882 0.000114592 0.587852C0.00312849 0.427822 0.0625805 0.289819 0.178468 0.173833C0.294357 0.057944 0.432317 0 0.592344 0C0.752371 0 0.890379 0.057944 1.00636 0.173833L5.47222 4.64873C5.5776 4.75421 5.65572 4.87239 5.70657 5.00325C5.75751 5.13411 5.78299 5.26497 5.78299 5.39583C5.78299 5.52669 5.75751 5.65755 5.70657 5.78842C5.65572 5.91928 5.5776 6.03745 5.47222 6.14294L0.997323 10.6179C0.881435 10.7338 0.744983 10.7902 0.587969 10.7872C0.430858 10.7842 0.294357 10.7247 0.178468 10.6088C0.0625805 10.493 0.0046354 10.355 0.0046354 10.195C0.0046354 10.0349 0.0625805 9.89685 0.178468 9.78085L4.56353 5.39583Z" fill="#1C1B1F" />
            </svg>
          </span>
        </Link>
      </div>
    </aside>
  );
}

/** FAQ accordion (sections.faq). */
export function ContactFaqs({ data }: { data: FaqSection }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  useStaggeredReveal(sectionRef, ".cont-faqs-item");

  return (
    <section className="cont-faqs" ref={sectionRef}>
      <div className="section-container">
        <div className="cont-faqs-inn">
          <h2>{data.title}</h2>
          <div className="cont-faqs-items">
            {data.items.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `contact-faq-${index}`;

              return (
                <article
                  key={faq.question}
                  className={`cont-faqs-item${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <span className="contact-faq-icon" aria-hidden="true" />
                  </button>
                  <div id={panelId} className="contact-faq-answer">
                    <div className="contact-faq-answer-inner">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const subscribeToNothing = () => () => {};

function useStoredFirstName() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => (window.localStorage.getItem(CONTACT_NAME_KEY) || "").trim().split(" ")[0],
    () => ""
  );
}

function ThankYouMessage({ data }: { data: ContactFormSection }) {
  const firstName = useStoredFirstName();
  // "{name}" in the title becomes ", <first name>" when the visitor gave one.
  const title = (data.thankYouTitle ?? "").replace("{name}", firstName ? `, ${firstName}` : "");

  return (
    <>
      <h1>
        <GradientTitle text={title} immediate className="zuse-display-gradient" />
      </h1>
      <p className="contact-form-lead">
        <InlineText text={data.thankYouText} />
      </p>
    </>
  );
}

/**
 * Contact form with the quote slider beside it (sections.contact-form, paired
 * with the page's sections.testimonial-slider). On the thank-you page the form
 * is replaced by the section's thank-you message.
 */
export function ContactFormBlock({
  form,
  slider,
  thankYou = false,
}: {
  form: ContactFormSection;
  slider?: TestimonialSliderSection | null;
  thankYou?: boolean;
}) {
  return (
    <section className="contact-form-n-slider">
      <div className="section-container">
        <div className="contact-form-n-slider_inn">
          <div className="contact-form-n-slider_form">
            {thankYou ? (
              <ThankYouMessage data={form} />
            ) : (
              <>
                <h1>
                  <GradientTitle text={form.title} immediate className="zuse-display-gradient" />
                </h1>
                <p className="contact-form-lead">
                  <InlineText text={form.description} />
                </p>
                <ContactForm data={form} />
              </>
            )}
          </div>
          {slider?.items.length ? <TestimonialSlider items={slider.items} /> : null}
        </div>
      </div>
    </section>
  );
}

/** Quote slider on its own (a testimonial-slider section not paired with a contact form). */
export function TestimonialSliderBlock({ data }: { data: TestimonialSliderSection }) {
  if (!data.items.length) return null;
  return (
    <section className="contact-form-n-slider">
      <div className="section-container">
        <div className="contact-form-n-slider_inn">
          <TestimonialSlider items={data.items} />
        </div>
      </div>
    </section>
  );
}
