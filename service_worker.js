const ENABLE_KEY = 'enabled';
const SITES_KEY  = 'sites';

function isBlocked(url, list) {
  try {
    const host = new URL(url).hostname;
    return list.some(site => host === site || host.endsWith('.' + site));
  } catch { return false; }
}

chrome.webNavigation.onBeforeNavigate.addListener(async ({tabId, url, frameId}) => {
  if (frameId !== 0) return; // main frame only

  const { [ENABLE_KEY]: enabled = true, [SITES_KEY]: sites = [] } =
        await chrome.storage.sync.get({ [ENABLE_KEY]: true, [SITES_KEY]: [] });

  if (!enabled || !isBlocked(url, sites)) return;

  const target = chrome.runtime.getURL('intermediate.html?url=' + encodeURIComponent(url));
  chrome.tabs.update(tabId, { url: target });
});