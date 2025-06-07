// === add.js ===

// Redirect to login page if the user isn't marked as logged in
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function to clear login status and redirect to login page
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// When the form is submitted (user adds weight)
document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent the page from refreshing

  const weight = document.getElementById('weightInput').value;

  if (!weight) return; // If the input is empty, do nothing

  // Save the weight using our custom StorageService
  StorageService.add(weight);

  // Clear the input box after saving
  document.getElementById('weightInput').value = '';

  // Show a confirmation message
  const successMsg = document.getElementById('successMsg');
  successMsg.textContent = 'Entry added!';

  // Hide the message after 3 seconds
  setTimeout(() => successMsg.textContent = '', 3000);
});
