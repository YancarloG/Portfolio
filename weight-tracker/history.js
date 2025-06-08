// === history.js ===
// This controls the behavior of the history page: display, delete, export, and import

// If the user isn’t logged in, send them back to the login page
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Logs out the user by clearing login info
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Clears all weight entries from localStorage
function clearAllEntries() {
  const confirmDelete = confirm("Are you sure you want to delete all weight entries?");
  if (confirmDelete) {
    StorageService.clearAll(); // Removes weights from localStorage
    location.reload();         // Refreshes the page to reflect changes
  }
}

// Reference to the table’s <tbody> so we can insert rows later
const tableBody = document.querySelector('#weightTable tbody');

// Get all stored entries (sorted by date/time)
let entries = StorageService.getAll();

// Arrays for the chart labels and weight data
const labels = [];
const weights = [];
let previousWeight = null; // Used to compare weight changes

// Loop through each saved entry
entries.forEach(entry => {
  const row = document.createElement('tr'); // Create a new table row
  const id = entry.id; // Grab unique ID for delete reference

  // Push data into the chart arrays
  labels.push(`${entry.date} ${entry.time}`);
  weights.push(Number(entry.weight));

  // Determine if weight increased or decreased compared to previous entry
  let className = '';
  if (previousWeight !== null) {
    const change = Number(entry.weight) - Number(previousWeight);
    if (change > 0) className = 'increase';    // Red row
    else if (change < 0) className = 'decrease'; // Green row
  }

  row.className = className; // Set row color class

  // Create a delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.margin = '0.25rem';

  // When delete is clicked, remove the entry and reload the page
  deleteBtn.onclick = function () {
    const confirmDelete = confirm("Delete this entry?");
    if (confirmDelete) {
      StorageService.delete(id);
      location.reload();
    }
  };

  // Add row HTML and inject the delete button
  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.time}</td>
    <td>${entry.weight}</td>
    <td></td>
  `;
  row.querySelector('td:last-child').appendChild(deleteBtn);

  // Add the row to the table
  tableBody.appendChild(row);

  // Store current weight for next comparison
  previousWeight = entry.weight;
});

// === Chart.js section for rendering the line chart ===
const ctx = document.getElementById('weightChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels, // X-axis labels (date and time)
    datasets: [{
      label: 'Weight Trend',
      data: weights, // Y-axis values (weights)
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


// === Export Function: Download JSON backup of all entries ===
function exportData() {
  const data = StorageService.getAll(); // Get saved weights
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); // Convert to JSON blob
  const url = URL.createObjectURL(blob); // Make a downloadable link

  const a = document.createElement('a'); // Create a fake link
  a.href = url;
  a.download = 'weight_data_backup.json'; // Set the filename
  a.click(); // Auto-click to trigger download
  URL.revokeObjectURL(url); // Clean up memory
}

// === Import Function: Load a backup JSON file into localStorage ===
function importData(event) {
  const file = event.target.files[0]; // Get the file from the input field
  if (!file) return;

  const reader = new FileReader();

  // When the file is loaded
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result); // Try to parse the file as JSON

      // Validate the JSON structure
      const valid = Array.isArray(importedData) && importedData.every(entry =>
        entry.id && entry.date && entry.time && entry.weight
      );

      if (valid) {
        localStorage.setItem('weights', JSON.stringify(importedData)); // Save to localStorage
        alert("Data imported successfully!");
        location.reload(); // Reload to see new data
      } else {
        alert("Invalid file format. Please upload a correct backup JSON file.");
      }
    } catch (err) {
      alert("Error reading the file. Make sure it's a valid JSON file.");
    }
  };

  // Start reading the file
  reader.readAsText(file);
}
