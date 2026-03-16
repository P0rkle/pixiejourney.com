/* ═══════════════════════════════════════════════════════════════
   PIXIE JOURNEY — MVP App (HTML/CSS/JS, localStorage Option A)
   3 screens: Daily Entry, Month View, Settings
═══════════════════════════════════════════════════════════════ */

// ─── Storage ──────────────────────────────────────────────────

const STORAGE_KEY = 'pixie_journey_entries';
const LABEL_KEY = 'pixie_journey_binary_label';

function loadEntries() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
}

function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function dateKey(d) {
    return d.toISOString().substring(0, 10);
}

function getEntry(date) {
    return loadEntries()[dateKey(date)] || null;
}

function saveEntry(entry) {
    const entries = loadEntries();
    entries[entry.date] = entry;
    saveEntries(entries);
}

function getMonthEntries(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const entries = loadEntries();
    const result = [];
    for (const [key, val] of Object.entries(entries)) {
        if (key.startsWith(prefix)) result.push(val);
    }
    return result;
}

function getAllEntries() {
    const entries = loadEntries();
    return Object.values(entries).sort((a, b) => a.date.localeCompare(b.date));
}

function getBinaryLabel() {
    return localStorage.getItem(LABEL_KEY) || 'Took Meds';
}

function setBinaryLabel(label) {
    localStorage.setItem(LABEL_KEY, label);
}

// ─── State ────────────────────────────────────────────────────

let currentDate = new Date();
let currentMood = null;
let currentSleep = null;
let currentBinary = null; // null | true | false
let viewMonth = new Date().getMonth();
let viewYear = new Date().getFullYear();

const MOOD_COLORS = {
    5: '#ffe9b3', 4: '#d0e6db', 3: '#f7e2d9', 2: '#c5dde8', 1: '#eaa090'
};

// ─── Navigation ───────────────────────────────────────────────

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ─── Daily Entry ──────────────────────────────────────────────

function loadDailyEntry() {
    const entry = getEntry(currentDate);
    currentMood = entry ? entry.mood : null;
    currentSleep = entry ? entry.sleep : null;
    currentBinary = entry ? entry.binary : null;

    // Date header
    document.getElementById('date-header').textContent =
        currentDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

    // Mood
    document.querySelectorAll('#mood-row .sticker-item').forEach(item => {
        const level = parseInt(item.dataset.level);
        item.classList.toggle('selected', level === currentMood);
    });

    // Sleep
    document.querySelectorAll('#sleep-row .sticker-item').forEach(item => {
        const level = parseInt(item.dataset.level);
        item.classList.toggle('selected', level === currentSleep);
    });

    // Binary
    updateBinaryDisplay();

    // Binary label
    document.getElementById('binary-label-display').textContent = getBinaryLabel();

    // Context note
    document.getElementById('context-note').value = entry ? (entry.contextNote || '') : '';
}

function updateBinaryDisplay() {
    const btn = document.getElementById('binary-btn');
    btn.dataset.state = String(currentBinary);
}

function saveDailyEntry() {
    const entry = {
        date: dateKey(currentDate),
        mood: currentMood,
        sleep: currentSleep,
        binary: currentBinary,
        binaryLabel: getBinaryLabel(),
        contextNote: document.getElementById('context-note').value || null,
        updatedAt: new Date().toISOString(),
    };
    saveEntry(entry);

    // Toast
    const toast = document.getElementById('toast');
    toast.textContent = 'Saved \u2713';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

// ─── Month View ───────────────────────────────────────────────

function renderMonthView() {
    const title = new Date(viewYear, viewMonth).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
    document.getElementById('month-title').textContent = title;

    const grid = document.getElementById('pixel-grid');
    grid.innerHTML = '';

    const firstDay = new Date(viewYear, viewMonth, 1);
    // Monday=0 offset
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const entries = getMonthEntries(viewYear, viewMonth + 1);
    const entryMap = {};
    entries.forEach(e => { entryMap[e.date] = e; });

    const today = dateKey(new Date());

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-day empty';
        grid.appendChild(cell);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const entry = entryMap[key];
        const cell = document.createElement('div');
        cell.className = 'pixel-day';
        cell.textContent = d;

        if (key === today) cell.classList.add('today');

        if (entry) {
            if (entry.mood && MOOD_COLORS[entry.mood]) {
                cell.style.background = MOOD_COLORS[entry.mood];
            } else {
                cell.classList.add('has-entry-no-mood');
            }
        }

        cell.addEventListener('click', () => {
            currentDate = new Date(viewYear, viewMonth, d);
            loadDailyEntry();
            showScreen('screen-daily');
        });

        grid.appendChild(cell);
    }
}

// ─── Settings ─────────────────────────────────────────────────

function loadSettings() {
    document.getElementById('binary-label-input').value = getBinaryLabel();
}

function exportData() {
    const data = getAllEntries();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixie-journey-export-${dateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Event Listeners ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Load initial state
    loadDailyEntry();

    // Mood sticker taps
    document.querySelectorAll('#mood-row .sticker-item').forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            currentMood = currentMood === level ? null : level;
            document.querySelectorAll('#mood-row .sticker-item').forEach(i =>
                i.classList.toggle('selected', parseInt(i.dataset.level) === currentMood));
        });
    });

    // Sleep sticker taps
    document.querySelectorAll('#sleep-row .sticker-item').forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            currentSleep = currentSleep === level ? null : level;
            document.querySelectorAll('#sleep-row .sticker-item').forEach(i =>
                i.classList.toggle('selected', parseInt(i.dataset.level) === currentSleep));
        });
    });

    // Binary sticker tap: null -> true -> false -> null
    document.getElementById('binary-btn').addEventListener('click', () => {
        if (currentBinary === null) currentBinary = true;
        else if (currentBinary === true) currentBinary = false;
        else currentBinary = null;
        updateBinaryDisplay();
    });

    // Save
    document.getElementById('btn-save').addEventListener('click', saveDailyEntry);

    // Navigation
    document.getElementById('btn-calendar').addEventListener('click', () => {
        viewMonth = currentDate.getMonth();
        viewYear = currentDate.getFullYear();
        renderMonthView();
        showScreen('screen-month');
    });
    document.getElementById('btn-settings').addEventListener('click', () => {
        loadSettings();
        showScreen('screen-settings');
    });
    document.getElementById('btn-month-back').addEventListener('click', () => {
        loadDailyEntry();
        showScreen('screen-daily');
    });
    document.getElementById('btn-settings-back').addEventListener('click', () => {
        loadDailyEntry();
        showScreen('screen-daily');
    });

    // Month nav
    document.getElementById('btn-prev-month').addEventListener('click', () => {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        renderMonthView();
    });
    document.getElementById('btn-next-month').addEventListener('click', () => {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        renderMonthView();
    });

    // Settings
    document.getElementById('btn-save-label').addEventListener('click', () => {
        const label = document.getElementById('binary-label-input').value.trim() || 'Took Meds';
        setBinaryLabel(label);
        document.getElementById('binary-label-display').textContent = label;
    });
    document.getElementById('btn-export').addEventListener('click', exportData);
});
