const ENABLE_KEY = 'enabled';
const SITES_KEY  = 'sites';

// Remember the next allowed host per tab so we don't repeatedly
// redirect after the user chooses to continue to a blocked site.
const skipHostForTab = {};

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

  const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
  // Allow the navigation once if the user already confirmed it.
  if (skipHostForTab[tabId] === host) {
    delete skipHostForTab[tabId];
    return;
  }

  if (!enabled || !isBlocked(url, sites)) return;

  skipHostForTab[tabId] = host;
  const target = chrome.runtime.getURL('intermediate.html?url=' + encodeURIComponent(url));
  chrome.tabs.update(tabId, { url: target });
});
