import { EZFORMS_SUBMIT_URL } from "@/lib/config/strapi";
import { readEntries, TRACKING_KEY } from "@/lib/visit-tracking";

function getTrackingData() {
  return readEntries();
}

function getMelbourneTime() {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date())
    .replace(",", " at");
}

async function getCountry() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return "";

    const data = (await response.json()) as {
      country_name?: string;
      country?: string;
    };
    return data.country_name || data.country || "";
  } catch {
    return "";
  }
}

export async function submitEzForm(
  formName: string,
  values: Record<string, FormDataEntryValue>
) {
  const location = await getCountry();
  const endpoint =
    process.env.NODE_ENV === "development"
      ? "/api/ezforms/submit"
      : EZFORMS_SUBMIT_URL;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formData: {
        ...values,
        formName,
        pageUrl: window.location.href,
        device: navigator.userAgent,
        location,
        userTrackingData: getTrackingData(),
        screensize: `${window.innerWidth}X${window.innerHeight}`,
        fromSubmitTime: getMelbourneTime(),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status}`);
  }

  // Sent with this enquiry: start a fresh journey so the next form doesn't resend it.
  try {
    window.localStorage.removeItem(TRACKING_KEY);
  } catch {
    // Storage blocked: nothing to clear.
  }
}
