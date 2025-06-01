if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const weight = parseFloat(document.getElementById('weightInput').value);
  const successMsg = document.getElementById('successMsg');

  if (!validateWeight(weight)) {
    successMsg.textContent = 'Invalid weight. Please enter a value between 1 and 2000.';
    successMsg.style.color = '#ff4444';
    return;
  }

  const date = new Date().toLocaleDateString();
  const newEntry = { date, weight };

  const entries = JSON.parse(localStorage.getItem('weights') || '[]');
  entries.push(newEntry);
  localStorage.setItem('weights', JSON.stringify(entries));
  document.getElementById('weightInput').value = '';
  successMsg.textContent = 'Entry added!';
  successMsg.style.color = '#00ff00';
});