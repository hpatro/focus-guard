const params = new URLSearchParams(location.search);
const url    = params.get('url') || '';
document.getElementById('site').textContent = (new URL(url)).hostname;

let remaining = 10;
const counter = document.getElementById('timer');
const tick = setInterval(() => {
  remaining -= 1;
  counter.textContent = remaining;
  if (remaining === 0) {
    clearInterval(tick);
    location.href = url;
  }
}, 1000);

document.getElementById('go').addEventListener('click', () => {
  location.href = url;
});
