/* ═══════════════════════════════════════════════════════════════
   PIXIE JOURNEY — MVP Web App (HTML/CSS/JS, localStorage)
   3 screens: Daily Entry, Month View, Settings
   Matches approved iOS mockup design spec
═══════════════════════════════════════════════════════════════ */

// ─── Storage ──────────────────────────────────────────────────

const STORAGE_KEY = 'pixie_journey_entries';
const STICKERS_KEY = 'pixie_journey_stickers';

const DEFAULT_STICKERS = [
    { id: 'meds', label: 'Took Meds', icon: 'fa-pills', color: 'gold' },
    { id: 'exercise', label: 'Exercise', icon: 'fa-dumbbell', color: 'mint' },
    { id: 'water', label: 'Water', icon: 'fa-droplet', color: 'sky' },
    { id: 'journaled', label: 'Journaled', icon: 'fa-book', color: 'peach' },
];

const STICKER_COLORS = ['gold', 'mint', 'peach', 'sky'];

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
let sleepHours = 0;
let binaryStates = {};    // { stickerId: null | true | false }
let binaryContexts = {};  // { stickerId: string }
let viewMonth = new Date().getMonth();
let viewYear = new Date().getFullYear();

const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Bad' };
const MOOD_CLASSES = { 5: 'great', 4: 'good', 3: 'okay', 2: 'low', 1: 'bad' };
const SLEEP_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Poor', 1: 'Awful' };
const SLEEP_CLASSES = { 5: 'great', 4: 'good', 3: 'okay', 2: 'poor', 1: 'none' };

// ─── Navigation ───────────────────────────────────────────────

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === id);
    });

    // Show/hide save bar (only on daily screen)
    const saveBar = document.querySelector('.save-bar');
    if (saveBar) {
        saveBar.style.display = id === 'screen-daily' ? '' : 'none';
    }
}

// ─── Date Navigation ──────────────────────────────────────────

function changeDay(delta) {
    currentDate.setDate(currentDate.getDate() + delta);
    loadDailyEntry();
}

function isToday(date) {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth() &&
           date.getDate() === now.getDate();
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}

// ─── Section Toggle (Collapse/Expand) ─────────────────────────

function toggleSection(sectionName) {
    const section = document.getElementById(`${sectionName}-section`);
    const chevron = document.getElementById(`${sectionName}-chevron`);
    if (!section) return;

    // Find collapsible content (everything after section-header)
    const header = section.querySelector('.section-header');
    const siblings = Array.from(section.children).filter(el => el !== header);

    const isCollapsed = chevron.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        chevron.classList.remove('collapsed');
        siblings.forEach(el => el.style.display = '');
    } else {
        // Collapse
        chevron.classList.add('collapsed');
        siblings.forEach(el => el.style.display = 'none');
    }
}

// ─── Binary Stickers Rendering ────────────────────────────────

function renderBinaryStickers() {
    const container = document.getElementById('binary-stickers-container');
    container.innerHTML = '';
    const stickers = getStickers();

    stickers.forEach((sticker, idx) => {
        const state = binaryStates[sticker.id];
        const colorClass = sticker.color || STICKER_COLORS[idx % STICKER_COLORS.length];

        const btn = document.createElement('div');
        btn.className = 'binary-sticker';

        if (state === true) {
            btn.classList.add('did-it', `color-${colorClass}`);
        } else if (state === false) {
            btn.classList.add('didnt-do');
        }

        // State indicator badge
        const indicator = document.createElement('div');
        indicator.className = 'state-indicator';
        btn.appendChild(indicator);

        // Icon
        const icon = document.createElement('i');
        icon.className = `fa-solid ${sticker.icon || 'fa-circle-check'} icon`;
        btn.appendChild(icon);

        // Name
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = sticker.label;
        btn.appendChild(name);

        btn.addEventListener('click', () => {
            const cur = binaryStates[sticker.id];
            if (cur === null || cur === undefined) binaryStates[sticker.id] = true;
            else if (cur === true) binaryStates[sticker.id] = false;
            else binaryStates[sticker.id] = null;
            renderBinaryStickers();
            updateBinaryContext();
        });

        container.appendChild(btn);
    });
}

