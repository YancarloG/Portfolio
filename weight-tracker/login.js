document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Dummy login (any credentials will work)
  if (username && password) {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'add.html';
  } else {
    alert('Enter both fields.');
  }
});
