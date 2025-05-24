
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

const tableBody = document.querySelector('#weightTable tbody');
const entries = JSON.parse(localStorage.getItem('weights') || '[]');
tableBody.innerHTML = '';

let prevWeight = null;

entries.forEach(entry => {
  const row = document.createElement('tr');
  const weightChangeClass = prevWeight === null ? '' : (entry.weight > prevWeight ? 'increase' : (entry.weight < prevWeight ? 'decrease' : ''));
  const time = entry.time || 'Unknown';
  row.innerHTML = `<td>${entry.date}</td><td>${time}</td><td class="${weightChangeClass}">${entry.weight}</td>`;
  tableBody.appendChild(row);
  prevWeight = entry.weight;
});
