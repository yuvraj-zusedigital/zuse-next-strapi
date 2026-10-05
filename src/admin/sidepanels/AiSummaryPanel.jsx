import * as React from 'react';
import { Badge, Box, Button, Flex, Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

// Admin-only routes (src/plugins/blog-tools); the admin client sends the session token.
const BASE = '/blog-tools/blogs';
const errorMessage = (err) => err?.response?.data?.error?.message || err?.message || 'Request failed';

const PanelContent = ({ documentId }) => {
  const [summary, setSummary] = React.useState(null);
  const [status, setStatus] = React.useState('idle');
  const [error, setError] = React.useState(null);
  const { get, post } = useFetchClient();

  React.useEffect(() => {
    let cancelled = false;
    get(`${BASE}/${documentId}/ai-summary`)
      .then(({ data: json }) => {
        if (cancelled) return;
        const existing = json?.data?.aiSummary || null;
        if (existing) {
          setSummary(existing);
          setStatus('done');
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [documentId, get]);

  const generate = async () => {
    setStatus('generating');
    setError(null);
    try {
      const { data: json } = await post(`${BASE}/${documentId}/generate-summary`);
      setSummary(json?.data?.aiSummary || '');
      setStatus('done');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('failed');
    }
  };

  const badgeVariant =
    status === 'done' ? 'success' : status === 'failed' ? 'danger' : status === 'generating' ? 'secondary' : 'default';
  const badgeText =
    status === 'done' ? 'Generated' : status === 'failed' ? 'Failed' : status === 'generating' ? 'Generating…' : 'Not Generated';
  const generating = status === 'generating';

  return (
    <Flex direction="column" gap={3} alignItems="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Typography variant="pi" textColor="neutral600">Status</Typography>
        <Badge variant={badgeVariant}>{badgeText}</Badge>
      </Flex>

      {summary && status === 'done' && (
        <Box
          padding={2}
          background="neutral100"
          hasRadius
          style={{ maxHeight: 220, overflowY: 'auto' }}
        >
          <Typography variant="pi" textColor="neutral800" style={{ whiteSpace: 'pre-wrap' }}>
            {summary}
          </Typography>
        </Box>
      )}

      {status === 'failed' && error && (
        <Typography variant="pi" textColor="danger600">{error}</Typography>
      )}

      <Button
        onClick={generate}
        loading={generating}
        disabled={generating}
        variant="secondary"
        fullWidth
      >
        {status === 'done' ? 'Regenerate AI Summary' : 'Generate AI Summary'}
      </Button>
    </Flex>
  );
};

const AiSummaryPanel = ({ model, document }) => {
  if (model !== 'api::blog.blog') return null;
  if (!document?.id) return null;

  return {
    title: 'AI Summary',
    content: <PanelContent documentId={document.id} />,
  };
};

export default AiSummaryPanel;
