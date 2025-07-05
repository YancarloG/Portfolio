
const storageKey = 'bankezeData';
let data = JSON.parse(localStorage.getItem(storageKey)) || { entries: [] };

let clockInTime = null;
let clockOutTime = null;

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function updateDateDropdown() {
  const dateDropdown = document.getElementById('selectDate');
  const uniqueDates = [...new Set(data.entries.map(e => e.date))].sort();
  dateDropdown.innerHTML = '';
  uniqueDates.forEach(date => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = date;
    dateDropdown.appendChild(opt);
  });

  const today = new Date().toISOString().split('T')[0];
  if (uniqueDates.includes(today)) {
    dateDropdown.value = today;
  }
}

function addPayment() {
  const type = document.getElementById('paymentType').value;
  const amountStr = document.getElementById('amount').value;
  const tipStr = document.getElementById('tip').value;
  const date = document.getElementById('entryDate').value;

  const amount = amountStr === '' ? 0 : parseFloat(amountStr);
  const tip = tipStr === '' ? 0 : parseFloat(tipStr);

  if (isNaN(amount) || isNaN(tip) || tip < 0 || amount < 0) {
    return alert('Please enter valid amounts. Tips can be 0+ and charges can be empty or 0.');
  }

  data.entries.push({ type, amount, tip, date });
  saveData();
  updateDateDropdown();

  document.getElementById('amount').value = '';
  document.getElementById('tip').value = '';
  alert('Payment added!');
}

function clearEntriesForSelectedDate() {
  const date = document.getElementById('selectDate').value;
  if (confirm(`Clear all entries for ${date}?`)) {
    data.entries = data.entries.filter(entry => entry.date !== date);
    saveData();
    updateDateDropdown();
    alert('Entries cleared.');
  }
}

function populateAndShowResults() {
  const selectedDate = document.getElementById('selectDate').value;
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  const summary = {};
  let totalCash = 0, totalChargeTips = 0, totalCashTips = 0, totalAmount = 0, totalTips = 0;

  data.entries.filter(e => e.date === selectedDate).forEach(({ type, amount, tip }) => {
    if (!summary[type]) summary[type] = { count: 0, revenue: 0, total: 0 };
    summary[type].count++;
    summary[type].revenue += amount;
    summary[type].total += amount + tip;

    if (type === 'Cash') {
      totalCash += amount;
      totalCashTips += tip;
    } else {
      totalChargeTips += tip;
    }

    totalTips += tip;
    totalAmount += amount;
  });

  Object.entries(summary).forEach(([type, info]) => {
    const row = `<tr><td>${type}</td><td>${info.count}</td><td>$${info.revenue.toFixed(2)}</td><td>$${info.total.toFixed(2)}</td></tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById('totalCash').innerText = `$${totalCash.toFixed(2)}`;
  document.getElementById('cashTips').innerText = `$${totalCashTips.toFixed(2)}`;
  document.getElementById('lessTips').innerText = `$${totalChargeTips.toFixed(2)}`;
  document.getElementById('cashResponsibility').innerText = `$${(totalCash - totalChargeTips).toFixed(2)}`;
  document.getElementById('avgTip').innerText = totalAmount ? `${((totalTips / totalAmount) * 100).toFixed(2)}%` : '0%';
  document.getElementById('results').style.display = 'block';
}

function populateAndShowEntries() {
  const selectedDate = document.getElementById('selectDate').value;
  const ul = document.getElementById('entryList');
  ul.innerHTML = '';

  data.entries
    .map((entry, index) => ({ ...entry, index }))
    .filter(e => e.date === selectedDate)
    .forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `${entry.date} - ${entry.type} - $${entry.amount.toFixed(2)} + Tip $${entry.tip.toFixed(2)} ` +
        `<button onclick="deleteEntry(${entry.index})" class="delete-btn">X</button>`;
      ul.appendChild(li);
    });

  document.getElementById('entryLog').style.display = 'block';
}

function deleteEntry(index) {
  if (confirm('Are you sure you want to delete this entry?')) {
    data.entries.splice(index, 1);
    saveData();
    updateDateDropdown();
    populateAndShowEntries();
  }
}

function showSummary() {
  const summaryDiv = document.getElementById('summaryView');
  summaryDiv.style.display = 'block';

  const allEntries = data.entries;
  if (allEntries.length === 0) return alert('No entries to summarize.');

  let totalTips = 0, totalAmount = 0;
  let biggestTip = -Infinity, smallestTip = Infinity;

  allEntries.forEach(e => {
    totalTips += e.tip;
    totalAmount += e.amount;
    if (e.tip > biggestTip) biggestTip = e.tip;
    if (e.tip < smallestTip) smallestTip = e.tip;
  });

  const avgTipPercent = totalAmount > 0 ? (totalTips / totalAmount * 100).toFixed(2) : '0.00';

  document.getElementById('biggestTip').innerText = `$${biggestTip.toFixed(2)}`;
  document.getElementById('smallestTip').innerText = `$${smallestTip.toFixed(2)}`;
  document.getElementById('averageTipPercent').innerText = `${avgTipPercent}%`;

  // Calculate hourly
  const payRate = parseFloat(document.getElementById('payRate').value);
  if (isNaN(payRate) || payRate <= 0 || clockInTime === null || clockOutTime === null) {
    document.getElementById('averageHourly').innerText = "Missing data";
    return;
  }

  const workedHours = (clockOutTime - clockInTime) / 3600000;
  document.getElementById('hoursWorked').innerText = `${workedHours.toFixed(2)} hrs`;

  const totalEarnings = payRate * workedHours + totalTips;
  const hourlyWithTips = (totalEarnings / workedHours).toFixed(2);
  document.getElementById('averageHourly').innerText = `$${hourlyWithTips}`;
}

function clockIn() {
  clockInTime = new Date();
  alert(`Clocked in at ${clockInTime.toLocaleTimeString()}`);
}

function clockOut() {
  if (!clockInTime) return alert('You must clock in first!');
  clockOutTime = new Date();
  alert(`Clocked out at ${clockOutTime.toLocaleTimeString()}`);
}

function shakePage() {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
    const donate = document.getElementById('donateWrapper');
    if (donate) donate.classList.remove('hidden');
  }, 300);
}

if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

document.addEventListener('DOMContentLoaded', updateDateDropdown);
