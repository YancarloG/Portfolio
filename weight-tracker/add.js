if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const weight = document.getElementById('weightInput').value;
  const date = new Date().toLocaleDateString();
  const newEntry = { date, weight };

  const entries = JSON.parse(localStorage.getItem('weights') || '[]');
  entries.push(newEntry);
  localStorage.setItem('weights', JSON.stringify(entries));
  document.getElementById('weightInput').value = '';
  alert('Entry added!');
});
