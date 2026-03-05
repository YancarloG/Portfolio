// Bankeze Calculator
// Data is stored locally on this device (localStorage).
// Export CSV/JSON to back up or move to another device.

const storageKey = 'bankezeData';

function safeParseJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function makeId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeToLocalDateString(isoString) {
  // Returns YYYY-MM-DD in the user's local timezone.
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadData() {
  const raw = localStorage.getItem(storageKey);
  let loaded = safeParseJSON(raw, null);

  // Back-compat: original schema was { entries: [{type, amount, tip}] }
  // New schema: { version: 1, entries: [{id, type, amount, tip, createdAt}] }
  if (!loaded || typeof loaded !== 'object') {
    loaded = { version: 1, entries: [] };
  }

  if (!loaded.version) {
    loaded.version = 1;
  }

  if (!Array.isArray(loaded.entries)) {
    loaded.entries = [];
  }

  // Migrate existing entries to include id + createdAt
  let migrated = false;
  loaded.entries = loaded.entries.map((e) => {
    const entry = { ...e };

    if (!entry.id) {
      entry.id = makeId();
      migrated = true;
    }
    if (!entry.createdAt) {
      entry.createdAt = new Date().toISOString();
      migrated = true;
    }

    // Ensure numbers
    entry.amount = Number(entry.amount);
    entry.tip = Number(entry.tip);

    return entry;
  });

  if (migrated) {
    localStorage.setItem(storageKey, JSON.stringify(loaded));
  }

  return loaded;
}

let data = loadData();

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function getFilter() {
  const allDates = document.getElementById('allDates');
  const filterDate = document.getElementById('filterDate');

  const isAll = !!allDates?.checked;
  const dateValue = filterDate?.value;

  if (isAll) return { mode: 'all', date: null };

  // default to today's date if empty
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return { mode: 'date', date: dateValue || todayStr };
}

function getFilteredEntriesWithIndex() {
  const f = getFilter();

  const withIndex = data.entries.map((e, idx) => ({ entry: e, idx }));
  if (f.mode === 'all') return withIndex;

  return withIndex.filter(({ entry }) => normalizeToLocalDateString(entry.createdAt) === f.date);
}

function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

function updateTitles() {
  const f = getFilter();
  const title = document.getElementById('summaryTitle');
  const resultsTitle = document.getElementById('resultsTitle');
  const entryLogTitle = document.getElementById('entryLogTitle');

  const label = (f.mode === 'all') ? 'All Dates' : f.date;

  if (title) title.textContent = (f.mode === 'all') ? 'All-Time Summary' : `Summary for ${label}`;
  if (resultsTitle) resultsTitle.textContent = `Totals for ${label}`;
  if (entryLogTitle) entryLogTitle.textContent = `Entries for ${label}`;
}

function updateQuickSummary() {
  const list = getFilteredEntriesWithIndex().map(x => x.entry);

  let totalRevenue = 0;
  let totalTips = 0;

  list.forEach(e => {
    totalRevenue += Number(e.amount) || 0;
    totalTips += Number(e.tip) || 0;
  });

  const slips = list.length;
  const avgTip = totalRevenue ? (totalTips / totalRevenue) * 100 : 0;

  const elRevenue = document.getElementById('sumRevenue');
  const elTips = document.getElementById('sumTips');
  const elAvg = document.getElementById('sumAvgTip');
  const elSlips = document.getElementById('sumSlips');

  if (elRevenue) elRevenue.textContent = formatMoney(totalRevenue);
  if (elTips) elTips.textContent = formatMoney(totalTips);
  if (elAvg) elAvg.textContent = `${avgTip.toFixed(2)}%`;
  if (elSlips) elSlips.textContent = String(slips);

  updateTitles();
}

function onFilterChange() {
  const allDates = document.getElementById('allDates');
  const filterDate = document.getElementById('filterDate');
  if (allDates && filterDate) {
    filterDate.disabled = allDates.checked;
  }

  updateQuickSummary();

  // If these panels are open, keep them in sync
  if (document.getElementById('results')?.style.display === 'block') showResults();
  if (document.getElementById('entryLog')?.style.display === 'block') viewAllEntries();
}

function addPayment() {
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const tipInput = document.getElementById('tip').value;
  const tip = tipInput === '' ? 0 : parseFloat(tipInput);

  if (!Number.isFinite(amount) || amount <= 0) return alert('Please enter a charge amount greater than 0.');
  if (!Number.isFinite(tip) || tip < 0) return alert('Tip amount cannot be negative.');

  const createdAt = new Date().toISOString();

  data.entries.push({
    id: makeId(),
    type,
    amount,
    tip,
    createdAt
  });

  saveData();

  document.getElementById('amount').value = '';
  document.getElementById('tip').value = '';

  updateQuickSummary();

  // Lightweight confirmation (less annoying than alert spam)
  toast('Payment added ✅');
}

function showResults() {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  const filtered = getFilteredEntriesWithIndex().map(x => x.entry);

  const summary = {};
  let totalCash = 0, totalChargeTips = 0, totalCashTips = 0, totalAmount = 0, totalTips = 0;

  filtered.forEach(({ type, amount, tip }) => {
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

  document.getElementById('totalCash').innerText = formatMoney(totalCash);
  document.getElementById('cashTips').innerText = formatMoney(totalCashTips);
  document.getElementById('lessTips').innerText = formatMoney(totalChargeTips);
  document.getElementById('cashResponsibility').innerText = formatMoney(totalCash - totalChargeTips);
  document.getElementById('avgTip').innerText = totalAmount ? `${((totalTips / totalAmount) * 100).toFixed(2)}%` : '0%';

  document.getElementById('results').style.display = 'block';
  updateTitles();
}

function viewAllEntries() {
  const ul = document.getElementById('entryList');
  ul.innerHTML = '';

  const filtered = getFilteredEntriesWithIndex();

  if (!filtered.length) {
    const li = document.createElement('li');
    li.textContent = 'No entries for this filter.';
    ul.appendChild(li);
    document.getElementById('entryLog').style.display = 'block';
    updateTitles();
    return;
  }

  filtered.forEach(({ entry }) => {
    const li = document.createElement('li');
    const dt = entry.createdAt ? new Date(entry.createdAt) : null;
    const when = dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    li.innerHTML =
      `<div class="entry-line">
        <strong>${entry.type}</strong>
        <span class="entry-meta">${when}</span>
      </div>
      <div class="entry-line">
        <span>${formatMoney(entry.amount)} + Tip ${formatMoney(entry.tip)}</span>
        <span>
          <button onclick="editEntry('${entry.id}')" class="edit-btn">Edit</button>
          <button onclick="deleteEntry('${entry.id}')" class="delete-btn">X</button>
        </span>
      </div>`;

    ul.appendChild(li);
  });

  document.getElementById('entryLog').style.display = 'block';
  updateTitles();
}

function findEntryIndexById(id) {
  return data.entries.findIndex(e => e.id === id);
}

function deleteEntry(id) {
  const idx = findEntryIndexById(id);
  if (idx === -1) return;

  if (confirm('Delete this entry?')) {
    data.entries.splice(idx, 1);
    saveData();
    updateQuickSummary();
    viewAllEntries();
  }
}

function editEntry(id) {
  const idx = findEntryIndexById(id);
  if (idx === -1) return;

  const e = data.entries[idx];

  const newType = prompt('Edit payment type:', e.type);
  if (newType === null) return; // cancelled
  const newAmountStr = prompt('Edit charge amount (number):', String(e.amount));
  if (newAmountStr === null) return;
  const newTipStr = prompt('Edit tip amount (number):', String(e.tip));
  if (newTipStr === null) return;

  const newAmount = parseFloat(newAmountStr);
  const newTip = parseFloat(newTipStr);

  if (!newType.trim()) return alert('Payment type cannot be empty.');
  if (!Number.isFinite(newAmount) || newAmount <= 0) return alert('Charge amount must be > 0.');
  if (!Number.isFinite(newTip) || newTip < 0) return alert('Tip amount cannot be negative.');

  data.entries[idx] = { ...e, type: newType.trim(), amount: newAmount, tip: newTip };
  saveData();

  updateQuickSummary();
  viewAllEntries();
  toast('Entry updated ✏️');
}

function clearAllEntries() {
  if (!data.entries.length) return alert('No entries to clear.');

  const ok = confirm(
    'This will permanently clear entries on THIS device.\n\nTip: Export CSV/JSON first if you want a backup.\n\nContinue?'
  );
  if (!ok) return;

  data.entries = [];
  saveData();

  document.getElementById('results').style.display = 'none';
  document.getElementById('entryLog').style.display = 'none';

  updateQuickSummary();
  toast('New day started ✅');
}

/* -------------------- CSV Export / Import -------------------- */

function exportCSV() {
  const f = getFilter();
  const filtered = getFilteredEntriesWithIndex().map(x => x.entry);

  if (!filtered.length) return alert('No entries to export for the current filter.');

  // Ask whether to export all if not already in all-dates mode
  let toExport = filtered;
  if (f.mode !== 'all') {
    const allOk = confirm('Export only the selected date?\n\nOK = Export selected date\nCancel = Export ALL dates');
    if (!allOk) {
      toExport = data.entries;
    }
  }

  const headers = ['createdAt', 'type', 'amount', 'tip'];
  const rows = toExport.map(e => [
    e.createdAt || '',
    e.type || '',
    (Number.isFinite(e.amount) ? e.amount.toFixed(2) : ''),
    (Number.isFinite(e.tip) ? e.tip.toFixed(2) : '')
  ]);

  const csv = [headers, ...rows]
    .map(r => r.map(csvEscape).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const dateTag = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bankeze_${dateTag}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function handleCSVImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || '');
      importCSVText(text);
      event.target.value = '';
    } catch (err) {
      console.error(err);
      alert('Import failed. Make sure it is a valid CSV exported from Bankeze.');
    }
  };
  reader.readAsText(file);
}

function importCSVText(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length);
  if (lines.length < 2) return alert('CSV looks empty.');

  const header = parseCSVLine(lines[0]).map(h => h.trim());
  const idx = {
    createdAt: header.indexOf('createdAt'),
    type: header.indexOf('type'),
    amount: header.indexOf('amount'),
    tip: header.indexOf('tip')
  };

  if (idx.type === -1 || idx.amount === -1 || idx.tip === -1) {
    return alert('CSV missing required headers: createdAt, type, amount, tip');
  }

  const imported = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);

    const type = (cols[idx.type] || '').trim();
    const amount = parseFloat(cols[idx.amount]);
    const tip = parseFloat(cols[idx.tip]);
    const createdAt = idx.createdAt !== -1 ? (cols[idx.createdAt] || '').trim() : '';

    if (!type) continue;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (!Number.isFinite(tip) || tip < 0) continue;

    imported.push({
      id: makeId(),
      type,
      amount,
      tip,
      createdAt: createdAt || new Date().toISOString()
    });
  }

  if (!imported.length) return alert('No valid rows found to import.');

  const replace = confirm(
    `Import found ${imported.length} entries.\n\nOK = Replace current entries\nCancel = Merge into existing`
  );

  data.entries = replace ? imported : [...data.entries, ...imported];
  data.version = 1;
  saveData();

  updateQuickSummary();
  toast(`Imported ${imported.length} entries ✅`);
}

