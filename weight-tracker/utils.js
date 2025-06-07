// === utils.js ===

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
 * Sort weight entries by date and time in chronological order
 */
function sortEntries(entries) {
  return entries.sort((a, b) => {
    const aDateTime = new Date(`${a.date} ${a.time}`);
    const bDateTime = new Date(`${b.date} ${b.time}`);
    return aDateTime - bDateTime;
  });
}

/**
 * A class that manages how weight entries are saved, retrieved, and deleted from localStorage.
 * This acts like a simple mock database using your browser's built-in storage.
 */
class StorageService {
  // The key used to store data in the browser's localStorage
  static key = 'weights';

  // Get all weight entries (sorted by date/time)
  static getAll() {
    // Get saved data or use an empty array if there's nothing yet
    return sortEntries(JSON.parse(localStorage.getItem(this.key) || '[]'));
  }

  // Add a new weight entry with a date, time, and unique ID
  static add(weight) {
    const date = new Date().toLocaleDateString(); // Today's date
    const time = getCurrentTime(); // Current time
    const id = Date.now(); // Unique ID based on the current time in milliseconds
    const newEntry = { id, date, time, weight };

    const entries = this.getAll(); // Get all existing entries
    entries.push(newEntry); // Add the new one
    localStorage.setItem(this.key, JSON.stringify(entries)); // Save back to localStorage
  }

  // Delete a weight entry by its unique ID
  static delete(id) {
    const entries = this.getAll().filter(entry => entry.id !== id);
    localStorage.setItem(this.key, JSON.stringify(entries));
  }

  // Clear all weight data (not typically used, but useful for resets)
  static clearAll() {
    localStorage.removeItem(this.key);
  }
}
