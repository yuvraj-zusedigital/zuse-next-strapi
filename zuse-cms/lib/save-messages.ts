/**
 * What the "saved" notification says, so it's clear what happened and
 * whether the live site changed.
 */
export type SaveMessage = { title: string; description?: string };

const quote = (text: string, max = 60) => `“${text.length > max ? `${text.slice(0, max - 1)}…` : text}”`;

export function savedMessage(
  type: { slug: string; displayName: string; draftAndPublish: boolean },
  entry: Record<string, unknown> | null | undefined,
): SaveMessage {
  if (type.slug === "text-snippet" && entry && typeof entry.name === "string") {
    const value = typeof entry.value === "string" ? entry.value.trim() : "";
    return {
      title: `Snippet {${entry.name}} saved`,
      description: value
        ? `The site now shows ${quote(value)} wherever {${entry.name}} is used.`
        : `Its value is empty, so {${entry.name}} shows as nothing on the site.`,
    };
  }
  if (!type.draftAndPublish) return { title: `${type.displayName} saved`, description: "Live on the site now." };
  return { title: "Draft saved", description: "Not on the live site yet. Publish to update it." };
}
