export type StrapiMetaSocial = {
  socialNetwork?: string;
  title?: string;
  description?: string;
  image?: { url?: string } | null;
};

export type StrapiSeoSocial = {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: { url?: string } | null;
  metaSocial?: StrapiMetaSocial[] | null;
};

function findMetaSocial(
  metaSocial: StrapiMetaSocial[] | null | undefined,
  network: string
): StrapiMetaSocial | null {
  if (!Array.isArray(metaSocial)) return null;
  return (
    metaSocial.find(
      (e) => e?.socialNetwork?.toLowerCase() === network.toLowerCase()
    ) || null
  );
}

/**
 * Resolve Open Graph + Twitter fields from Strapi SEO.
 * Facebook → OG, Twitter → twitter cards, with fallbacks to
 * metaTitle / metaDescription.
 *
 * Image priority (temporary): local `fallbacks.image` wins over Strapi
 * `metaImage` / metaSocial images so Socialthumbnails ship until CMS
 * assets are updated for production.
 */
export function resolveSocialMetadata(
  seo: StrapiSeoSocial | null | undefined,
  fallbacks: {
    title: string;
    description: string;
    image: string;
  }
) {
  const facebook = findMetaSocial(seo?.metaSocial, "Facebook");
  const twitter = findMetaSocial(seo?.metaSocial, "Twitter");
  const image =
    fallbacks.image ||
    facebook?.image?.url ||
    twitter?.image?.url ||
    seo?.metaImage?.url ||
    "";

  return {
    openGraph: {
      title: facebook?.title || seo?.metaTitle || fallbacks.title,
      description:
        facebook?.description || seo?.metaDescription || fallbacks.description,
      image,
    },
    twitter: {
      title: twitter?.title || seo?.metaTitle || fallbacks.title,
      description:
        twitter?.description || seo?.metaDescription || fallbacks.description,
      image,
    },
  };
}
