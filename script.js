const form = document.getElementById('weightForm');
const input = document.getElementById('weightInput');
const tableBody = document.querySelector('#weightTable tbody');

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem('weights') || '[]');
  tableBody.innerHTML = '';
  entries.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${entry.date}</td><td>${entry.weight}</td>`;
    tableBody.appendChild(row);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const weight = input.value;
  const date = new Date().toLocaleDateString();

  const newEntry = { date, weight };
  const entries = JSON.parse(localStorage.getItem('weights') || '[]');
  entries.push(newEntry);
  localStorage.setItem('weights', JSON.stringify(entries));
  input.value = '';
  loadEntries();
});

loadEntries();