/* Simple CSV parser handling quotes and commas inside quotes */
function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',') {
        out.push(cur);
        cur = '';
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

/* -------------------- JSON Backup / Restore -------------------- */

function exportJSON() {
  if (!data.entries.length) return alert('No entries to export.');

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: data.entries
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const dateTag = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bankeze_${dateTag}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function handleJSONImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = safeParseJSON(String(reader.result || ''), null);
      if (!obj || !Array.isArray(obj.entries)) {
        return alert('Invalid JSON file. Export JSON from Bankeze to import it.');
      }

      const imported = obj.entries.map(e => ({
        id: e.id || makeId(),
        type: String(e.type || '').trim(),
        amount: Number(e.amount),
        tip: Number(e.tip),
        createdAt: e.createdAt || new Date().toISOString()
      })).filter(e => e.type && Number.isFinite(e.amount) && e.amount > 0 && Number.isFinite(e.tip) && e.tip >= 0);

      if (!imported.length) return alert('No valid entries found in JSON.');

      const replace = confirm(
        `Import found ${imported.length} entries.\n\nOK = Replace current entries\nCancel = Merge into existing`
      );

      data.entries = replace ? imported : [...data.entries, ...imported];
      data.version = 1;
      saveData();

      updateQuickSummary();
      toast(`Imported ${imported.length} entries ✅`);

      event.target.value = '';
    } catch (err) {
      console.error(err);
      alert('Import failed. Make sure it is a JSON file exported from Bankeze.');
    }
  };
  reader.readAsText(file);
}

/* -------------------- Fun + Dark mode + Toast -------------------- */

function shakePage() {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
    const donate = document.getElementById('donateWrapper');
    if (donate) donate.classList.remove('hidden');
  }, 300);
}

// Apply dark mode if saved in localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

// Toggle dark mode and store preference
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

function toast(message) {
  // Very small toast (no dependencies)
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '18px';
    t.style.transform = 'translateX(-50%)';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '12px';
    t.style.background = 'rgba(0,0,0,0.75)';
    t.style.color = 'white';
    t.style.fontWeight = '600';
    t.style.zIndex = '9999';
    t.style.maxWidth = '92%';
    t.style.textAlign = 'center';
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.15s ease-in-out';
    document.body.appendChild(t);
  }

  t.textContent = message;
  t.style.opacity = '1';

  clearTimeout(window.__bankezeToastTimer);
  window.__bankezeToastTimer = setTimeout(() => {
    t.style.opacity = '0';
  }, 1400);
}

/* -------------------- Init -------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const filterDate = document.getElementById('filterDate');
  const allDates = document.getElementById('allDates');

  if (filterDate) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    filterDate.value = todayStr;
  }

  if (allDates && filterDate) {
    filterDate.disabled = allDates.checked;
  }

  updateQuickSummary();
});
