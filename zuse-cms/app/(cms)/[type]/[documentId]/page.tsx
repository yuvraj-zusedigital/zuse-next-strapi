import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentType } from "@/lib/strapi";
import { EditorPage } from "../editor-page";

export async function generateMetadata({ params }: PageProps<"/[type]/[documentId]">): Promise<Metadata> {
  const type = await getContentType((await params).type);
  return { title: type ? `Edit ${type.displayName.toLowerCase()}` : undefined };
}

export default async function EditEntryPage({ params }: PageProps<"/[type]/[documentId]">) {
  const { type: slug, documentId } = await params;
  const type = await getContentType(slug);
  if (!type || type.kind !== "collectionType") notFound();
  return <EditorPage slug={slug} documentId={documentId} />;
}
