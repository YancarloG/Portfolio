const storageKey = 'bankezeData';
let data = JSON.parse(localStorage.getItem(storageKey)) || { entries: [] };

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// Called on page load to update dropdown with actual entry dates
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

function clearEntriesForDate() {
  const date = document.getElementById('entryDate').value;
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

  const tipByDate = {};
  let totalTips = 0, count = 0, maxTip = 0;

  data.entries.forEach(entry => {
    if (!tipByDate[entry.date]) tipByDate[entry.date] = 0;
    tipByDate[entry.date] += entry.tip;

    totalTips += entry.tip;
    count++;
    if (entry.tip > maxTip) maxTip = entry.tip;
  });

  const sortedDates = Object.keys(tipByDate).sort();
  const labels = sortedDates;
  const tipData = sortedDates.map(d => tipByDate[d]);

  if (window.summaryChart) window.summaryChart.destroy();
  const ctx = document.getElementById('summaryChart').getContext('2d');
  window.summaryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tips per Day',
        data: tipData,
        fill: true,
        borderColor: 'green',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Daily Tip Chart' }
      }
    }
  });

  document.getElementById('biggestTip').innerText = `$${maxTip.toFixed(2)}`;
  document.getElementById('averageTipDay').innerText = (count ? `$${(totalTips / sortedDates.length).toFixed(2)}` : '$0');
  document.getElementById('weeklyTotal').innerText = `$${totalTips.toFixed(2)}`;
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

// Call date dropdown setup on first load
document.addEventListener('DOMContentLoaded', updateDateDropdown);
