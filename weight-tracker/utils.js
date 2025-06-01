// utils.js

/**
 * Get the current time in HH:MM AM/PM format
 */
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Calculate the average from an array of weight numbers
 */
function calculateAverage(weights) {
  const total = weights.reduce((sum, weight) => sum + parseFloat(weight), 0);
  return (total / weights.length).toFixed(1);
}

/**
 * Sort weight entries by date and time
 */
function sortEntries(entries) {
  return entries.sort((a, b) => {
    const aDateTime = new Date(`${a.date} ${a.time}`);
    const bDateTime = new Date(`${b.date} ${b.time}`);
    return aDateTime - bDateTime;
  });
}
