// react to installation
chrome.runtime.onInstalled.addListener((_reason) => {
  showSplash();
});

// react to the extension being clicked
chrome.action.onClicked.addListener((tab) => {
  showSplash();
});

function showSplash(info, tab) {
  let url = chrome.runtime.getURL('manager.html');
  chrome.tabs.create({ url });
}