function updateBinaryContext() {
    const ctxArea = document.getElementById('binary-context-area');
    const hasAnySelected = Object.values(binaryStates).some(s => s !== null && s !== undefined);
    if (hasAnySelected) {
        ctxArea.classList.add('visible');
    } else {
        ctxArea.classList.remove('visible');
    }
}

// ─── Daily Entry ──────────────────────────────────────────────

function loadDailyEntry() {
    const entry = getEntry(currentDate);
    currentMood = entry ? entry.mood : null;
    currentSleep = entry ? entry.sleep : null;
    sleepHours = entry ? (entry.sleepHours || 0) : 0;

    // Load binary states
    binaryStates = {};
    binaryContexts = {};
    if (entry && entry.stickers) {
        for (const [id, data] of Object.entries(entry.stickers)) {
            binaryStates[id] = data.state;
            binaryContexts[id] = data.context || '';
        }
    }

    // Date header
    document.getElementById('date-header').textContent = formatDateDisplay(currentDate);

    // Today badge
    const badge = document.getElementById('today-badge');
    if (badge) {
        badge.classList.toggle('hidden', !isToday(currentDate));
    }

    // Mood stickers
    document.querySelectorAll('#mood-row .sticker-wrapper').forEach(wrapper => {
        const level = parseInt(wrapper.dataset.level);
        const sticker = wrapper.querySelector('.sticker-mood');
        if (level === currentMood) {
            sticker.classList.add('selected');
        } else {
            sticker.classList.remove('selected');
        }
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

    // Sleep stickers
    document.querySelectorAll('#sleep-row .sticker-wrapper').forEach(wrapper => {
        const level = parseInt(wrapper.dataset.level);
        const sticker = wrapper.querySelector('.sticker-sleep');
        if (level === currentSleep) {
            sticker.classList.add('selected');
        } else {
            sticker.classList.remove('selected');
        }
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

    // Sleep hours
    const sleepHoursWrapper = document.getElementById('sleep-hours');
    if (currentSleep) {
        sleepHoursWrapper.classList.add('visible');
    } else {
        sleepHoursWrapper.classList.remove('visible');
    }
    document.getElementById('hours-value').textContent = sleepHours;

    // Binary stickers
    renderBinaryStickers();
    updateBinaryContext();
    document.getElementById('binary-context-input').value = entry ? (entry.binaryContext || '') : '';

    // Diary
    document.getElementById('context-note').value = entry ? (entry.contextNote || '') : '';
}

function saveDailyEntry() {
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
        sleepHours: sleepHours,
        stickers: stickersData,
        binaryContext: document.getElementById('binary-context-input').value || null,
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

function getMoodFaceHTML(level) {
    const faces = {
        5: '<div class="face"><div class="eyes"><div class="eye-squinty"></div><div class="eye-squinty"></div></div><div class="mouth-d"></div></div>',
        4: '<div class="face"><div class="eyes"><div class="eye-squinty"></div><div class="eye-squinty"></div></div><div class="mouth-smile"></div></div>',
        3: '<div class="face"><div class="eyes"><div class="eye-dot"></div><div class="eye-dot"></div></div><div class="mouth-flat"></div></div>',
        2: '<div class="face"><div class="eyes"><div class="eye-sad"></div><div class="eye-sad"></div></div><div class="mouth-small-frown"></div></div>',
        1: '<div class="face"><div class="eyes"><div class="eye-x"></div><div class="eye-x"></div></div><div class="mouth-frown"></div></div>',
    };
    return faces[level] || '';
}

function getSleepFaceHTML(level) {
    const faces = {
        5: '<div class="face sleep-face"><div class="eyes"><div class="eye-sleeping"></div><div class="eye-sleeping"></div></div><div class="mouth-d"></div></div>',
        4: '<div class="face sleep-face"><div class="eyes"><div class="eye-sleeping"></div><div class="eye-sleeping"></div></div><div class="mouth-smile"></div></div>',
        3: '<div class="face sleep-face"><div class="eyes"><div class="eye-dot"></div><div class="eye-dot"></div></div><div class="mouth-flat"></div></div>',
        2: '<div class="face sleep-face"><div class="eyes"><div class="eye-sad"></div><div class="eye-sad"></div></div><div class="mouth-small-frown"></div></div>',
        1: '<div class="face sleep-face"><div class="eyes"><div class="eye-x"></div><div class="eye-x"></div></div><div class="mouth-frown"></div></div>',
    };
    return faces[level] || '';
}

function renderMonthView() {
    const title = new Date(viewYear, viewMonth).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
    document.getElementById('month-title').textContent = title;

    const entries = getMonthEntries(viewYear, viewMonth + 1);
    const entryMap = {};
    entries.forEach(e => { entryMap[e.date] = e; });

    const firstDay = new Date(viewYear, viewMonth, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = dateKey(new Date());
    const now = new Date();

    // ── Mood Grid ──
    const moodGrid = document.getElementById('mood-grid');
    moodGrid.innerHTML = '';
    renderGrid(moodGrid, startOffset, daysInMonth, entryMap, today, now, 'mood');

    // ── Sleep Grid ──
    const sleepGrid = document.getElementById('sleep-grid');
    sleepGrid.innerHTML = '';
    renderGrid(sleepGrid, startOffset, daysInMonth, entryMap, today, now, 'sleep');

    // ── Binary Sticker Grids ──
    const binaryContainer = document.getElementById('binary-grids-container');
    binaryContainer.innerHTML = '';
    const stickers = getStickers();
    stickers.forEach(sticker => {
        const card = document.createElement('div');
        card.className = 'sticker-grid-card';

        const titleEl = document.createElement('div');
        titleEl.className = 'grid-title';
        titleEl.innerHTML = `<i class="fa-solid ${sticker.icon || 'fa-circle-check'}"></i> ${sticker.label}`;
        card.appendChild(titleEl);

        const weekdayRow = document.createElement('div');
        weekdayRow.className = 'weekday-row';
        ['M','T','W','T','F','S','S'].forEach(d => {
            const wh = document.createElement('div');
            wh.className = 'weekday-header';
            wh.textContent = d;
            weekdayRow.appendChild(wh);
        });
        card.appendChild(weekdayRow);

        const grid = document.createElement('div');
        grid.className = 'sticker-grid';
        renderGrid(grid, startOffset, daysInMonth, entryMap, today, now, 'binary', sticker.id);
        card.appendChild(grid);

        binaryContainer.appendChild(card);
    });

    // ── Summary ──
    const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-AU', { month: 'long' });
    document.getElementById('summary-month-label').textContent = monthName;

    let loggedDays = 0;
    let moodSum = 0, moodCount = 0;
    let sleepSum = 0, sleepCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const entry = entryMap[key];
        if (entry) {
            loggedDays++;
            if (entry.mood) { moodSum += entry.mood; moodCount++; }
            if (entry.sleep) { sleepSum += entry.sleep; sleepCount++; }
        }
    }

    const loggedPct = daysInMonth > 0 ? Math.round((loggedDays / daysInMonth) * 100) : 0;
    document.getElementById('stat-logged').textContent = loggedPct + '%';
    document.getElementById('stat-mood').textContent = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : '--';
    document.getElementById('stat-sleep').textContent = sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : '--';

    // Logging message
    const msgText = document.getElementById('logging-message-text');
    if (loggedDays === 0) {
        msgText.textContent = 'Start logging to see your patterns!';
    } else if (loggedPct < 50) {
        msgText.textContent = `You've logged ${loggedDays} day${loggedDays > 1 ? 's' : ''} this month. Keep going!`;
    } else if (loggedPct < 80) {
        msgText.textContent = `Great consistency! ${loggedDays} days logged.`;
    } else {
        msgText.textContent = `Amazing! ${loggedPct}% logged this month!`;
    }
}

function renderGrid(grid, startOffset, daysInMonth, entryMap, today, now, type, stickerId) {
    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell empty';
        grid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const entry = entryMap[key];
        const cell = document.createElement('div');
        cell.className = 'grid-cell';

        const isFuture = new Date(viewYear, viewMonth, d) > now;

        if (key === today) cell.classList.add('today');

        // Day number
        const dayNum = document.createElement('span');
        dayNum.className = 'day-num';
        dayNum.textContent = d;
        cell.appendChild(dayNum);

        if (type === 'mood') {
            cell.classList.add('mood');
            if (entry && entry.mood) {
                cell.classList.add(MOOD_CLASSES[entry.mood]);
                cell.innerHTML += getMoodFaceHTML(entry.mood);
                // Add blush for great/good/okay
                if (entry.mood >= 3) {
                    cell.innerHTML += '<span class="blush left"></span><span class="blush right"></span>';
                }
                // Context fold
                if (entry.moodContext || entry.contextNote) {
                    cell.innerHTML += '<div class="context-fold"></div>';
                }
            } else if (isFuture) {
                cell.classList.add('future');
            } else {
                cell.style.background = 'var(--tan)';
                cell.style.opacity = '0.5';
            }
        } else if (type === 'sleep') {
            cell.classList.add('sleep');
            if (entry && entry.sleep) {
                cell.classList.add(SLEEP_CLASSES[entry.sleep]);
                cell.innerHTML += getSleepFaceHTML(entry.sleep);
                if (entry.sleep >= 3) {
                    cell.innerHTML += '<span class="blush left"></span><span class="blush right"></span>';
                }
                if (entry.sleepContext) {
                    cell.innerHTML += '<div class="context-fold"></div>';
                }
            } else if (isFuture) {
                cell.classList.add('future');
            } else {
                cell.style.background = 'var(--tan)';
                cell.style.opacity = '0.5';
            }
        } else if (type === 'binary') {
            cell.classList.add('binary');
            if (entry && entry.stickers && entry.stickers[stickerId]) {
                const stickerState = entry.stickers[stickerId].state;
                if (stickerState === true) {
                    cell.classList.add('did-it');
                } else if (stickerState === false) {
                    cell.classList.add('didnt-do');
                }
            } else if (isFuture) {
                cell.classList.add('future');
            } else {
                cell.style.background = 'var(--tan)';
                cell.style.opacity = '0.5';
            }
        }

        // Keep dayNum on top
        cell.prepend(dayNum);

        // Click to navigate to day
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
            const currentIdx = ICON_OPTIONS.findIndex(o => o.value === sticker.icon);
            const nextIdx = (currentIdx + 1) % ICON_OPTIONS.length;
            sticker.icon = ICON_OPTIONS[nextIdx].value;
            saveStickers(stickers);
            renderStickerLabelsEditor();
        });
        row.appendChild(iconBtn);

        // Color picker
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-picker-btn';
        const colorMap = { gold: '#ffe9b3', mint: '#d0e6db', peach: '#f7e2d9', sky: '#c5dde8' };
        const currentColor = sticker.color || STICKER_COLORS[idx % STICKER_COLORS.length];
        colorBtn.style.background = colorMap[currentColor] || colorMap.gold;
        colorBtn.title = 'Change color';
        colorBtn.addEventListener('click', () => {
            const curIdx = STICKER_COLORS.indexOf(currentColor);
            const nextIdx = (curIdx + 1) % STICKER_COLORS.length;
            sticker.color = STICKER_COLORS[nextIdx];
            saveStickers(stickers);
            renderStickerLabelsEditor();
        });
        row.appendChild(colorBtn);

        // Label input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'label-input';
        input.maxLength = 30;
        input.value = sticker.label;
        input.placeholder = 'Sticker name...';
        input.addEventListener('change', () => {
            sticker.label = input.value.trim() || 'Untitled';
            sticker.id = input.value.trim().toLowerCase().replace(/\s+/g, '_') || sticker.id;
            saveStickers(stickers);
        });
        row.appendChild(input);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
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

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL your entries? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STICKERS_KEY);
        const toast = document.getElementById('toast');
        toast.textContent = 'All data cleared';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
        loadDailyEntry();
    }
}

// ─── Event Listeners ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadDailyEntry();

    // ── Mood sticker taps ──
    document.querySelectorAll('#mood-row .sticker-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const level = parseInt(wrapper.dataset.level);
            currentMood = currentMood === level ? null : level;

            document.querySelectorAll('#mood-row .sticker-wrapper').forEach(w => {
                const s = w.querySelector('.sticker-mood');
                const l = parseInt(w.dataset.level);
                s.classList.toggle('selected', l === currentMood);
            });

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

    // ── Sleep sticker taps ──
    document.querySelectorAll('#sleep-row .sticker-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const level = parseInt(wrapper.dataset.level);
            currentSleep = currentSleep === level ? null : level;

            document.querySelectorAll('#sleep-row .sticker-wrapper').forEach(w => {
                const s = w.querySelector('.sticker-sleep');
                const l = parseInt(w.dataset.level);
                s.classList.toggle('selected', l === currentSleep);
            });

            const sleepCtx = document.getElementById('sleep-context');
            const sleepCtxInput = document.getElementById('sleep-context-input');
            const sleepHoursWrapper = document.getElementById('sleep-hours');
            if (currentSleep) {
                sleepCtx.classList.add('visible');
                sleepHoursWrapper.classList.add('visible');
                sleepCtxInput.placeholder = `${SLEEP_LABELS[currentSleep]} sleep — notes (optional)`;
                sleepCtxInput.focus();
            } else {
                sleepCtx.classList.remove('visible');
                sleepHoursWrapper.classList.remove('visible');
            }
        });
    });

    // ── Sleep Hours +/- ──
    document.getElementById('btn-hours-minus').addEventListener('click', (e) => {
        e.stopPropagation();
        if (sleepHours > 0) {
            sleepHours = Math.max(0, sleepHours - 0.5);
            document.getElementById('hours-value').textContent = sleepHours;
        }
    });

    document.getElementById('btn-hours-plus').addEventListener('click', (e) => {
        e.stopPropagation();
        if (sleepHours < 24) {
            sleepHours = Math.min(24, sleepHours + 0.5);
            document.getElementById('hours-value').textContent = sleepHours;
        }
    });

    // ── Date Navigation ──
    document.getElementById('btn-prev-day').addEventListener('click', () => changeDay(-1));
    document.getElementById('btn-next-day').addEventListener('click', () => changeDay(1));

    // Back button — go to today
    document.getElementById('btn-back-daily').addEventListener('click', () => {
        currentDate = new Date();
        loadDailyEntry();
    });

    // ── Section toggles ──
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.dataset.toggle;
            if (section) toggleSection(section);
        });
    });

    // ── Save ──
    document.getElementById('btn-save').addEventListener('click', saveDailyEntry);

    // ── Bottom Navigation ──
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            if (screen === 'screen-month') {
                viewMonth = currentDate.getMonth();
                viewYear = currentDate.getFullYear();
                renderMonthView();
            } else if (screen === 'screen-settings') {
                loadSettings();
            } else if (screen === 'screen-daily') {
                loadDailyEntry();
            }
            showScreen(screen);
        });
    });

    // ── Month navigation ──
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

    // ── Settings actions ──
    document.getElementById('btn-manage-stickers').addEventListener('click', () => {
        const section = document.getElementById('sticker-editor-section');
        section.style.display = section.style.display === 'none' ? '' : 'none';
        renderStickerLabelsEditor();
    });

    document.getElementById('btn-add-sticker').addEventListener('click', () => {
        const stickers = getStickers();
        const newId = 'sticker_' + Date.now();
        const colorIdx = stickers.length % STICKER_COLORS.length;
        stickers.push({ id: newId, label: 'New Sticker', icon: 'fa-circle-check', color: STICKER_COLORS[colorIdx] });
        saveStickers(stickers);
        renderStickerLabelsEditor();
    });

    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('btn-clear-data').addEventListener('click', clearAllData);
});
