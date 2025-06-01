// Redirect to login if not authenticated
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Access table body for inserting rows
const tableBody = document.querySelector('#weightTable tbody');

// Retrieve and parse entries or use empty array
const entries = JSON.parse(localStorage.getItem('weights') || '[]');

// Prepare data arrays for chart
const labels = [];
const weights = [];

// Clear any existing table content
tableBody.innerHTML = '';

// Track previous weight for comparison
let previousWeight = null;

// Loop through each entry to display in table and collect data for chart
entries.forEach(entry => {
  const row = document.createElement('tr');

  // Push data for chart display
  labels.push(`${entry.date} ${entry.time}`);
  weights.push(Number(entry.weight));

  // Conditionally color rows: green for weight loss, red for gain
  if (previousWeight !== null) {
    const change = Number(entry.weight) - Number(previousWeight);
    if (change < 0) {
      row.style.color = 'green'; // weight dropped
    } else if (change > 0) {
      row.style.color = 'red'; // weight increased
    }
  }

  // Fill table row with entry details
  row.innerHTML = `<td>${entry.date}</td><td>${entry.time || '—'}</td><td>${entry.weight}</td>`;
  tableBody.appendChild(row);

  previousWeight = entry.weight;
});

// Create a line chart using Chart.js
const ctx = document.getElementById('weightChart').getContext('2d');
const weightChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels, // x-axis labels: date + time
    datasets: [{
      label: 'Weight Over Time',
      data: weights,
      fill: false,
      borderColor: 'blue',
      backgroundColor: 'blue',
      tension: 0.2, // smooth curve
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const i = context.dataIndex;
            const prev = weights[i - 1];
            const curr = weights[i];
            const change = prev !== undefined ? (curr - prev).toFixed(1) : '0';
            const direction = change > 0 ? '+' : '';
            return `Weight: ${curr} lbs (${direction}${change})`;
          }
        }
      },
      legend: {
        labels: {
          color: '#000',
          font: { size: 14 }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#000',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: '#000'
        }
      }
    }
  }
});
