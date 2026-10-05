/**
 * Extra columns in a type's list view, beyond the title, status and date.
 * Values come from Strapi (`columns=` on the list request; plain text fields only).
 */
export type ListColumn = { field: string; label: string; mono?: boolean };

export const LIST_COLUMNS: Record<string, { titleLabel?: string; titleAsToken?: boolean; intro?: string; columns: ListColumn[] }> = {
  // Shown as {name}, exactly how it's written in content.
  "text-snippet": {
    titleLabel: "Snippet",
    titleAsToken: true,
    intro: "Write a snippet's name in curly brackets, e.g. {phone}, in any text on the site and it shows the value. Changing a value here updates the live site straight away. {year} is built in.",
    columns: [
      { field: "label", label: "Label" },
      { field: "value", label: "Value" },
    ],
  },
};
