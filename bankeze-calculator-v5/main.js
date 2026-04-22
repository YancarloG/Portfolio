// Bankeze Calculator
// Data is stored locally on this device (localStorage).
// Export CSV/JSON to back up or move to another device.

const storageKey = 'bankezeData';
const bankoutMetaKey = 'bankezeBankoutMeta';

// Paper-style bankout form payment rows (matches the physical form)
const BANKOUT_FORM_TYPES = [
  'American Express',
  'Discover',
  'Disney Rewards Card',
  'Guest ID',
  'JCB Card',
  'Mastercard',
  'Value Card',
  'Visa',
  'Adult Dining Plan',
  'Child Dining Plan',
  'Coupons'
];

function safeParseJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function makeId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeToLocalDateString(isoString) {
  // Returns YYYY-MM-DD in local timezone
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toDatetimeLocalValue(date) {
  // YYYY-MM-DDTHH:MM (local time)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function datetimeLocalToISO(value) {
  // "2026-03-05T14:30" interpreted as local time -> ISO
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function loadData() {
  const raw = localStorage.getItem(storageKey);
  let loaded = safeParseJSON(raw, null);

  // Back-compat: original schema was { entries: [{type, amount, tip}] }
  // New schema: { version: 1, entries: [{id, type, amount, tip, createdAt}] }
  if (!loaded || typeof loaded !== 'object') {
    loaded = { version: 1, entries: [] };
  }

  if (!loaded.version) loaded.version = 1;
  if (!Array.isArray(loaded.entries)) loaded.entries = [];

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

    entry.amount = Number(entry.amount);
    entry.tip = Number(entry.tip);

    return entry;
  });

  if (migrated) localStorage.setItem(storageKey, JSON.stringify(loaded));
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
  if (allDates && filterDate) filterDate.disabled = allDates.checked;

  updateQuickSummary();

  if (document.getElementById('results')?.style.display === 'block') showResults();
  if (document.getElementById('entryLog')?.style.display === 'block') viewAllEntries();
  if (document.getElementById('bankoutForm')?.style.display === 'block') showBankoutFormVisualization(true);
}

/* -------------------- Bankout Form Visualization -------------------- */

function loadBankoutMeta() {
  const raw = localStorage.getItem(bankoutMetaKey);
  const obj = safeParseJSON(raw, null);
  if (!obj || typeof obj !== 'object') return { location: '', cm: '' };
  return {
    location: String(obj.location || ''),
    cm: String(obj.cm || '')
  };
}

function saveBankoutMeta(next) {
  localStorage.setItem(bankoutMetaKey, JSON.stringify({
    location: String(next.location || ''),
    cm: String(next.cm || '')
  }));
}

function getBankoutLabel() {
  const f = getFilter();
  return (f.mode === 'all') ? 'All Dates' : f.date;
}

function computeBankoutSummary(entries) {
  const byType = {};
  BANKOUT_FORM_TYPES.forEach(t => {
    byType[t] = { count: 0, revenue: 0 };
  });

  let totalCash = 0;
  let totalChargeTips = 0;

  entries.forEach(e => {
    const type = String(e.type || '');
    const amount = Number(e.amount) || 0;
    const tip = Number(e.tip) || 0;

    if (type === 'Cash') {
      totalCash += amount;
    } else {
      totalChargeTips += tip;
    }

    if (byType[type]) {
      byType[type].count += 1;
      byType[type].revenue += amount;
    }
  });

  return {
    byType,
    totalCash,
    lessChargeTips: totalChargeTips,
    cashResponsibility: totalCash - totalChargeTips
  };
}

