const SITES_KEY = 'sites';
const box  = document.getElementById('sites');
const save = document.getElementById('save');
const stat = document.getElementById('status');

chrome.storage.sync.get({ [SITES_KEY]: ['twitter.com','facebook.com'] }, (d) => {
  box.value = d[SITES_KEY].join('\n');
});

save.onclick = () => {
  const list = box.value
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
  chrome.storage.sync.set({ [SITES_KEY]: list }, () => {
    stat.textContent = 'Saved ✔︎';
    setTimeout(() => stat.textContent = '', 1500);
  });
};