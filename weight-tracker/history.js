if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

const tableBody = document.querySelector('#weightTable tbody');
const entries = JSON.parse(localStorage.getItem('weights') || '[]');
tableBody.innerHTML = '';

entries.forEach(entry => {
  const row = document.createElement('tr');
  row.innerHTML = `<td>${entry.date}</td><td>${entry.weight}</td>`;
  tableBody.appendChild(row);
});