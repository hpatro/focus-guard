const ENABLE_KEY = 'enabled';
const SITES_KEY  = 'sites';

// Remember the next allowed host per tab so we don't repeatedly
// redirect after the user chooses to continue to a blocked site.
// MV3 service workers may unload when idle, so keep this mapping in
// chrome.storage.session as well to survive restarts.
const skipHostForTab = {};
const SKIP_PREFIX = 'skip-';

function skipKey(tabId) {
  return SKIP_PREFIX + tabId;
}

async function setSkip(tabId, host) {
  skipHostForTab[tabId] = host;
  await chrome.storage.session.set({ [skipKey(tabId)]: host });
}

async function getSkip(tabId) {
  if (tabId in skipHostForTab) return skipHostForTab[tabId];
  const data = await chrome.storage.session.get(skipKey(tabId));
  if (data && data[skipKey(tabId)]) {
    skipHostForTab[tabId] = data[skipKey(tabId)];
    return data[skipKey(tabId)];
  }
  return undefined;
}

async function clearSkip(tabId) {
  delete skipHostForTab[tabId];
  await chrome.storage.session.remove(skipKey(tabId));
}

chrome.tabs.onRemoved.addListener((tabId) => {
  clearSkip(tabId);
});

function isBlocked(url, list) {
  try {
    const { hostname: host, pathname: path } = new URL(url);
    return list.some(site => {
      try {
        const normalized = site.includes('://') ? site : 'http://' + site;
        const { hostname: sHost, pathname: sPath } = new URL(normalized);

        const hostMatches = host === sHost || host.endsWith('.' + sHost);
        if (!hostMatches) return false;

        // If no path specified, any subpath should match
        if (!sPath || sPath === '/' ) return true;

        const base = sPath.endsWith('/') ? sPath : sPath + '/';
        return path === sPath || path.startsWith(base);
      } catch {
        return host === site || host.endsWith('.' + site);
      }
    });
  } catch { return false; }
}

chrome.webNavigation.onBeforeNavigate.addListener(async ({tabId, url, frameId}) => {
  if (frameId !== 0) return; // main frame only

  const { [ENABLE_KEY]: enabled = true, [SITES_KEY]: sites = [] } =
        await chrome.storage.sync.get({ [ENABLE_KEY]: true, [SITES_KEY]: [] });

  const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
  // Allow the navigation once if the user already confirmed it.
  const skipHost = await getSkip(tabId);
  if (skipHost === host) {
    await clearSkip(tabId);
    return;
  }

  if (!enabled || !isBlocked(url, sites)) return;

  await setSkip(tabId, host);
  const target = chrome.runtime.getURL('intermediate.html?url=' + encodeURIComponent(url));
  chrome.tabs.update(tabId, { url: target });
});
