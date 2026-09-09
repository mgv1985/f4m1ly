let sequence = '';

function unlock() {
  sessionStorage.setItem('opAccess', 'granted');
  window.location.replace('OP/index.html');
}

document.addEventListener('keydown', (event) => {
  if (!/^\d$/.test(event.key)) {
    sequence = '';
    return;
  }

  sequence = (sequence + event.key).slice(-2);
  if (sequence === '26') {
    unlock();
  }
});

const mobileCode = document.querySelector('#mobileCode');
const mobileCodeTrigger = document.querySelector('#mobileCodeTrigger');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

if (isTouchDevice) {
  mobileCodeTrigger.addEventListener('click', () => {
    mobileCode.value = '';
    mobileCode.focus({ preventScroll: true });
  });

  mobileCode.addEventListener('input', () => {
    mobileCode.value = mobileCode.value.replace(/\D/g, '').slice(0, 2);
    if (mobileCode.value === '26') unlock();
    if (mobileCode.value.length === 2) mobileCode.value = '';
  });
}
