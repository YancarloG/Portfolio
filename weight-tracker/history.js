// === history.js ===

// If user isn't logged in, redirect to login page
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Get the part of the HTML where we'll add the weight rows
const tableBody = document.querySelector('#weightTable tbody');

// Fetch all saved weight entries (sorted by time)
let entries = StorageService.getAll();

// Sort just to be sure
entries = sortEntries(entries);

// Clear any existing table rows
tableBody.innerHTML = '';

// Arrays to hold chart data
const labels = [];  // e.g., "6/5/2025 3:15 PM"
const weights = []; // Actual weight numbers
let previousWeight = null; // Used to compare changes

// Loop through all entries to display them
entries.forEach(entry => {
  const row = document.createElement('tr'); // New table row

  // Add date + time to the chart labels
  labels.push(`${entry.date} ${entry.time}`);
  weights.push(Number(entry.weight)); // Convert weight string to number

  // Determine if weight increased or decreased
  let className = '';
  if (previousWeight !== null) {
    const change = Number(entry.weight) - Number(previousWeight);
    if (change > 0) className = 'increase';    // Red
    else if (change < 0) className = 'decrease'; // Green
  }

  // Apply CSS class for red or green styling
  row.className = className;

  // Add the row data to the table
  row.innerHTML = `<td>${entry.date}</td><td>${entry.time}</td><td>${entry.weight}</td>`;
  tableBody.appendChild(row);

  // Store current weight for next loop comparison
  previousWeight = entry.weight;
});

// Create a line chart using Chart.js
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
        ticks: { color: '#00ffcc' } // Make x-axis text visible
      },
      y: {
        beginAtZero: false,
        ticks: { color: '#00ffcc' } // Make y-axis text visible
      }
    }
  }
});
