import * as React from 'react';
import { Badge, Box, Button, Flex, Typography, ProgressBar } from '@strapi/design-system';

const STATUS_LABELS = {
  idle: 'Not Generated',
  generating: 'Generating…',
  done: 'Audio Ready',
  failed: 'Failed',
};

const badgeVariant = (status) => {
  if (status === 'done') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'generating') return 'secondary';
  return 'default';
};

const fetchStatus = async (documentId) => {
  try {
    const res = await fetch(`/api/blogs/${documentId}/audio-status`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    return { status: data.ttsStatus || 'idle', progress: data.ttsProgress || null };
  } catch (_) {
    return null;
  }
};

const computePct = (progress) => {
  if (!progress?.totalChunks || !progress?.totalVoices) return null;
  const total = progress.totalChunks * progress.totalVoices;
  const done = (progress.currentVoice - 1) * progress.totalChunks + (progress.chunk || 0);
  return Math.min(100, Math.round((done / total) * 100));
};

const PanelContent = ({ documentId }) => {
  const [state, setState] = React.useState({ status: 'idle', progress: null });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    let timer = null;

    const tick = async () => {
      const result = await fetchStatus(documentId);
      if (cancelled || !result) return;
      setState(result);
      if (result.status === 'generating') {
        timer = setTimeout(tick, 3000);
      }
    };
    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [documentId]);

  const generate = async () => {
    setBusy(true);
    setError(null);
    setState({ status: 'generating', progress: { message: 'Starting audio generation…' } });
    try {
      const res = await fetch(`/api/blogs/${documentId}/generate-audio-elevenlabs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `HTTP ${res.status}`;
        setError(msg);
        setState({ status: 'failed', progress: { message: msg } });
        return;
      }
      // Begin polling for progress.
      const poll = async () => {
        const result = await fetchStatus(documentId);
        if (!result) return;
        setState(result);
        if (result.status === 'generating') {
          setTimeout(poll, 3000);
        }
      };
      poll();
    } catch (err) {
      setError(err.message || 'Network error');
      setState({ status: 'failed', progress: { message: err.message } });
    } finally {
      setBusy(false);
    }
  };

  const { status, progress } = state;
  const pct = status === 'generating' ? computePct(progress) : null;
  const generating = status === 'generating';

  return (
    <Flex direction="column" gap={3} alignItems="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Typography variant="pi" textColor="neutral600">Status</Typography>
        <Badge variant={badgeVariant(status)}>{STATUS_LABELS[status] || STATUS_LABELS.idle}</Badge>
      </Flex>

      {pct !== null && (
        <Box>
          <ProgressBar value={pct} />
        </Box>
      )}

      {progress?.message && (status === 'generating' || status === 'failed') && (
        <Typography variant="pi" textColor={status === 'failed' ? 'danger600' : 'neutral700'}>
          {progress.message}
        </Typography>
      )}

      {status === 'done' && (
        <Typography variant="pi" textColor="success600">Audio generated successfully.</Typography>
      )}

      {error && status !== 'failed' && (
        <Typography variant="pi" textColor="danger600">{error}</Typography>
      )}

      <Button
        onClick={generate}
        loading={busy || generating}
        disabled={busy || generating}
        variant="secondary"
        fullWidth
      >
        {status === 'done' ? 'Regenerate Audio' : 'Generate Audio'}
      </Button>
    </Flex>
  );
};

const AudioGenerationPanel = ({ model, document, documentId }) => {
  if (model !== 'api::blog.blog') return null;
  if (!documentId || !document?.id) return null;

  return {
    title: 'Audio Generation',
    content: <PanelContent documentId={document.id} />,
  };
};

export default AudioGenerationPanel;
