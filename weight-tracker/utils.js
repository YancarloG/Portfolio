function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

function validateWeight(weight) {
  return weight > 0 && weight < 2000;
}