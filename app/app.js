/* ═══════════════════════════════════════════════════════════════
   PIXIE JOURNEY — MVP App (HTML/CSS/JS, localStorage Option A)
   3 screens: Daily Entry, Month View, Settings
   Multiple a la carte binary stickers
═══════════════════════════════════════════════════════════════ */

// ─── Storage ──────────────────────────────────────────────────

const STORAGE_KEY = 'pixie_journey_entries';
const STICKERS_KEY = 'pixie_journey_stickers';

const DEFAULT_STICKERS = [
    { id: 'meds', label: 'Took Meds', icon: 'fa-pills' },
    { id: 'exercise', label: 'Exercise', icon: 'fa-dumbbell' },
    { id: 'water', label: 'Water', icon: 'fa-droplet' },
    { id: 'journaled', label: 'Journaled', icon: 'fa-book' },
];

function loadEntries() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
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

function getStickers() {
    try {
        const saved = JSON.parse(localStorage.getItem(STICKERS_KEY));
        if (saved && saved.length > 0) return saved;
    } catch {}
    return DEFAULT_STICKERS;
}

function saveStickers(stickers) {
    localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
}

// ─── State ────────────────────────────────────────────────────

let currentDate = new Date();
let currentMood = null;
let currentSleep = null;
let binaryStates = {};    // { stickerId: null | true | false }
let binaryContexts = {};  // { stickerId: string }
let viewMonth = new Date().getMonth();
let viewYear = new Date().getFullYear();

const MOOD_COLORS = {
    5: '#ffe9b3', 4: '#d0e6db', 3: '#f7e2d9', 2: '#c5dde8', 1: '#eaa090'
};
const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Bad' };
const SLEEP_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Poor', 1: 'Awful' };

// ─── Navigation ───────────────────────────────────────────────

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ─── Binary Stickers Rendering ────────────────────────────────

function renderBinaryStickers() {
    const container = document.getElementById('binary-stickers-container');
    container.innerHTML = '';
    const stickers = getStickers();

    stickers.forEach(sticker => {
        const state = binaryStates[sticker.id];

        // Row wrapper
        const row = document.createElement('div');
        row.className = 'binary-row';

        // Label + icon
        const labelDiv = document.createElement('div');
        labelDiv.className = 'binary-label-row';

        const icon = document.createElement('i');
        icon.className = `fa-solid ${sticker.icon || 'fa-circle-check'}`;
        icon.style.fontSize = '14px';
        labelDiv.appendChild(icon);

        const labelSpan = document.createElement('span');
        labelSpan.textContent = sticker.label;
        labelDiv.appendChild(labelSpan);

        row.appendChild(labelDiv);

        // Tri-state button
        const btn = document.createElement('button');
        btn.className = 'binary-sticker';
        btn.dataset.state = String(state);
        btn.setAttribute('aria-label', `Toggle ${sticker.label}`);
        btn.addEventListener('click', () => {
            const cur = binaryStates[sticker.id];
            if (cur === null || cur === undefined) binaryStates[sticker.id] = true;
            else if (cur === true) binaryStates[sticker.id] = false;
            else binaryStates[sticker.id] = null;
            renderBinaryStickers();
        });
        row.appendChild(btn);

        container.appendChild(row);

        // Context input (visible when state is not null)
        const ctxWrap = document.createElement('div');
        ctxWrap.className = 'context-input-wrapper' + (state !== null && state !== undefined ? ' visible' : '');

        const ctxInput = document.createElement('input');
        ctxInput.type = 'text';
        ctxInput.className = 'context-input';
        ctxInput.maxLength = 100;
        ctxInput.dataset.stickerId = sticker.id;
        ctxInput.value = binaryContexts[sticker.id] || '';

        if (state === true) {
            ctxInput.placeholder = `${sticker.label} — any details?`;
        } else if (state === false) {
            ctxInput.placeholder = `Why not ${sticker.label}? (optional)`;
        } else {
            ctxInput.placeholder = 'Details (optional)';
        }

        ctxInput.addEventListener('input', () => {
            binaryContexts[sticker.id] = ctxInput.value;
        });

        ctxWrap.appendChild(ctxInput);
        container.appendChild(ctxWrap);
    });
}

