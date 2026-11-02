import type * as React from 'react';
import {useEffect} from 'react';
import {useTheme} from '@emotion/react';

import {
  PictureInPicturePortal,
  PictureInPictureProvider,
  type PictureInPicturePortalProps,
} from '@sentry/scraps/pictureInPicture';

import {GlobalStyles} from 'sentry/styles/global';

function initializeWindow(pipWindow: Window) {
  pipWindow.document.body.className = document.body.className;
}

export function SentryPictureInPictureProvider({children}: {children: React.ReactNode}) {
  return (
    <PictureInPictureProvider onWindowOpen={initializeWindow}>
      {children}
    </PictureInPictureProvider>
  );
}

export function SentryPictureInPicturePortal({
  children,
  pipWindow,
}: PictureInPicturePortalProps) {
  const theme = useTheme();

  useEffect(() => {
    function syncBodyClasses() {
      // oxlint-disable-next-line react/immutability -- This adapter owns the external window's DOM.
      pipWindow.document.body.className = document.body.className;
    }
    syncBodyClasses();
    const observer = new MutationObserver(syncBodyClasses);
    observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
    return () => observer.disconnect();
  }, [pipWindow]);

  return (
    <PictureInPicturePortal pipWindow={pipWindow}>
      <GlobalStyles theme={theme} />
      {children}
    </PictureInPicturePortal>
  );
}
