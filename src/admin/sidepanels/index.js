import OpenBlogUrlPanel from './OpenBlogUrlPanel';
import AudioGenerationPanel from './AudioGenerationPanel';
import AiSummaryPanel from './AiSummaryPanel';

export const registerSidePanels = (app) => {
  const cm = app.getPlugin('content-manager');
  if (!cm?.apis?.addEditViewSidePanel) return;
  cm.apis.addEditViewSidePanel((panels) => [
    ...panels,
    OpenBlogUrlPanel,
    AudioGenerationPanel,
    AiSummaryPanel,
  ]);
};