// ─── Daily Entry ──────────────────────────────────────────────

function loadDailyEntry() {
    const entry = getEntry(currentDate);
    currentMood = entry ? entry.mood : null;
    currentSleep = entry ? entry.sleep : null;

    // Load binary states from entry
    binaryStates = {};
    binaryContexts = {};
    if (entry && entry.stickers) {
        for (const [id, data] of Object.entries(entry.stickers)) {
            binaryStates[id] = data.state;
            binaryContexts[id] = data.context || '';
        }
    }
    // Migrate old single binary format
    if (entry && entry.binary !== undefined && entry.binary !== null && !entry.stickers) {
        const stickers = getStickers();
        if (stickers.length > 0) {
            binaryStates[stickers[0].id] = entry.binary;
            binaryContexts[stickers[0].id] = entry.binaryContext || '';
        }
    }

    // Date header
    document.getElementById('date-header').textContent =
        currentDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

    // Mood
    document.querySelectorAll('#mood-row .sticker-item').forEach(item => {
        const level = parseInt(item.dataset.level);
        item.classList.toggle('selected', level === currentMood);
    });

    // Mood context
    const moodCtx = document.getElementById('mood-context');
    const moodCtxInput = document.getElementById('mood-context-input');
    if (currentMood) {
        moodCtx.classList.add('visible');
        moodCtxInput.placeholder = `Why ${MOOD_LABELS[currentMood]}? (optional)`;
    } else {
        moodCtx.classList.remove('visible');
    }
    moodCtxInput.value = entry ? (entry.moodContext || '') : '';

    // Sleep
    document.querySelectorAll('#sleep-row .sticker-item').forEach(item => {
        const level = parseInt(item.dataset.level);
        item.classList.toggle('selected', level === currentSleep);
    });

    // Sleep context
    const sleepCtx = document.getElementById('sleep-context');
    const sleepCtxInput = document.getElementById('sleep-context-input');
    if (currentSleep) {
        sleepCtx.classList.add('visible');
        sleepCtxInput.placeholder = `${SLEEP_LABELS[currentSleep]} sleep — notes (optional)`;
    } else {
        sleepCtx.classList.remove('visible');
    }
    sleepCtxInput.value = entry ? (entry.sleepContext || '') : '';

    // Binary stickers
    renderBinaryStickers();

    // Context note
    document.getElementById('context-note').value = entry ? (entry.contextNote || '') : '';
}

