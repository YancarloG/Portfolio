// history.js By: Yancarlo

// Redirect to login if not authenticated
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Get DOM reference for the table body
const tableBody = document.querySelector('#weightTable tbody');

// Parse weight entries or initialize an empty array
let entries = JSON.parse(localStorage.getItem('weights') || '[]');

// Sort entries using utility function
entries = sortEntries(entries);

// Clear table first
tableBody.innerHTML = '';

// Prepare data for chart
const labels = [];
const weights = [];
let previousWeight = null;

entries.forEach(entry => {
  const row = document.createElement('tr');

  // Push date/time to labels and weight to dataset
  labels.push(`${entry.date} ${entry.time}`);
  weights.push(Number(entry.weight));

  // Assign increase/decrease color
  let className = '';
  if (previousWeight !== null) {
    const change = Number(entry.weight) - Number(previousWeight);
    if (change > 0) className = 'increase';
    else if (change < 0) className = 'decrease';
  }

  row.className = className;

  // Table row: date | time | weight
  row.innerHTML = `<td>${entry.date}</td><td>${entry.time}</td><td>${entry.weight}</td>`;
  tableBody.appendChild(row);

  previousWeight = entry.weight;
});

// Chart.js chart display
const ctx = document.getElementById('weightChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Weight Trend',
      data: weights,
      borderColor: '#00ccff',
      backgroundColor: '#00ccff',
      fill: false,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const i = context.dataIndex;
            const curr = context.parsed.y;
            const prev = i > 0 ? context.chart.data.datasets[0].data[i - 1] : null;
            const diff = prev !== null ? (curr - prev).toFixed(1) : "0";
            return `Weight: ${curr} lbs (${diff >= 0 ? '+' : ''}${diff})`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#00ffcc' }
      },
      y: {
        beginAtZero: false,
        ticks: { color: '#00ffcc' }
      }
    }
  }
});
