const ENABLE_KEY = 'enabled';
const toggle = document.getElementById('toggle');

chrome.storage.sync.get({ [ENABLE_KEY]: true }, (data) => {
  toggle.checked = data[ENABLE_KEY];
});

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ [ENABLE_KEY]: toggle.checked });
});

document.getElementById('opts').onclick = () => chrome.runtime.openOptionsPage();