function showBankoutFormVisualization(isRefresh = false) {
  // Hide other panes so this feels like its own "view"
  if (!isRefresh) {
    const results = document.getElementById('results');
    const entryLog = document.getElementById('entryLog');
    if (results) results.style.display = 'none';
    if (entryLog) entryLog.style.display = 'none';
  }

  const wrap = document.getElementById('bankoutForm');
  if (!wrap) return;
  wrap.style.display = 'block';

  // Date label
  const dateEl = document.getElementById('bankoutDate');
  if (dateEl) dateEl.textContent = getBankoutLabel();

  const tbody = document.querySelector('#bankoutTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const filtered = getFilteredEntriesWithIndex().map(x => x.entry);
  const s = computeBankoutSummary(filtered);

  BANKOUT_FORM_TYPES.forEach((t) => {
    const info = s.byType[t] || { count: 0, revenue: 0 };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t}:</td>
      <td>${info.count}</td>
      <td>${formatMoney(info.revenue)}</td>
    `;
    tbody.appendChild(tr);
  });

  const cashEl = document.getElementById('bankoutTotalCash');
  const lessEl = document.getElementById('bankoutLessChargeTips');
  const respEl = document.getElementById('bankoutCashResponsibility');
  if (cashEl) cashEl.textContent = formatMoney(s.totalCash);
  if (lessEl) lessEl.textContent = formatMoney(s.lessChargeTips);
  if (respEl) respEl.textContent = formatMoney(s.cashResponsibility);
}

function hideBankoutFormVisualization() {
  const wrap = document.getElementById('bankoutForm');
  if (wrap) wrap.style.display = 'none';
}

function setEntryDateTime(which) {
  const el = document.getElementById('entryDateTime');
  if (!el) return;

  const now = new Date();
  if (which === 'now') {
    el.value = toDatetimeLocalValue(now);
    return;
  }

  if (which === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    el.value = toDatetimeLocalValue(y);
  }
}

function addPayment() {
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const tipInput = document.getElementById('tip').value;
  const tip = tipInput === '' ? 0 : parseFloat(tipInput);

  const dtVal = document.getElementById('entryDateTime')?.value;
  const createdAt = dtVal ? datetimeLocalToISO(dtVal) : new Date().toISOString();

  if (!createdAt) return alert('Invalid date/time. Please fix Entry Date/Time.');
  if (!Number.isFinite(amount) || amount <= 0) return alert('Please enter a charge amount greater than 0.');
  if (!Number.isFinite(tip) || tip < 0) return alert('Tip amount cannot be negative.');

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

  const entryDateTime = document.getElementById('entryDateTime');
  if (entryDateTime) entryDateTime.value = toDatetimeLocalValue(new Date());

  updateQuickSummary();
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

  const f = getFilter();

  // Show newest first (more useful for servers)
  const filtered = getFilteredEntriesWithIndex()
    .slice()
    .sort((a, b) => new Date(b.entry.createdAt) - new Date(a.entry.createdAt));

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

    // If All Dates: show date + time. If filtered to one date: show time.
    const when = dt
      ? (f.mode === 'all'
        ? dt.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      : '';

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

/* -------------------- Edit Modal -------------------- */

function getPaymentTypeOptions() {
  const mainSelect = document.getElementById('paymentType');
  if (!mainSelect) return [];
  return Array.from(mainSelect.options).map(o => o.value);
}

function fillEditTypeSelect(selectedValue) {
  const editSelect = document.getElementById('editType');
  if (!editSelect) return;

  const options = getPaymentTypeOptions();
  editSelect.innerHTML = '';

  options.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    editSelect.appendChild(opt);
  });

  editSelect.value = selectedValue || options[0] || '';
}

function openEditModal(entry) {
  document.getElementById('editEntryId').value = entry.id;

  fillEditTypeSelect(entry.type);

  document.getElementById('editAmount').value =
    Number.isFinite(Number(entry.amount)) ? Number(entry.amount).toFixed(2) : '';

  document.getElementById('editTip').value =
    Number.isFinite(Number(entry.tip)) ? Number(entry.tip).toFixed(2) : '0.00';

  const dt = entry.createdAt ? new Date(entry.createdAt) : new Date();
  document.getElementById('editDateTime').value = toDatetimeLocalValue(dt);

  document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
}

function saveEditModal() {
  const id = document.getElementById('editEntryId').value;
  const idx = findEntryIndexById(id);
  if (idx === -1) return closeEditModal();

  const type = document.getElementById('editType').value;
  const amount = parseFloat(document.getElementById('editAmount').value);
  const tipInput = document.getElementById('editTip').value;
  const tip = tipInput === '' ? 0 : parseFloat(tipInput);

  const dtVal = document.getElementById('editDateTime').value;
  const createdAt = dtVal ? datetimeLocalToISO(dtVal) : null;

  if (!type.trim()) return alert('Payment type cannot be empty.');
  if (!Number.isFinite(amount) || amount <= 0) return alert('Charge amount must be > 0.');
  if (!Number.isFinite(tip) || tip < 0) return alert('Tip amount cannot be negative.');
  if (!createdAt) return alert('Invalid date/time.');

  const old = data.entries[idx];
  data.entries[idx] = { ...old, type: type.trim(), amount, tip, createdAt };

  saveData();
  closeEditModal();

  updateQuickSummary();
  viewAllEntries();
  toast('Entry updated ✏️');
}

function editEntry(id) {
  const idx = findEntryIndexById(id);
  if (idx === -1) return;

  openEditModal(data.entries[idx]);
}

/* Close modal on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('editModal');
    if (modal && !modal.classList.contains('hidden')) closeEditModal();
  }
});

/* -------------------- Clear -------------------- */

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

  let toExport = filtered;
  if (f.mode !== 'all') {
    const onlyDate = confirm('Export only the selected date?\n\nOK = Export selected date\nCancel = Export ALL dates');
    if (!onlyDate) toExport = data.entries;
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

  if (idx.type === -1 || idx.amount === -1 || idx.tip === -1 || idx.createdAt === -1) {
    return alert('CSV missing required headers: createdAt, type, amount, tip');
  }

  const imported = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);

    const type = (cols[idx.type] || '').trim();
    const amount = parseFloat(cols[idx.amount]);
    const tip = parseFloat(cols[idx.tip]);
    const createdAt = (cols[idx.createdAt] || '').trim();

    if (!type) continue;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (!Number.isFinite(tip) || tip < 0) continue;

    // createdAt should be ISO; if not, fall back to "now"
    const dateOk = createdAt && !Number.isNaN(new Date(createdAt).getTime());
    imported.push({
      id: makeId(),
      type,
      amount,
      tip,
      createdAt: dateOk ? createdAt : new Date().toISOString()
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
      })).filter(e => {
        const dateOk = e.createdAt && !Number.isNaN(new Date(e.createdAt).getTime());
        return e.type && Number.isFinite(e.amount) && e.amount > 0 && Number.isFinite(e.tip) && e.tip >= 0 && dateOk;
      });

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

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

function toast(message) {
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
  const entryDateTime = document.getElementById('entryDateTime');

  if (filterDate) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    filterDate.value = todayStr;
  }

  if (entryDateTime) {
    entryDateTime.value = toDatetimeLocalValue(new Date());
  }

  if (allDates && filterDate) filterDate.disabled = allDates.checked;

  // Bankout meta fields (Location / CM Name) - stored locally
  const meta = loadBankoutMeta();
  const loc = document.getElementById('bankoutLocation');
  const cm = document.getElementById('bankoutCM');
  if (loc) loc.value = meta.location;
  if (cm) cm.value = meta.cm;

  const persist = () => {
    saveBankoutMeta({
      location: loc ? loc.value : '',
      cm: cm ? cm.value : ''
    });
  };
  if (loc) loc.addEventListener('input', persist);
  if (cm) cm.addEventListener('input', persist);

  updateQuickSummary();
});
