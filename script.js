document.getElementById('quarantine-btn').addEventListener('click', () => {
  hideAll();
  show('progress-overlay');
  fakeProgress();
});

function hideAll() {
  document.querySelectorAll('.overlay').forEach(el => el.classList.remove('show'));
}
function show(id) {
  document.getElementById(id).classList.add('show');
}
