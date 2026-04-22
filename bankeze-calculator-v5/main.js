// Bankeze Calculator
const storageKey = 'bankezeData';
const bankoutMetaKey = 'bankezeBankoutMeta';

const BANKOUT_FORM_TYPES = [
  'American Express','Discover','Disney Rewards Card','Guest ID',
  'JCB Card','Mastercard','Value Card','Visa',
  'Adult Dining Plan','Child Dining Plan','Coupons'
];

function safeParseJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function makeId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeToLocalDateString(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function toDatetimeLocalValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function datetimeLocalToISO(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function loadData() {
  const raw = localStorage.getItem(storageKey);
  let loaded = safeParseJSON(raw, { version:1, entries:[] });

  loaded.entries = loaded.entries.map(e => ({
    id: e.id || makeId(),
    type: e.type,
    amount: Number(e.amount),
    tip: Number(e.tip),
    createdAt: e.createdAt || new Date().toISOString()
  }));

  return loaded;
}

let data = loadData();

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function getFilteredEntries() {
  return data.entries;
}

function formatMoney(n) {
  return `$${(Number(n)||0).toFixed(2)}`;
}

/* ================== BANKOUT FIX ================== */

function computeBankoutSummary(entries) {
  const byType = {};
  BANKOUT_FORM_TYPES.forEach(t => {
    byType[t] = { count: 0, total: 0 }; // 🔥 CHANGED
  });

  let totalCash = 0;
  let totalChargeTips = 0;

  entries.forEach(e => {
    const type = String(e.type || '');
    const amount = Number(e.amount) || 0;
    const tip = Number(e.tip) || 0;

    const totalWithTip = amount + tip; // 🔥 KEY FIX

    if (type === 'Cash') {
      totalCash += amount;
    } else {
      totalChargeTips += tip;
    }

    if (byType[type]) {
      byType[type].count += 1;
      byType[type].total += totalWithTip; // 🔥 KEY FIX
    }
  });

  return {
    byType,
    totalCash,
    lessChargeTips: totalChargeTips,
    cashResponsibility: totalCash - totalChargeTips
  };
}

function showBankoutFormVisualization() {
  const wrap = document.getElementById('bankoutForm');
  wrap.style.display = 'block';

  const tbody = document.querySelector('#bankoutTable tbody');
  tbody.innerHTML = '';

  const s = computeBankoutSummary(getFilteredEntries());

  BANKOUT_FORM_TYPES.forEach((t) => {
    const info = s.byType[t] || { count: 0, total: 0 };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t}</td>
      <td>${info.count}</td>
      <td>${formatMoney(info.total)}</td> <!-- 🔥 FIX -->
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('bankoutTotalCash').innerText = formatMoney(s.totalCash);
  document.getElementById('bankoutLessChargeTips').innerText = formatMoney(s.lessChargeTips);
  document.getElementById('bankoutCashResponsibility').innerText = formatMoney(s.cashResponsibility);
}

/* ================== ADD PAYMENT ================== */

function addPayment() {
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const tip = parseFloat(document.getElementById('tip').value) || 0;

  if (!amount || amount <= 0) return alert('Invalid amount');

  data.entries.push({
    id: makeId(),
    type,
    amount,
    tip,
    createdAt: new Date().toISOString()
  });

  saveData();

  document.getElementById('amount').value = '';
  document.getElementById('tip').value = '';

  alert('Added!');
}

/* ================== RESULTS ================== */

function showResults() {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  const summary = {};

  data.entries.forEach(({ type, amount, tip }) => {
    if (!summary[type]) summary[type] = { count:0, revenue:0, total:0 };

    summary[type].count++;
    summary[type].revenue += amount;
    summary[type].total += amount + tip;
  });

  Object.entries(summary).forEach(([type, info]) => {
    tbody.innerHTML += `
      <tr>
        <td>${type}</td>
        <td>${info.count}</td>
        <td>${formatMoney(info.revenue)}</td>
        <td>${formatMoney(info.total)}</td>
      </tr>
    `;
  });

  document.getElementById('results').style.display = 'block';
}
