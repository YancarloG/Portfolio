// Redirect to login if not authenticated
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Event listener for weight form submission
document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent form from reloading the page

  // Get weight from input field
  const weight = document.getElementById('weightInput').value;

  // Get the current date and time
  const now = new Date();
  const date = now.toLocaleDateString(); // e.g. 5/24/2025
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g. 10:42 AM

  // Create a new entry object
  const newEntry = { date, time, weight };

  // Retrieve existing entries from localStorage, or start with an empty array
  const entries = JSON.parse(localStorage.getItem('weights') || '[]');

  // Add new entry to entries array
  entries.push(newEntry);

  // Save updated array back to localStorage
  localStorage.setItem('weights', JSON.stringify(entries));

  // Clear the input field
  document.getElementById('weightInput').value = '';

  // Notify user
  alert('Entry added!');
});
