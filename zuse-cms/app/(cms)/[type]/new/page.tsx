import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentType } from "@/lib/strapi";
import { EditorPage } from "../editor-page";

export async function generateMetadata({ params }: PageProps<"/[type]/new">): Promise<Metadata> {
  const type = await getContentType((await params).type);
  return { title: type ? `New ${type.displayName.toLowerCase()}` : undefined };
}

export default async function NewEntryPage({ params }: PageProps<"/[type]/new">) {
  const { type: slug } = await params;
  const type = await getContentType(slug);
  if (!type || type.kind !== "collectionType") notFound();
  return <EditorPage slug={slug} documentId="new" />;
}
