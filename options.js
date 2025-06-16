const SITES_KEY = 'sites';
const DELAY_KEY = 'delay';
const WAIT_KEY  = 'disableContinue';
const box   = document.getElementById('sites');
const delay = document.getElementById('delay');
const wait  = document.getElementById('disableContinue');
const save  = document.getElementById('save');
const stat  = document.getElementById('status');

chrome.storage.sync.get({ [SITES_KEY]: ['twitter.com','facebook.com'], [DELAY_KEY]: 10, [WAIT_KEY]: false }, (d) => {
  box.value = d[SITES_KEY].join('\n');
  delay.value = d[DELAY_KEY];
  wait.checked = d[WAIT_KEY];
});

save.onclick = () => {
  const list = box.value
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
  const secs = Math.max(0, parseInt(delay.value, 10) || 0);
  chrome.storage.sync.set({ [SITES_KEY]: list, [DELAY_KEY]: secs, [WAIT_KEY]: wait.checked }, () => {
    stat.textContent = 'Saved ✔︎';
    setTimeout(() => stat.textContent = '', 1500);
  });
};
