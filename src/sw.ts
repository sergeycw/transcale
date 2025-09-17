console.log('Unit Autoconverter service worker loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});
