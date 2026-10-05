/**
 * Built-in content of the legal pages (fallback until the Strapi page has
 * sections; also the source for scripts/cms-seed-pages.js). Each "## " heading
 * starts a section of the legal layout.
 */

import { md } from "@/lib/blocks";
import type { PageDefaults } from "@/lib/pages";

export const privacyPolicy: PageDefaults = {
  slug: "privacy-policy",
  path: "/privacy-policy",
  name: "Privacy Policy",
  sections: [
    { __component: "sections.page-intro", title: "Privacy Policy" },
    {
      __component: "sections.rich-text",
      body: md(`
## Introduction

Zuse Digital Pty LTD (“we”, “us”, or “our”) provides website design, mobile app design, web application development, e-commerce design, and related digital services. Our headquarters is located in Victoria, Australia.

This Privacy Policy explains how we collect, use, store, and protect personal information when you use zusedigital.com or engage with our services.

## Who is the Data Controller?

The data controller is Zuse Digital Pty LTD, Victoria, Australia.

## Information You Give Us

We collect personal identification information such as your name, email address, phone number, and any other information you voluntarily provide through forms, email, telephone, or social media.

## Information We Collect Automatically

We may collect information about your visit, including URLs, visit dates and times, pages viewed, response times, download errors, visit duration, and interactions such as scrolling, clicks, and mouse movements.

## How We Collect Your Data

- When you contact us about business, employment, sponsorship, media, or other enquiries.
- When you submit information through forms on our Website.
- Through analytics and other third-party services used to operate and improve the Website.

## How We Use Your Data

We use personal information only for compatible business development, service delivery, employment, communication, security, and analytical purposes.

Information submitted in an enquiry may be stored and used to respond to you, prepare proposals, manage client relationships, and improve our services.

## Employment Information

When considering candidates, we may process information you provide and information obtained from professional sources such as LinkedIn and employment websites.

## Cookies and Analytics

We use necessary and performance cookies to operate the Website and understand how it is used. We may use services such as Google Analytics to collect aggregated visitor and usage information.

You can control cookies through your browser settings, although disabling necessary cookies may affect Website functionality.

## Data Retention

We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, to meet legal obligations, and to resolve disputes. You may request deletion by contacting us.

## Information Security

We use reasonable physical, technical, and administrative safeguards to protect personal information.

- Maintaining and testing security technology.
- Restricting personal data access to authorised personnel.
- Selecting service providers with appropriate privacy and security practices.
- Training team members on data protection responsibilities.

## Your Privacy Rights

Subject to applicable law, you may request access to, correction of, deletion of, restriction of, or portability of your personal data. You may also object to certain processing or withdraw consent where processing relies on consent.

## How to Contact Us

For questions, complaints, or requests concerning your personal information, email [hello@zusedigital.com](mailto:hello@zusedigital.com).

## Changes to This Privacy Policy

We may update this Privacy Policy to reflect changes to our practices, services, or legal obligations. We encourage you to review it periodically to remain informed about how we handle personal information.
`),
    },
  ],
};

export const termsOfUse: PageDefaults = {
  slug: "terms-of-use",
  path: "/terms-of-use",
  name: "Terms of Use",
  sections: [
    { __component: "sections.page-intro", title: "Terms of Use" },
    {
      __component: "sections.rich-text",
      body: md(`
## Agreement to Terms

These Terms of Use constitute a legally binding agreement between you and Zuse Digital Pty LTD (“Company”, “we”, “us”, or “our”) concerning your access to and use of zusedigital.com and any related services (collectively, the “Site”). By accessing the Site, you confirm that you have read, understood, and agreed to be bound by these Terms.

We may update these Terms from time to time. Changes take effect when posted, and your continued use of the Site constitutes acceptance of the revised Terms.

## Intellectual Property Rights

Unless otherwise indicated, the Site and its source code, functionality, software, designs, text, photographs, graphics, trademarks, and logos are owned by or licensed to us and are protected by applicable intellectual property laws.

You may access the Site for personal, non-commercial use. No part of the Site may be copied, reproduced, republished, distributed, sold, licensed, or otherwise exploited without our prior written permission.

## User Representations

By using the Site, you represent that you have the legal capacity to agree to these Terms, that your use is lawful, and that you will not access the Site through unauthorised automated means.

## Prohibited Activities

You may use the Site only for the purposes for which it is made available. You agree not to:

- Systematically retrieve or compile Site data without written permission.
- Circumvent or interfere with security-related features of the Site.
- Use automated scripts, robots, scrapers, or data-mining tools without authorisation.
- Upload malicious code or material that disrupts the Site.
- Impersonate another person, mislead users, or submit false information.
- Use the Site in violation of any applicable law or regulation.

## Site Management

We reserve the right, but not the obligation, to monitor the Site for violations, restrict access, remove burdensome or unlawful content, and otherwise manage the Site to protect our rights and ensure its proper operation.

## Term and Termination

These Terms remain in effect while you use the Site. We may deny access to, suspend, or terminate use of the Site where these Terms or applicable laws are breached.

## Modifications and Interruptions

We may change, suspend, or discontinue any part of the Site without notice. We cannot guarantee uninterrupted availability and are not liable for loss or inconvenience caused by downtime, maintenance, or discontinuance.

## Governing Law

These Terms are governed by the laws of Victoria, Australia. You and Zuse Digital Pty LTD consent to the jurisdiction of the courts of Victoria for disputes arising in connection with these Terms.

## Disclaimer

The Site is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we disclaim warranties relating to accuracy, availability, merchantability, fitness for a particular purpose, and non-infringement.

## Limitations of Liability

To the fullest extent permitted by law, Zuse Digital Pty LTD and its directors, employees, and agents will not be liable for indirect, consequential, exemplary, incidental, special, or punitive damages arising from use of the Site.

## Contact Us

Questions about these Terms may be sent to [hello@zusedigital.com](mailto:hello@zusedigital.com).
`),
    },
  ],
};
