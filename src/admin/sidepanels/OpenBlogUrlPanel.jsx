import * as React from 'react';
import { LinkButton } from '@strapi/design-system';
import { ExternalLink } from '@strapi/icons';

import { fetchOrgSettings } from './orgSettings';

const PanelContent = ({ slug }) => {
  const [url, setUrl] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    fetchOrgSettings().then((settings) => {
      if (cancelled) return;
      setUrl(`${settings.siteUrl}${settings.blogBasePath}/${slug}`);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!url) return null;

  return (
    <LinkButton
      href={url}
      isExternal
      startIcon={<ExternalLink />}
      variant="secondary"
      style={{ width: '100%', justifyContent: 'center' }}
    >
      Open Blog URL
    </LinkButton>
  );
};

const OpenBlogUrlPanel = ({ model, document }) => {
  if (model !== 'api::blog.blog') return null;
  const slug = document?.slug;
  const published = Boolean(document?.publishedAt);
  if (!slug || !published) return null;

  return {
    title: 'Open Blog URL',
    content: <PanelContent slug={slug} />,
  };
};

export default OpenBlogUrlPanel;
