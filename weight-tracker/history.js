// Redirect to login if user not authenticated
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logout logic
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Access table body where entries will be rendered
const tableBody = document.querySelector('#weightTable tbody');

// Fetch weight entries from localStorage
const entries = JSON.parse(localStorage.getItem('weights') || '[]');

// Render table rows with conditional formatting
tableBody.innerHTML = '';
let previousWeight = null;

entries.forEach(entry => {
  const row = document.createElement('tr');

  // Conditional color logic: red if gain, green if loss, default black
  let color = '';
  if (previousWeight !== null) {
    color = entry.weight > previousWeight ? 'red' : 'green';
  }

  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.time || 'N/A'}</td>
    <td style="color:${color}">${entry.weight}</td>
  `;
  tableBody.appendChild(row);
  previousWeight = entry.weight;
});


// === Chart.js Visualization ===

// Combine date + time for X-axis labels
const chartLabels = entries.map(entry => `${entry.date} ${entry.time || ''}`);

// Parse weight values for Y-axis data
const chartData = entries.map(entry => parseFloat(entry.weight));

// Get canvas context and create a Chart.js line graph
const ctx = document.getElementById('weightChart').getContext('2d');
const weightChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: chartLabels,
    datasets: [{
      label: 'Weight Over Time',
      data: chartData,
      borderColor: '#00ff88',  // Neon line
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#00ff88'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Weight (lbs)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date & Time'
        }
      }
    }
  }
});
