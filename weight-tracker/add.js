// add.js

// Redirect to login if not authenticated
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// On form submission, store weight with date and time
document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const weight = document.getElementById('weightInput').value;
  const date = new Date().toLocaleDateString();
  const time = getCurrentTime(); // from utils.js
  const newEntry = { date, time, weight };

  const entries = JSON.parse(localStorage.getItem('weights') || '[]');
  entries.push(newEntry);
  localStorage.setItem('weights', JSON.stringify(entries));

  document.getElementById('weightInput').value = '';
  alert('Entry added!');
});
