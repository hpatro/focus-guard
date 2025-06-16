const params = new URLSearchParams(location.search);
const url    = params.get('url') || '';
document.getElementById('site').textContent = (new URL(url)).hostname;

const DELAY_KEY = 'delay';
const WAIT_KEY  = 'disableContinue';

const img = document.getElementById('dog');
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
fetch('https://dog.ceo/api/breeds/image/random', { signal: controller.signal })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(d => {
    clearTimeout(timeout);
    if (d && d.message) {
      img.src = d.message;
      img.style.display = 'block';
    }
  })
  .catch(() => {});

let remaining = 10;
const counter = document.getElementById('timer');
const goButton = document.getElementById('go');

chrome.storage.sync.get({ [DELAY_KEY]: 10, [WAIT_KEY]: false }, d => {
  remaining = parseInt(d[DELAY_KEY], 10) || 0;
  counter.textContent = remaining;
  const waitUntilEnd = d[WAIT_KEY];
  if (waitUntilEnd) goButton.disabled = true;

  const tick = setInterval(() => {
    remaining -= 1;
    counter.textContent = remaining;
    if (remaining === 0) {
      clearInterval(tick);
      goButton.disabled = false;
      location.href = url;
    }
  }, 1000);
});

document.getElementById('go').addEventListener('click', () => {
  location.href = url;
});
