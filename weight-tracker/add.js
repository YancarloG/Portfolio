// Redirect to login if not authenticated
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function clears login state
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Event listener for weight form submission
document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Retrieve weight from form input
  const weight = document.getElementById('weightInput').value;

  // Get current date and time
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  // Create a new entry object with date, time, and weight
  const newEntry = { date, time, weight };

  // Retrieve existing entries or initialize empty array
  const entries = JSON.parse(localStorage.getItem('weights') || '[]');

  // Add new entry to array
  entries.push(newEntry);

  // Save updated entries array to localStorage
  localStorage.setItem('weights', JSON.stringify(entries));

  // Clear form input
  document.getElementById('weightInput').value = '';

  // Feedback to user
  alert('Entry added!');
});
