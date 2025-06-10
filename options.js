const SITES_KEY = 'sites';
const DELAY_KEY = 'delay';
const box   = document.getElementById('sites');
const delay = document.getElementById('delay');
const save  = document.getElementById('save');
const stat  = document.getElementById('status');

chrome.storage.sync.get({ [SITES_KEY]: ['twitter.com','facebook.com'], [DELAY_KEY]: 10 }, (d) => {
  box.value = d[SITES_KEY].join('\n');
  delay.value = d[DELAY_KEY];
});

save.onclick = () => {
  const list = box.value
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
  const secs = Math.max(0, parseInt(delay.value, 10) || 0);
  chrome.storage.sync.set({ [SITES_KEY]: list, [DELAY_KEY]: secs }, () => {
    stat.textContent = 'Saved ✔︎';
    setTimeout(() => stat.textContent = '', 1500);
  });
};
