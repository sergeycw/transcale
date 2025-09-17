import { walkAndAnnotate, startObserver } from './dom';

// initialization and observation
function initExtension(): void {
  if (document.body) {
    walkAndAnnotate(document.body);
    startObserver();
  } else {
    // wait for DOM loading
    document.addEventListener('DOMContentLoaded', () => {
      walkAndAnnotate(document.body);
      startObserver();
    });
  }
}

initExtension();