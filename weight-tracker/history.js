// === history.js ===
// This file controls how weight history is displayed and managed

// If user is not logged in, send them back to login page
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// This logs the user out by removing their login status
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// This deletes all saved entries if user confirms
function clearAllEntries() {
  const confirmDelete = confirm("Are you sure you want to delete all weight entries?");
  if (confirmDelete) {
    StorageService.clearAll();  // Calls our helper class to erase data
    location.reload();          // Reloads the page to reflect changes
  }
}

// Get the <tbody> section of the table where entries will go
const tableBody = document.querySelector('#weightTable tbody');

// Get all entries from storage using our StorageService class
let entries = StorageService.getAll();

// Sort entries by date and time (just in case)
entries = sortEntries(entries);

// Arrays to store data for the chart
const labels = [];  // Stores date+time strings
const weights = []; // Stores weight numbers
let previousWeight = null; // Used to check increase/decrease

// Loop through each entry and create a table row and chart data
entries.forEach(entry => {
  const row = document.createElement('tr'); // Create new table row
  const id = entry.id;                      // Unique ID for delete button

  // Add info for the chart
  labels.push(`${entry.date} ${entry.time}`);
  weights.push(Number(entry.weight)); // Make sure it's a number

  // Determine if weight went up or down from previous entry
  let className = '';
  if (previousWeight !== null) {
    const change = Number(entry.weight) - Number(previousWeight);
    if (change > 0) className = 'increase';    // Red for gain
    else if (change < 0) className = 'decrease'; // Green for loss
  }

  row.className = className; // Apply color coding to row

  // Create the delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete'; // Button text
  deleteBtn.style.margin = '0.25rem'; // Small spacing

  // When the delete button is clicked
  deleteBtn.onclick = function () {
    const confirmDelete = confirm("Delete this entry?");
    if (confirmDelete) {
      StorageService.delete(id); // Remove the entry from localStorage
      location.reload();         // Refresh to show updated table/chart
    }
  };

  // Fill the row with entry data and a place for the button
  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.time}</td>
    <td>${entry.weight}</td>
    <td></td> <!-- Placeholder for button -->
  `;

  // Insert the delete button into the last cell of the row
  row.querySelector('td:last-child').appendChild(deleteBtn);

  // Add the completed row to the table
  tableBody.appendChild(row);

  // Save this weight to compare next one
  previousWeight = entry.weight;
});

// === Create a chart from the entries ===
const ctx = document.getElementById('weightChart').getContext('2d');
new Chart(ctx, {
  type: 'line', // Line chart
  data: {
    labels: labels,   // X-axis (dates + times)
    datasets: [{
      label: 'Weight Trend',
      data: weights,  // Y-axis (weight values)
      borderColor: '#00ccff',      // Line color
      backgroundColor: '#00ccff',  // Point color
      fill: false,                 // No area shading
      tension: 0.3,                // Curve smoothness
      pointRadius: 4,              // Circle size
      pointHoverRadius: 6         // Bigger on hover
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
        ticks: { color: '#00ffcc' } // X axis text color
      },
      y: {
        beginAtZero: false,
        ticks: { color: '#00ffcc' } // Y axis text color
      }
    }
  }
});
