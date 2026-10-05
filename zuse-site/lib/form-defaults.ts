/**
 * Wording of the contact form and the subscribe box when the CMS leaves a
 * field empty — the site's original text, so an empty field never shows a
 * blank label. Also the built-in page content (content/pages) seeds from here.
 */

import type { ContactFormSection, SubscribeFormSection } from "@/lib/sections";

export const CONTACT_FIELDS = {
  nameField: { label: "Full Name", placeholder: "Your name" },
  emailField: { label: "Email address", placeholder: "Your email" },
  phoneField: { label: "Phone number", placeholder: "Type", required: true, hidden: false },
  serviceField: { label: "Service Type", placeholder: "Select a service type", required: true, hidden: false },
  messageField: { label: "Your message", placeholder: "Need a new Website? An App? Let us know how we can help." },
  budgetField: { label: "Budget", placeholder: "Select your budget", required: true, hidden: false },
  referralField: { label: "How did you hear about us?", placeholder: "Select the medium", required: true, hidden: false },
} satisfies Partial<ContactFormSection>;

export const CONTACT_TEXT = {
  consentText:
    "Stay updated with Zuse! Discover the latest on our services, \nprojects, news, and events. Unsubscribe anytime. Read our [Privacy Policy](/privacy-policy).",
  consentChecked: true,
  submitLabel: "Submit",
  errorMessage: "Something went wrong. Please email hello@zusedigital.com.",
} satisfies Partial<ContactFormSection>;

export const SUBSCRIBE_DEFAULTS = {
  __component: "sections.subscribe-form",
  title: "Subscribe to Zuse Digital Blog",
  description: "Practical AI, web design and SEO articles in your inbox.",
  namePlaceholder: "Full name",
  emailPlaceholder: "name@company.com.au",
  requireFullName: true,
  buttonLabel: "Subscribe",
  successTitle: "Thanks for subscribing!",
  successText: "Fresh insights will be heading to your inbox.",
  errorMessage: "Something went wrong. Please try again.",
} satisfies SubscribeFormSection;

/** The CMS value, or the default when it's empty (null, undefined or blank). */
export const orDefault = <T,>(value: T | null | undefined, fallback: T): T =>
  value === null || value === undefined || (typeof value === "string" && !value.trim()) ? fallback : value;
