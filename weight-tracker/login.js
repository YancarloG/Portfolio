document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('loginError');

  if (username && password) {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'add.html';
  } else {
    errorMsg.textContent = 'Please enter both username and password.';
  }
});