const storageKey = 'bankezeData';
let data = JSON.parse(localStorage.getItem(storageKey)) || { entries: [] };

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function addPayment() {
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const tipInput = document.getElementById('tip').value;
  const tip = tipInput === '' ? 0 : parseFloat(tipInput);

  if (amount <= 0 || isNaN(amount)) return alert('Please enter a charge amount greater than 0.');
  if (tip < 0 || isNaN(tip)) return alert('Tip amount cannot be negative.');

  data.entries.push({ type, amount, tip });
  saveData();

  document.getElementById('amount').value = '';
  document.getElementById('tip').value = '';
  alert('Payment added!');
}

function showResults() {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  const summary = {};
  let totalCash = 0, totalTips = 0, totalAmount = 0;

  data.entries.forEach(({ type, amount, tip }) => {
    if (!summary[type]) summary[type] = { count: 0, revenue: 0 };
    summary[type].count++;
    summary[type].revenue += amount;
    if (type === 'Cash') totalCash += amount;
    totalTips += tip;
    totalAmount += amount;
  });

  Object.entries(summary).forEach(([type, info]) => {
    const row = `<tr><td>${type}</td><td>${info.count}</td><td>$${info.revenue.toFixed(2)}</td></tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById('totalCash').innerText = `$${totalCash.toFixed(2)}`;
  document.getElementById('lessTips').innerText = `$${totalTips.toFixed(2)}`;
  document.getElementById('cashResponsibility').innerText = `$${(totalCash - totalTips).toFixed(2)}`;
  document.getElementById('avgTip').innerText = totalAmount ? `${((totalTips / totalAmount) * 100).toFixed(2)}%` : '0%';
  document.getElementById('results').style.display = 'block';
}

function viewAllEntries() {
  const ul = document.getElementById('entryList');
  ul.innerHTML = '';
  data.entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${index + 1}. ${entry.type} - $${entry.amount.toFixed(2)} + Tip $${entry.tip.toFixed(2)} ` +
      `<button onclick="deleteEntry(${index})" class="delete-btn">X</button>`;
    ul.appendChild(li);
  });
  document.getElementById('entryLog').style.display = 'block';
}

function deleteEntry(index) {
  if (confirm('Are you sure you want to delete this entry?')) {
    data.entries.splice(index, 1);
    saveData();
    viewAllEntries();
  }
}

function shakePage() {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
    const donate = document.getElementById('donateWrapper');
    if (donate) donate.style.display = 'block';
  }, 300);
}
