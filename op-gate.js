let sequence = '';

document.addEventListener('keydown', (event) => {
  if (!/^\d$/.test(event.key)) {
    sequence = '';
    return;
  }

  sequence = (sequence + event.key).slice(-2);
  if (sequence === '26') {
    sessionStorage.setItem('opAccess', 'granted');
    window.location.replace('OP/index.html');
  }
});
