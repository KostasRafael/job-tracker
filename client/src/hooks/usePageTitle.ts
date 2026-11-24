import { useEffect } from 'react';

const APP_NAME = 'Job Tracker';

// Sets the browser tab title, e.g. usePageTitle('Board') gives "Board | Job Tracker".
// Tab titles show up in browser history and are the first thing a screen reader
// announces after navigating, so every page should call this.
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
  }, [title]);
}