function saveDailyEntry() {
    // Collect binary sticker states and contexts
    const stickersData = {};
    const stickers = getStickers();
    stickers.forEach(s => {
        const state = binaryStates[s.id];
        if (state !== null && state !== undefined) {
            stickersData[s.id] = {
                label: s.label,
                state: state,
                context: binaryContexts[s.id] || null,
            };
        }
    });

    const entry = {
        date: dateKey(currentDate),
        mood: currentMood,
        moodContext: document.getElementById('mood-context-input').value || null,
        sleep: currentSleep,
        sleepContext: document.getElementById('sleep-context-input').value || null,
        stickers: stickersData,
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
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const entries = getMonthEntries(viewYear, viewMonth + 1);
    const entryMap = {};
    entries.forEach(e => { entryMap[e.date] = e; });

    const today = dateKey(new Date());

    for (let i = 0; i < startOffset; i++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-day empty';
        grid.appendChild(cell);
    }

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

const ICON_OPTIONS = [
    { value: 'fa-pills', label: 'Pills' },
    { value: 'fa-dumbbell', label: 'Exercise' },
    { value: 'fa-droplet', label: 'Water' },
    { value: 'fa-book', label: 'Journal' },
    { value: 'fa-bed', label: 'Sleep' },
    { value: 'fa-apple-whole', label: 'Food' },
    { value: 'fa-heart', label: 'Heart' },
    { value: 'fa-brain', label: 'Brain' },
    { value: 'fa-mug-hot', label: 'Coffee' },
    { value: 'fa-person-walking', label: 'Walk' },
    { value: 'fa-spa', label: 'Spa' },
    { value: 'fa-music', label: 'Music' },
    { value: 'fa-circle-check', label: 'Check' },
    { value: 'fa-star', label: 'Star' },
    { value: 'fa-bolt', label: 'Energy' },
    { value: 'fa-face-smile', label: 'Social' },
];

function renderStickerLabelsEditor() {
    const editor = document.getElementById('sticker-labels-editor');
    editor.innerHTML = '';
    const stickers = getStickers();

    stickers.forEach((sticker, idx) => {
        const row = document.createElement('div');
        row.className = 'label-editor-row';

        // Icon picker
        const iconBtn = document.createElement('button');
        iconBtn.className = 'icon-picker-btn';
        iconBtn.innerHTML = `<i class="fa-solid ${sticker.icon || 'fa-circle-check'}"></i>`;
        iconBtn.title = 'Change icon';
        iconBtn.addEventListener('click', () => {
            // Cycle to next icon
            const currentIdx = ICON_OPTIONS.findIndex(o => o.value === sticker.icon);
            const nextIdx = (currentIdx + 1) % ICON_OPTIONS.length;
            sticker.icon = ICON_OPTIONS[nextIdx].value;
            saveStickers(stickers);
            renderStickerLabelsEditor();
        });
        row.appendChild(iconBtn);

        // Label input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'text-input label-input';
        input.maxLength = 30;
        input.value = sticker.label;
        input.placeholder = 'Sticker name...';
        input.addEventListener('change', () => {
            sticker.label = input.value.trim() || 'Untitled';
            // Regenerate ID from label
            sticker.id = input.value.trim().toLowerCase().replace(/\s+/g, '_') || sticker.id;
            saveStickers(stickers);
        });
        row.appendChild(input);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn delete-btn';
        delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delBtn.title = 'Remove sticker';
        delBtn.addEventListener('click', () => {
            stickers.splice(idx, 1);
            saveStickers(stickers);
            renderStickerLabelsEditor();
        });
        row.appendChild(delBtn);

        editor.appendChild(row);
    });
}

function loadSettings() {
    renderStickerLabelsEditor();
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
    loadDailyEntry();

    // Mood sticker taps
    document.querySelectorAll('#mood-row .sticker-item').forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            currentMood = currentMood === level ? null : level;
            document.querySelectorAll('#mood-row .sticker-item').forEach(i =>
                i.classList.toggle('selected', parseInt(i.dataset.level) === currentMood));

            const moodCtx = document.getElementById('mood-context');
            const moodCtxInput = document.getElementById('mood-context-input');
            if (currentMood) {
                moodCtx.classList.add('visible');
                moodCtxInput.placeholder = `Why ${MOOD_LABELS[currentMood]}? (optional)`;
                moodCtxInput.focus();
            } else {
                moodCtx.classList.remove('visible');
            }
        });
    });

    // Sleep sticker taps
    document.querySelectorAll('#sleep-row .sticker-item').forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            currentSleep = currentSleep === level ? null : level;
            document.querySelectorAll('#sleep-row .sticker-item').forEach(i =>
                i.classList.toggle('selected', parseInt(i.dataset.level) === currentSleep));

            const sleepCtx = document.getElementById('sleep-context');
            const sleepCtxInput = document.getElementById('sleep-context-input');
            if (currentSleep) {
                sleepCtx.classList.add('visible');
                sleepCtxInput.placeholder = `${SLEEP_LABELS[currentSleep]} sleep — notes (optional)`;
                sleepCtxInput.focus();
            } else {
                sleepCtx.classList.remove('visible');
            }
        });
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

    // Settings: Add sticker
    document.getElementById('btn-add-sticker').addEventListener('click', () => {
        const stickers = getStickers();
        const newId = 'sticker_' + Date.now();
        stickers.push({ id: newId, label: 'New Sticker', icon: 'fa-circle-check' });
        saveStickers(stickers);
        renderStickerLabelsEditor();
    });

    // Export
    document.getElementById('btn-export').addEventListener('click', exportData);
});
