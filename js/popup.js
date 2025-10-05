document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const bodyElement = document.body;
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
    
    // Task Management
    const todayTaskList = document.getElementById('today-task-list');
    const weeklyTaskList = document.getElementById('weekly-task-list');
    const newTodayTaskInput = document.getElementById('new-today-task');
    const addTodayTaskBtn = document.getElementById('add-today-task-btn');
    const newWeeklyTaskInput = document.getElementById('new-weekly-task');
    const addWeeklyTaskBtn = document.getElementById('add-weekly-task-btn');
    const listTitles = document.querySelectorAll('.list-title');

    // Modals & Toasts
    const customToolModal = document.getElementById('custom-tool-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Settings & Stats
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsPanel = settingsOverlay ? settingsOverlay.querySelector('.settings-panel') : null;
    const settingsToggleButton = document.querySelector('.settings-toggle');
    const settingsCloseButton = document.querySelector('.settings-close-btn');
    const fontSizeSelect = document.getElementById('font-size-select');
    const zenCursorToggle = document.getElementById('custom-cursor-toggle');
    const quickLinksToggle = document.getElementById('keep-quick-links-visible');
    const viewStatsButton = document.getElementById('view-stats-btn');
    const resetStatsButton = document.getElementById('reset-stats-btn');
    const statsOverlay = document.getElementById('stats-overlay');
    const statsPanel = statsOverlay ? statsOverlay.querySelector('.stats-panel') : null;
    const statsCloseButton = document.querySelector('.stats-close-btn');
    const statsPeriodButtons = document.querySelectorAll('.stats-period-btn');
    const statsMeditationTotal = document.getElementById('stats-meditation-total');
    const statsMeditationAverage = document.getElementById('stats-meditation-average');
    const statsMeditationFavorite = document.getElementById('stats-meditation-favorite');
    const statsMeditationSessions = document.getElementById('stats-meditation-sessions');
    const statsMeditationTrend = document.getElementById('meditation-time-trend');
    const statsTasksCompleted = document.getElementById('stats-tasks-completed');
    const statsTasksCompletionRate = document.getElementById('stats-tasks-completion-rate');
    const statsTasksClosed = document.getElementById('stats-tasks-closed');
    const statsTasksProductiveDay = document.getElementById('stats-tasks-productive-day');
    const statsTasksTrend = document.getElementById('tasks-completed-trend');
    const statsHistoryContainer = document.getElementById('stats-history-rows');
    const settingsStatMeditationTime = document.getElementById('stat-meditation-time');
    const settingsStatMeditationSessions = document.getElementById('stat-meditation-sessions');
    const settingsStatTasksCompleted = document.getElementById('stat-tasks-completed');
    const settingsStatTasksClosed = document.getElementById('stat-tasks-closed');
    const toastContainer = document.getElementById('toast-container');
    const quickNotesIcon = document.querySelector('.quick-notes-icon');
    const quickNotesPanel = document.querySelector('.quick-notes-panel');
    const quickNotesTextarea = quickNotesPanel ? quickNotesPanel.querySelector('textarea') : null;
    const quickNotesFontButtons = quickNotesPanel ? quickNotesPanel.querySelectorAll('.font-size-btn') : [];
    
    // AI Tools
    const aiLinksContainer = document.querySelector('.ai-links-vertical');
    const addToolButton = document.querySelector('.add-tool-button');
    const addCustomToolButton = document.getElementById('add-custom-tool');
    const toolLabelInput = document.getElementById('tool-label');
    const toolUrlInput = document.getElementById('tool-url');
    const editToolModal = document.getElementById('edit-tool-modal');
    const editToolLabelInput = document.getElementById('edit-tool-label');
    const editToolUrlInput = document.getElementById('edit-tool-url');
    const saveEditToolButton = document.getElementById('save-edit-tool');
    const aiToolsPanel = document.querySelector('.ai-tools-panel');
    const aiToolsToggle = document.querySelector('.ai-tools-toggle');
    
    const storageSync = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync)
        ? chrome.storage.sync
        : {
              get: (keys, callback) => callback({}),
              set: (data, callback) => callback && callback()
          };
    
    // Meditation
    const taskManagerView = document.querySelector('.task-manager-view');
    const meditationView = document.querySelector('.meditation-view');
    const meditationTriggerButton = document.querySelector('.meditation-trigger');
    const startStopMeditationButton = document.querySelector('.start-stop-meditation');
    const meditationTimerElement = document.querySelector('.meditation-timer');
    const breathingBubble = document.querySelector('.breathing-bubble');
    const prepareMessageElement = document.querySelector('.prepare-message');
    const meditationDurationInput = document.getElementById('meditation-duration-input');
    const meditationDurationInputPlus = document.getElementById('meditation-duration-input-plus');
    const meditationDurationInputMinus = document.getElementById('meditation-duration-input-minus');
    const meditationModeSelector = document.querySelector('.meditation-mode-selector');
    const meditationAudio = new Audio();
    let muteButton = null;
    let volumeBars = null;

    // --- State Variables ---
    let draggedItem = null;
    let listData = { today: "Today's Tasks", weekly: "Weekly Tasks" };
    let meditationTimerInterval;
    let meditationDuration = 300; // 5 minutes default
    let timeRemaining = 300;
    let isMeditationActive = false;
    const meditationModes = [
        { name: 'Forest', class: 'forest-mode', sound: 'assets/sounds/forest.mp3' },
        { name: 'Rain', class: 'rain-mode', sound: 'assets/sounds/rain.mp3' },
        { name: 'Waves', class: 'waves-mode', sound: 'assets/sounds/waves.mp3' }
    ];
    let currentMeditationMode = meditationModes[0];
    let isMuted = false;
    let currentVolume = 0.5;
    const VOLUME_INCREMENT = 0.1;
    const MAX_AI_TOOLS = 10;
    let editingToolIndex = -1;
    const DEFAULT_SETTINGS = { fontSize: 'small', zenCursor: false, keepQuickLinksVisible: false };
    let userSettings = { ...DEFAULT_SETTINGS };
    const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let activeFocusTrap = null;
    let previouslyFocusedElement = null;

    const STATS_HISTORY_LIMIT = 400;
    let productivityStats = createDefaultStats();
    let currentStatsPeriod = 'all';
    let statsRenderCache = { period: null, summary: null };

    const STATS_PERIOD_CONFIG = {
        all: { label: 'All Time', days: null },
        daily: { label: 'Daily', days: 1 },
        weekly: { label: 'Weekly', days: 7 },
        monthly: { label: 'Monthly', days: 30 },
        yearly: { label: 'Yearly', days: 365 }
    };
    const HISTORY_TABLE_LIMIT = 60;

    let meditationSessionStart = null;
    let meditationSessionElapsedSeconds = 0;
    let meditationPreparationTimeout = null;

    // NEW FEATURES
    let ENABLE_NEW_FEATURES = true;

    // --- Cursor Follower State ---
    let cursorDot = null;
    let cursorCircle = null;
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let circleX = 0;
    let circleY = 0;
    let isMouseActive = false;
    let cursorAnimationId = null;
    let isCursorAnimationActive = false;
    let cursorEventsBound = false;
    const CURSOR_LERP_FACTOR = 0.15; // Smooth easing factor for circle
    const DOT_LERP_FACTOR = 0.8; // Slight delay for dot (higher = faster)

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function deactivateFocusTrap() {
        if (!activeFocusTrap) return;
        const { container, handler } = activeFocusTrap;
        container.removeEventListener('keydown', handler);
        activeFocusTrap = null;
    }

    function activateFocusTrap(container) {
        if (!container) return;
        const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
            (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        deactivateFocusTrap();

        const handleKeydown = (event) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else if (document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        container.addEventListener('keydown', handleKeydown);
        activeFocusTrap = { container, handler: handleKeydown };

        setTimeout(() => first.focus(), 0);
    }

    function persistSettings(changes, callback) {
        userSettings = { ...userSettings, ...changes };
        storageSync.set({ userSettings }, () => {
            if (typeof callback === 'function') callback();
        });
    }

    function applyFontSizePreference(size, persist = true) {
        const normalized = ['small', 'medium', 'large'].includes(size) ? size : DEFAULT_SETTINGS.fontSize;
        userSettings.fontSize = normalized;

        bodyElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
        bodyElement.classList.add(`font-size-${normalized}`);

        if (fontSizeSelect) {
            fontSizeSelect.value = normalized;
        }

        if (persist) {
            persistSettings({ fontSize: normalized });
        }
    }

    function applyZenCursor(enabled, persist = true) {
        let shouldEnable = Boolean(enabled);

        if (zenCursorToggle) {
            zenCursorToggle.checked = shouldEnable;
        }

        if (shouldEnable) {
            const initialized = initializeCursorFollower();
            if (!initialized) {
                shouldEnable = false;
                if (zenCursorToggle) {
                    zenCursorToggle.checked = false;
                }
            }
        }

        bodyElement.classList.toggle('zen-cursor-enabled', shouldEnable);

        if (shouldEnable) {
            bindCursorEvents();
            isMouseActive = true;
            bodyElement.classList.add('cursor-active');
            startCursorAnimation();
        } else {
            stopCursorAnimation();
            unbindCursorEvents();
            isMouseActive = false;
            bodyElement.classList.remove('cursor-active');
        }

        userSettings.zenCursor = shouldEnable;

        if (persist) {
            persistSettings({ zenCursor: shouldEnable });
        }
    }

    function updateAiToolsToggleState() {
        if (!aiToolsToggle) return;
        const expanded = aiToolsPanel ? aiToolsPanel.classList.contains('visible') : false;
        aiToolsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    function applyQuickLinksPinned(enabled, persist = true) {
        const isPinned = Boolean(enabled);
        userSettings.keepQuickLinksVisible = isPinned;

        if (quickLinksToggle) {
            quickLinksToggle.checked = isPinned;
        }

        if (aiToolsPanel && aiToolsToggle) {
            if (isPinned) {
                aiToolsPanel.classList.add('visible');
                aiToolsToggle.classList.add('active');
                aiToolsToggle.classList.add('pinned');
                aiToolsToggle.setAttribute('aria-disabled', 'true');
                aiToolsToggle.setAttribute('tabindex', '-1');
                aiToolsToggle.title = 'Quick Links are pinned in Settings';
            } else {
                aiToolsToggle.classList.remove('pinned');
                aiToolsToggle.setAttribute('aria-disabled', 'false');
                aiToolsToggle.setAttribute('tabindex', '0');
                aiToolsToggle.title = 'Show/Hide AI Tools';
            }
            updateAiToolsToggleState();
        }

        if (persist) {
            persistSettings({ keepQuickLinksVisible: isPinned });
        }
    }

    function applySettings(settings, persist = false) {
        const nextSettings = { ...DEFAULT_SETTINGS, ...settings };
        userSettings = nextSettings;

        applyFontSizePreference(nextSettings.fontSize, false);
        applyZenCursor(nextSettings.zenCursor, false);
        applyQuickLinksPinned(nextSettings.keepQuickLinksVisible, false);

        if (persist) {
            persistSettings({}, null);
        }
    }

    function createDefaultStats() {
        return {
            version: 1,
            meditation: {
                totalDurationSeconds: 0,
                sessionCount: 0,
                modeCounts: {},
                history: []
            },
            tasks: {
                completed: 0,
                closed: 0,
                history: []
            }
        };
    }

    function hydrateStats(rawStats) {
        const defaults = createDefaultStats();
        if (!rawStats || typeof rawStats !== 'object') {
            return defaults;
        }

        const hydrated = { ...defaults };
        hydrated.version = Number.isFinite(rawStats.version) ? rawStats.version : defaults.version;

        const meditation = rawStats.meditation || {};
        hydrated.meditation.totalDurationSeconds = Number.isFinite(meditation.totalDurationSeconds)
            ? meditation.totalDurationSeconds
            : defaults.meditation.totalDurationSeconds;
        hydrated.meditation.sessionCount = Number.isFinite(meditation.sessionCount)
            ? meditation.sessionCount
            : defaults.meditation.sessionCount;
        hydrated.meditation.modeCounts = typeof meditation.modeCounts === 'object' && meditation.modeCounts
            ? { ...meditation.modeCounts }
            : { ...defaults.meditation.modeCounts };
        hydrated.meditation.history = Array.isArray(meditation.history)
            ? [...meditation.history].slice(0, STATS_HISTORY_LIMIT)
            : [...defaults.meditation.history];

        const tasks = rawStats.tasks || {};
        hydrated.tasks.completed = Number.isFinite(tasks.completed) ? tasks.completed : defaults.tasks.completed;
        hydrated.tasks.closed = Number.isFinite(tasks.closed) ? tasks.closed : defaults.tasks.closed;
        hydrated.tasks.history = Array.isArray(tasks.history)
            ? [...tasks.history].slice(0, STATS_HISTORY_LIMIT)
            : [...defaults.tasks.history];

        return hydrated;
    }

    function persistStats() {
        storageSync.set({ productivityStats }, () => {});
    }

    function invalidateStatsCache() {
        statsRenderCache.period = null;
        statsRenderCache.summary = null;
    }

    function pushHistoryEntry(history, entry) {
        history.unshift(entry);
        if (history.length > STATS_HISTORY_LIMIT) {
            history.length = STATS_HISTORY_LIMIT;
        }
    }

    function recordMeditationSession(durationSeconds, modeName, metadata = {}) {
        const duration = Number(durationSeconds);
        if (!Number.isFinite(duration) || duration <= 0) {
            return;
        }

        const modeKey = modeName || 'Unknown';
        const meditationStats = productivityStats.meditation;
        meditationStats.totalDurationSeconds += duration;
        meditationStats.sessionCount += 1;
        meditationStats.modeCounts[modeKey] = (meditationStats.modeCounts[modeKey] || 0) + 1;

        const { timestamp: metadataTimestamp, ...restMetadata } = metadata || {};
        const timestamp = Number(metadataTimestamp) || Date.now();

        pushHistoryEntry(meditationStats.history, {
            id: cryptoRandomId(),
            type: 'meditation',
            timestamp,
            durationSeconds: duration,
            mode: modeKey,
            ...restMetadata
        });

        invalidateStatsCache();
        persistStats();
        renderStatsSummary();
        if (statsOverlay && statsOverlay.classList.contains('active')) {
            renderStatsOverlay(true);
        }
    }

    function formatDuration(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) {
            return '0m';
        }
        const totalMinutes = Math.floor(seconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    function formatTrend(current, previous, type = 'count') {
        const prev = Number.isFinite(previous) ? previous : 0;
        const diff = current - prev;
        if (type === 'time') {
            if (Math.abs(diff) < 60) {
                return '—';
            }
            return `${diff > 0 ? '↑' : '↓'} ${formatDuration(Math.abs(diff))}`;
        }
        if (Math.abs(diff) < 1) {
            return '—';
        }
        return `${diff > 0 ? '↑' : '↓'} ${Math.abs(diff)}`;
    }

    function getPeriodStartTimestamp(periodKey) {
        const config = STATS_PERIOD_CONFIG[periodKey] || STATS_PERIOD_CONFIG.all;
        if (!config.days) {
            return null;
        }
        return Date.now() - config.days * 24 * 60 * 60 * 1000;
    }

    function getStartOfDayTimestamp(timestamp) {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    }

    function formatDateLabel(timestamp) {
        return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function aggregateHistoryBuckets(meditationHistory, taskHistory) {
        const buckets = new Map();

        const ensureBucket = (timestamp) => {
            const dayStart = getStartOfDayTimestamp(timestamp || Date.now());
            let bucket = buckets.get(dayStart);
            if (!bucket) {
                bucket = {
                    timestamp: dayStart,
                    label: formatDateLabel(dayStart),
                    meditationSeconds: 0,
                    tasksCompleted: 0,
                    tasksClosed: 0
                };
                buckets.set(dayStart, bucket);
            }
            return bucket;
        };

        meditationHistory.forEach((entry) => {
            const bucket = ensureBucket(entry.timestamp);
            bucket.meditationSeconds += entry.durationSeconds || 0;
        });

        taskHistory.forEach((entry) => {
            const bucket = ensureBucket(entry.timestamp);
            if (entry.action === 'completed') {
                bucket.tasksCompleted += 1;
            } else if (entry.action === 'closed') {
                bucket.tasksClosed += 1;
            }
        });

        return Array.from(buckets.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, HISTORY_TABLE_LIMIT);
    }

    function buildStatsSnapshot(periodKey) {
        const startTimestamp = getPeriodStartTimestamp(periodKey);
        const periodConfig = STATS_PERIOD_CONFIG[periodKey] || STATS_PERIOD_CONFIG.all;
        const periodDurationMs = periodConfig.days ? periodConfig.days * 24 * 60 * 60 * 1000 : null;

        const meditationHistory = startTimestamp
            ? productivityStats.meditation.history.filter((entry) => entry.timestamp >= startTimestamp)
            : [...productivityStats.meditation.history];

        const taskHistory = startTimestamp
            ? productivityStats.tasks.history.filter((entry) => entry.timestamp >= startTimestamp)
            : [...productivityStats.tasks.history];

        const meditationTotalSeconds = meditationHistory.reduce(
            (sum, entry) => sum + (entry.durationSeconds || 0),
            0
        );
        const meditationSessions = meditationHistory.length;
        const meditationAverageSeconds = meditationSessions
            ? Math.round(meditationTotalSeconds / meditationSessions)
            : 0;

        let favoriteMode = '—';
        if (meditationHistory.length) {
            const modeCounts = meditationHistory.reduce((acc, entry) => {
                if (entry.mode) {
                    acc[entry.mode] = (acc[entry.mode] || 0) + 1;
                }
                return acc;
            }, {});
            const sortedModes = Object.entries(modeCounts).sort((a, b) => b[1] - a[1]);
            if (sortedModes.length) {
                favoriteMode = sortedModes[0][0];
            }
        }

        const tasksCompleted = taskHistory.filter((entry) => entry.action === 'completed').length;
        const tasksClosed = taskHistory.filter((entry) => entry.action === 'closed').length;
        const completionRate =
            tasksCompleted + tasksClosed > 0
                ? Math.round((tasksCompleted / (tasksCompleted + tasksClosed)) * 100)
                : null;

        let previousMeditationTotal = 0;
        let previousTasksCompleted = 0;
        if (periodDurationMs) {
            const previousStart = startTimestamp - periodDurationMs;
            const previousMeditation = productivityStats.meditation.history.filter(
                (entry) => entry.timestamp >= previousStart && entry.timestamp < startTimestamp
            );
            const previousTasks = productivityStats.tasks.history.filter(
                (entry) => entry.timestamp >= previousStart && entry.timestamp < startTimestamp
            );
            previousMeditationTotal = previousMeditation.reduce(
                (sum, entry) => sum + (entry.durationSeconds || 0),
                0
            );
            previousTasksCompleted = previousTasks.filter((entry) => entry.action === 'completed').length;
        }

        const historyBuckets = aggregateHistoryBuckets(meditationHistory, taskHistory);
        const productiveEntry = historyBuckets.reduce((best, entry) => {
            if (!best || entry.tasksCompleted > best.tasksCompleted) {
                return entry;
            }
            return best;
        }, null);

        return {
            meditationTotalSeconds,
            meditationSessions,
            meditationAverageSeconds,
            favoriteMode,
            tasksCompleted,
            tasksClosed,
            completionRate,
            meditationTrendText: periodDurationMs ? formatTrend(meditationTotalSeconds, previousMeditationTotal, 'time') : '—',
            tasksTrendText: periodDurationMs ? formatTrend(tasksCompleted, previousTasksCompleted, 'count') : '—',
            historyBuckets,
            mostProductiveDayLabel: productiveEntry ? productiveEntry.label : '—'
        };
    }

    function renderStatsSummary() {
        if (!settingsStatMeditationTime || !settingsStatMeditationSessions || !settingsStatTasksCompleted || !settingsStatTasksClosed) {
            return;
        }

        settingsStatMeditationTime.textContent = formatDuration(productivityStats.meditation.totalDurationSeconds);
        settingsStatMeditationSessions.textContent = productivityStats.meditation.sessionCount;
        settingsStatTasksCompleted.textContent = productivityStats.tasks.completed;
        settingsStatTasksClosed.textContent = productivityStats.tasks.closed;

        statsRenderCache.summary = {
            meditationTotalSeconds: productivityStats.meditation.totalDurationSeconds,
            meditationSessions: productivityStats.meditation.sessionCount,
            tasksCompleted: productivityStats.tasks.completed,
            tasksClosed: productivityStats.tasks.closed
        };
    }

    function updateStatsPeriodButtons() {
        if (!statsPeriodButtons || !statsPeriodButtons.length) {
            return;
        }

        statsPeriodButtons.forEach((button) => {
            const period = button.dataset.period || 'all';
            const isActive = period === currentStatsPeriod;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function setStatsPeriod(period, persist = true) {
        const normalized = STATS_PERIOD_CONFIG[period] ? period : 'all';
        if (currentStatsPeriod === normalized) {
            if (persist) {
                storageSync.set({ selectedStatsPeriod: currentStatsPeriod }, () => {});
            }
            return;
        }

        currentStatsPeriod = normalized;
        updateStatsPeriodButtons();
        renderStatsOverlay(true);

        if (persist) {
            storageSync.set({ selectedStatsPeriod: currentStatsPeriod }, () => {});
        }
    }

    function renderStatsOverlay(force = false) {
        if (!statsMeditationTotal || !statsMeditationAverage || !statsMeditationFavorite || !statsMeditationSessions) {
            return;
        }

        if (!force && statsRenderCache.period === currentStatsPeriod) {
            return;
        }

        const snapshot = buildStatsSnapshot(currentStatsPeriod);
        statsRenderCache.period = currentStatsPeriod;

        statsMeditationTotal.textContent = formatDuration(snapshot.meditationTotalSeconds);
        statsMeditationAverage.textContent = formatDuration(snapshot.meditationAverageSeconds);
        statsMeditationFavorite.textContent = snapshot.favoriteMode || '—';
        statsMeditationSessions.textContent = snapshot.meditationSessions;
        statsMeditationTrend.textContent = snapshot.meditationTrendText || '—';

        statsTasksCompleted.textContent = snapshot.tasksCompleted;
        statsTasksCompletionRate.textContent = snapshot.completionRate !== null ? `${snapshot.completionRate}%` : '—';
        statsTasksClosed.textContent = snapshot.tasksClosed;
        statsTasksProductiveDay.textContent = snapshot.mostProductiveDayLabel || '—';
        statsTasksTrend.textContent = snapshot.tasksTrendText || '—';

        if (statsHistoryContainer) {
            statsHistoryContainer.innerHTML = '';
            if (!snapshot.historyBuckets.length) {
                const emptyRow = document.createElement('p');
                emptyRow.className = 'stats-empty';
                emptyRow.textContent = 'Start meditating and completing tasks to see your history here.';
                statsHistoryContainer.appendChild(emptyRow);
            } else {
                snapshot.historyBuckets.forEach((entry) => {
                    const row = document.createElement('div');
                    row.className = 'stats-history-row';
                    row.innerHTML = `
                        <span>${entry.label}</span>
                        <span>${entry.meditationSeconds ? formatDuration(entry.meditationSeconds) : '—'}</span>
                        <span>${entry.tasksCompleted || 0}</span>
                        <span>${entry.tasksClosed || 0}</span>
                    `;
                    statsHistoryContainer.appendChild(row);
                });
            }
        }
    }

    function triggerTaskCompletionAnimation(taskListElement, index) {
        if (!taskListElement) {
            return;
        }
        const item = taskListElement.children[index];
        if (!item) {
            return;
        }
        item.classList.add('completion-anim');
        setTimeout(() => item.classList.remove('completion-anim'), 900);
    }

    function recordTaskEvent({ action, listId, task, timestamp = Date.now() }) {
        if (!action || !timestamp) return;

        const tasksStats = productivityStats.tasks;
        if (action === 'completed') {
            tasksStats.completed += 1;
        } else if (action === 'closed') {
            tasksStats.closed += 1;
        } else {
            return;
        }

        pushHistoryEntry(tasksStats.history, {
            id: cryptoRandomId(),
            type: 'task',
            action,
            listId: listId || null,
            timestamp,
            text: task && task.text ? task.text : undefined
        });

        invalidateStatsCache();
        persistStats();
        renderStatsSummary();
        if (statsOverlay && statsOverlay.classList.contains('active')) {
            renderStatsOverlay(true);
        }
    }

    function cryptoRandomId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function handleOverlayBackdropClick(event, overlayElement, closeFn) {
        if (!overlayElement || typeof closeFn !== 'function') return;
        const backdrop = overlayElement.querySelector('.settings-backdrop, .stats-backdrop');
        if (event.target === overlayElement || (backdrop && event.target === backdrop)) {
            closeFn();
        }
    }

    function openSettingsOverlay() {
        if (!settingsOverlay) return;
        previouslyFocusedElement = document.activeElement || settingsToggleButton;
        settingsOverlay.classList.add('active');
        settingsOverlay.setAttribute('aria-hidden', 'false');
        activateFocusTrap(settingsPanel);
    }

    function closeSettingsOverlay(restoreFocus = true) {
        if (!settingsOverlay) return;
        settingsOverlay.classList.remove('active');
        settingsOverlay.setAttribute('aria-hidden', 'true');
        deactivateFocusTrap();
        if (restoreFocus && previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
            previouslyFocusedElement.focus();
        }
        previouslyFocusedElement = null;
    }

    function openStatsOverlay() {
        if (!statsOverlay) return;
        previouslyFocusedElement = document.activeElement || viewStatsButton;
        if (settingsOverlay && settingsOverlay.classList.contains('active')) {
            closeSettingsOverlay(false);
        }
        statsOverlay.classList.add('active');
        statsOverlay.setAttribute('aria-hidden', 'false');
        activateFocusTrap(statsPanel);
        renderStatsOverlay(true);
    }

    function closeStatsOverlay(restoreFocus = true) {
        if (!statsOverlay) return;
        statsOverlay.classList.remove('active');
        statsOverlay.setAttribute('aria-hidden', 'true');
        deactivateFocusTrap();
        if (restoreFocus && previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
            previouslyFocusedElement.focus();
        }
        previouslyFocusedElement = null;
    }

    // --- Initialization ---
    function initializeApp() {
        updateDateTime();
        setInterval(updateDateTime, 30000); // Update time periodically
        loadData();
    }

    // --- Data Management & Core UI ---
    function loadData() {
    storageSync.get([
            'todayTasks',
            'weeklyTasks',
            'aiTools',
            'isDarkMode',
            'listData',
            'meditationDuration',
            'currentMeditationModeName',
            'isMuted',
            'meditationVolume',
            'quickNotes',
            'notesFontSize',
            'productivityStats',
            'userSettings',
            'selectedStatsPeriod'
        ], (result) => {
            // Dark Mode
            const isDarkMode = result.isDarkMode || false;
            applyTheme('theme-natural', isDarkMode);
            if (darkModeCheckbox) darkModeCheckbox.checked = isDarkMode;

            // List Titles
            listData = result.listData || { today: "Today's Tasks", weekly: "Weekly Tasks" };
            updateListTitles();
            
            // Tasks
            const todayTasks = result.todayTasks || [];
            renderTasks(todayTasks, todayTaskList, 'today');
            updateBadgeText(todayTasks);
            
            const weeklyTasks = result.weeklyTasks || [];
            renderTasks(weeklyTasks, weeklyTaskList, 'weekly');
            
            // AI Tools
            let aiTools = result.aiTools;
            if (!aiTools) {
                // Set default quick links for new users only
                aiTools = [
                    { label: 'ChatGPT', url: 'https://chat.openai.com/', color: '#094637' },
                    { label: 'Gemini', url: 'https://gemini.google.com/app', color: '#4f46e5' },
                    { label: 'Claude AI', url: 'https://claude.ai/', color: '#945104' },
                    { label: 'Perplexity AI', url: 'https://www.perplexity.ai/', color: '#7C3AED' },
                    { label: 'GitHub', url: 'https://github.com/', color: '#333' },
                    { label: 'OpenRouter.ai', url: 'https://openrouter.ai/', color: '#FF6B35' },
                    { label: 'Reddit', url: 'https://www.reddit.com/', color: '#FF4500' },
                    { label: 'YouTube', url: 'https://www.youtube.com/', color: '#FF0000' }
                ];
                storageSync.set({ aiTools }, () => {});
            }
            renderAITools(aiTools);

            // Meditation
            meditationDuration = result.meditationDuration || 300;
            timeRemaining = meditationDuration;
            meditationDurationInput.value = Math.floor(meditationDuration / 60);
            updateMeditationTimerDisplay();
            
            const savedModeName = result.currentMeditationModeName || meditationModes[0].name;
            currentMeditationMode = meditationModes.find(m => m.name === savedModeName) || meditationModes[0];
            isMuted = result.isMuted || false;
            currentVolume = result.meditationVolume !== undefined ? result.meditationVolume : 0.5;
            
            renderMeditationModeSelectors();
            applyMeditationMode(currentMeditationMode);
            applyMuteState(isMuted);
            meditationAudio.volume = currentVolume;
            updateVolumeScaleDisplay();

            // Quick Notes
            const quickNotes = result.quickNotes || '';
            const notesFontSize = result.notesFontSize || 14; // default 14px
            const quickNotesTextarea = document.querySelector('.quick-notes-panel textarea');
            if (quickNotesTextarea) {
                quickNotesTextarea.value = quickNotes;
                quickNotesTextarea.style.fontSize = notesFontSize + 'px';
            }

            const savedSettings = result.userSettings || DEFAULT_SETTINGS;
            applySettings(savedSettings, false);

            productivityStats = hydrateStats(result.productivityStats);
            if (!result.productivityStats) {
                persistStats();
            }
            renderStatsSummary();
            updateStatsPeriodButtons();
            if (statsOverlay && statsOverlay.classList.contains('active')) {
                renderStatsOverlay(true);
            }
        });
    }

    function applyTheme(theme, isDarkMode) {
        bodyElement.classList.remove('dark-mode');
        Array.from(bodyElement.classList)
            .filter((cls) => cls.startsWith('theme-'))
            .forEach((cls) => bodyElement.classList.remove(cls));

        if (isDarkMode) {
            bodyElement.classList.add('dark-mode');
        }
        bodyElement.classList.add(`${theme}-${isDarkMode ? 'dark' : 'light'}`);
    }

    function updateBadgeText(todayTasks) {
        if (chrome.action && chrome.action.setBadgeText) {
            const incompleteCount = (todayTasks || []).filter(task => !task.completed).length;
            chrome.action.setBadgeText({ text: incompleteCount > 0 ? String(incompleteCount) : '' });
            chrome.action.setBadgeBackgroundColor({ color: '#E53E3E' });
        }
    }

    function showToast(message, options = {}) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (options.type) {
            toast.classList.add(`${options.type}-toast`);
        }
        toast.textContent = message;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        const duration = options.duration || 3000;
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, duration);
    }

    function showMeditationNotification(title, message) {
        if (typeof chrome !== 'undefined' && chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'assets/icons/list.png',
                title: title,
                message: message,
                silent: true // Gentle notification
            });
        }
    }

    // --- Task List Functions ---
    function updateListTitles() {
        document.querySelectorAll('.task-card').forEach(card => {
            const listId = card.dataset.listId;
            if (listData[listId]) {
                card.querySelector('.list-title').textContent = listData[listId];
            }
        });
    }

    function handleTitleEdit(event) {
        const titleElement = event.target;
        const originalTitle = titleElement.textContent;
        const card = titleElement.closest('.task-card');
        const listId = card.dataset.listId;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalTitle;
        input.className = 'list-title-input';
        titleElement.replaceWith(input);
        input.focus();
        input.select();
        const saveTitle = () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== originalTitle) {
                listData[listId] = newTitle;
                chrome.storage.sync.set({ listData });
                showToast("List renamed!");
                titleElement.textContent = newTitle;
            } else {
                titleElement.textContent = originalTitle;
            }
            input.replaceWith(titleElement);
        };
        input.addEventListener('blur', saveTitle);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    }

    // --- Task Item Functions ---
    function renderTasks(tasks, taskListElement, taskType) {
        taskListElement.innerHTML = '';
        (tasks || []).forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.className = task.completed ? 'completed' : '';
            if (!task.completed) {
                const age = taskType === 'today' ? getDaysSinceCreation(task.createdAt) : getWeeksSinceCreation(task.createdAt);
                if (age >= 3) listItem.classList.add('aged-3');
                else if (age >= 2) listItem.classList.add('aged-2');
                else if (age >= 1) listItem.classList.add('aged-1');
            }
            if (task.starred) listItem.classList.add('starred-task');
            listItem.setAttribute('draggable', true);
            listItem.dataset.index = index; // Store original index for data manipulation
            listItem.innerHTML = `
                <input type="checkbox" title="Mark as complete" ${task.completed ? 'checked' : ''}>
                <i class="fa-star ${task.starred ? 'fas' : 'far'}" title="Star task"></i>
                <span class="task-text">${task.text}</span>
                <button class="remove-task" title="Remove task">x</button>
            `;
            taskListElement.appendChild(listItem);
        });
    }

    function startTaskInlineEdit(listItem, taskType, taskListElement) {
        if (listItem.classList.contains('editing')) return;
        const taskTextElement = listItem.querySelector('.task-text');
        if (!taskTextElement) return;

        const storageKey = `${taskType}Tasks`;
        const originalText = taskTextElement.textContent;

        const textarea = document.createElement('textarea');
        textarea.className = 'task-edit-input';
        textarea.value = originalText;

        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        const restoreSpan = (value) => {
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = value;
            textarea.replaceWith(span);
        };

        const exitEditMode = () => {
            listItem.classList.remove('editing');
            listItem.setAttribute('draggable', true);
            textarea.removeEventListener('blur', handleBlur);
            textarea.removeEventListener('keydown', handleKeyDown);
        };

        const commitChanges = (shouldSave) => {
            exitEditMode();
            const newValue = textarea.value.trim();

            if (!shouldSave || newValue === originalText) {
                restoreSpan(originalText);
                return;
            }

            if (!newValue.length) {
                showToast('Task cannot be empty.');
                restoreSpan(originalText);
                return;
            }

            storageSync.get([storageKey], (result) => {
                const tasks = result[storageKey] || [];
                const index = parseInt(listItem.dataset.index, 10);
                if (Number.isNaN(index) || !tasks[index]) {
                    restoreSpan(originalText);
                    return;
                }
                tasks[index].text = newValue;
                storageSync.set({ [storageKey]: tasks }, () => {
                    renderTasks(tasks, taskListElement, taskType);
                });
            });
        };

        const handleBlur = () => commitChanges(true);
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                commitChanges(true);
            } else if (event.key === 'Escape') {
                event.preventDefault();
                commitChanges(false);
            }
        };

        listItem.classList.add('editing');
        listItem.setAttribute('draggable', false);
        taskTextElement.replaceWith(textarea);
        textarea.focus();
        textarea.select();
        autoResize();

        textarea.addEventListener('blur', handleBlur);
        textarea.addEventListener('keydown', handleKeyDown);
        textarea.addEventListener('input', autoResize);
    }

    function addTask(taskText, taskType, taskListElement) {
        if (taskText.trim() === '') return;
        const storageKey = `${taskType}Tasks`;
        chrome.storage.sync.get([storageKey], (result) => {
            const tasks = result[storageKey] || [];
            tasks.push({ text: taskText, completed: false, createdAt: new Date().toISOString(), starred: false });
            chrome.storage.sync.set({ [storageKey]: tasks }, () => {
                renderTasks(tasks, taskListElement, taskType);
                if (taskType === 'today') updateBadgeText(tasks);
                showToast("Task added!");
            });
        });
    }

    function handleTaskAction(event, taskType, taskListElement) {
        const target = event.target;
        const listItem = target.closest('li');
        if (!listItem) return;

        if (target.classList.contains('task-text')) {
            startTaskInlineEdit(listItem, taskType, taskListElement);
            return;
        }
        
        // Use the stored data-index for accuracy, not DOM position
        const index = parseInt(listItem.dataset.index, 10);
        const storageKey = `${taskType}Tasks`;

        chrome.storage.sync.get(storageKey, (result) => {
            let tasks = result[storageKey] || [];
            if (index < 0 || index >= tasks.length) return;

            let actionTaken = false;
            let completedTaskForStats = null;
            let closedTaskForStats = null;

            if (target.type === 'checkbox') {
                const task = tasks[index];
                const wasCompleted = task.completed;
                task.completed = target.checked;
                if (task.completed) {
                    task.starred = false;
                    if (!wasCompleted) {
                        completedTaskForStats = { ...task };
                        showToast('Task completed!', { type: 'completion' });
                    }
                }
                actionTaken = true;
            } else if (target.classList.contains('fa-star')) {
                if (!tasks[index].completed) {
                    tasks[index].starred = !tasks[index].starred;
                    actionTaken = true;
                }
            } else if (target.classList.contains('remove-task')) {
                const [removedTask] = tasks.splice(index, 1);
                if (removedTask) {
                    closedTaskForStats = removedTask;
                }
                showToast("Task removed.");
                actionTaken = true;
            }

            if (actionTaken) {
                chrome.storage.sync.set({ [storageKey]: tasks }, () => {
                    renderTasks(tasks, taskListElement, taskType);
                    if (taskType === 'today') updateBadgeText(tasks);

                    if (completedTaskForStats) {
                        recordTaskEvent({
                            action: 'completed',
                            listId: taskType,
                            task: completedTaskForStats,
                            timestamp: Date.now()
                        });
                    }

                    if (closedTaskForStats) {
                        recordTaskEvent({
                            action: 'closed',
                            listId: taskType,
                            task: closedTaskForStats,
                            timestamp: Date.now()
                        });
                    }
                });
            }
        });
    }
    
    // --- Drag and Drop Functions ---
    function handleDragStart(event) {
        if (!event.target.matches('li')) return;
        draggedItem = event.target;
        const sourceListId = draggedItem.closest('.task-card').dataset.listId;
        const index = Array.from(draggedItem.parentElement.children).indexOf(draggedItem);
        
        // Store necessary info for the drop
        event.dataTransfer.setData('text/plain', JSON.stringify({ sourceListId, index }));
        event.dataTransfer.effectAllowed = 'move';
        
        setTimeout(() => draggedItem.classList.add('dragging'), 0);
    }
    
    function handleDragOver(event) {
        event.preventDefault();
        const targetList = event.target.closest('ul');
        if (!targetList) return;
    
        const afterElement = getDragAfterElement(targetList, event.clientY);
        if (afterElement == null) {
            targetList.appendChild(draggedItem);
        } else {
            targetList.insertBefore(draggedItem, afterElement);
        }
    }
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function handleDrop(event) {
        event.preventDefault();
        if (!draggedItem) return;
        
        const targetListElement = event.target.closest('ul');
        if (!targetListElement) {
             // Dragged somewhere invalid, just re-render to reset
             loadData();
             return;
        }

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));
        const { sourceListId, index: originalIndex } = dropData;
        const targetListId = targetListElement.id.startsWith('today') ? 'today' : 'weekly';
        
        const newIndex = Array.from(targetListElement.children).indexOf(draggedItem);

        const sourceKey = `${sourceListId}Tasks`;
        const targetKey = `${targetListId}Tasks`;
        
        chrome.storage.sync.get([sourceKey, targetKey], (result) => {
            let sourceTasks = result[sourceKey] || [];
            let targetTasks = (sourceKey === targetKey) ? sourceTasks : (result[targetKey] || []);

            const [movedTask] = sourceTasks.splice(originalIndex, 1);
            if (movedTask) {
                targetTasks.splice(newIndex, 0, movedTask);
            }
            
            const dataToSave = { [sourceKey]: sourceTasks };
            if(sourceKey !== targetKey) {
                dataToSave[targetKey] = targetTasks;
            }

            chrome.storage.sync.set(dataToSave, () => {
                loadData(); // Full reload to ensure UI is perfectly in sync with storage
            });
        });
    }

    function handleDragEnd() {
        if(draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    }

    // --- Meditation Functions ---
    function startMeditationTimer() {
        if (meditationTimerInterval) {
            clearInterval(meditationTimerInterval);
        }
        meditationTimerInterval = setInterval(() => {
            timeRemaining = Math.max(0, timeRemaining - 1);
            updateMeditationTimerDisplay();
            if (timeRemaining <= 5 && !meditationAudio.muted) {
                meditationAudio.volume = currentVolume * (timeRemaining / 5);
            }
            if (timeRemaining <= 0) {
                endMeditation();
            }
        }, 1000);
    }
    function updateMeditationTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        meditationTimerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    function enterMeditationModeUI() {
        taskManagerView.style.opacity = 0;
        taskManagerView.style.pointerEvents = 'none';
        setTimeout(() => {
            meditationView.classList.add('active');
            startStopMeditationButton.textContent = 'Start';
            isMeditationActive = false;
            prepareMessageElement.style.opacity = 0;
            prepareMessageElement.classList.remove('fade-out');
            meditationTimerElement.style.display = 'block';
            meditationDurationInput.style.display = 'none';
            meditationDurationInputPlus.style.display = 'block';
            meditationDurationInputMinus.style.display = 'block';
            applyMeditationMode(currentMeditationMode);
            meditationAudio.load();
            updateVolumeScaleDisplay();
            timeRemaining = meditationDuration;
            updateMeditationTimerDisplay();
        }, 500);
    }
    function startMeditationSession() {
        if (isMeditationActive) return;
        isMeditationActive = true;
        startStopMeditationButton.textContent = 'Stop';
        timeRemaining = meditationDuration;
        updateMeditationTimerDisplay();
        meditationDurationInput.style.display = 'none';
        meditationDurationInputPlus.style.display = 'none';
        meditationDurationInputMinus.style.display = 'none';
        meditationTimerElement.style.display = 'block';
        prepareMessageElement.style.opacity = 1;
        prepareMessageElement.classList.add('fade-out');
        meditationSessionStart = null;
        meditationSessionElapsedSeconds = 0;

        if (meditationPreparationTimeout) {
            clearTimeout(meditationPreparationTimeout);
            meditationPreparationTimeout = null;
        }

        // Removed meditation start notification

        meditationPreparationTimeout = setTimeout(() => {
            prepareMessageElement.style.opacity = 0;
            prepareMessageElement.classList.remove('fade-out');
            breathingBubble.style.animationPlayState = 'running';
            meditationSessionStart = Date.now();
            meditationAudio.volume = currentVolume;
            if (!isMuted) {
                meditationAudio.play().catch(e => console.error("Error playing audio:", e));
            }
            startMeditationTimer();
            meditationPreparationTimeout = null;
        }, 5000);
    }
    function endMeditation() {
        if (meditationTimerInterval) {
            clearInterval(meditationTimerInterval);
            meditationTimerInterval = null;
        }
        if (meditationPreparationTimeout) {
            clearTimeout(meditationPreparationTimeout);
            meditationPreparationTimeout = null;
        }

        breathingBubble.style.animationPlayState = 'paused';
        isMeditationActive = false;

        meditationAudio.pause();
        meditationAudio.currentTime = 0;
        meditationAudio.volume = currentVolume;
        stopRainAnimation();

        timeRemaining = Math.max(0, timeRemaining);

        let elapsedSeconds = 0;
        if (meditationSessionStart) {
            elapsedSeconds = Math.max(0, Math.floor((Date.now() - meditationSessionStart) / 1000));
        } else {
            elapsedSeconds = Math.max(0, meditationDuration - timeRemaining);
        }
        meditationSessionStart = null;
        meditationSessionElapsedSeconds = elapsedSeconds;
        timeRemaining = meditationDuration;

        if (elapsedSeconds > 0) {
            recordMeditationSession(elapsedSeconds, currentMeditationMode.name);
        }

        // Removed meditation session complete notification

        meditationView.classList.remove('active');
        setTimeout(() => {
            taskManagerView.style.opacity = 1;
            taskManagerView.style.pointerEvents = 'all';
        }, 500);
    }
    function handleMeditationDurationChange() {
        const newMinutes = parseInt(meditationDurationInput.value, 10);
        if (!isNaN(newMinutes) && newMinutes >= 1) {
            meditationDuration = newMinutes * 60;
            if (!isMeditationActive) { timeRemaining = meditationDuration; }
            chrome.storage.sync.set({meditationDuration});
            updateMeditationTimerDisplay();
        } else {
            meditationDurationInput.value = Math.floor(meditationDuration / 60);
        }
        meditationDurationInput.style.display = 'none';
        meditationTimerElement.style.display = 'block';
        meditationDurationInputPlus.style.display = 'block';
        meditationDurationInputMinus.style.display = 'block';
    }
    function applyMeditationMode(mode) {
        meditationModes.forEach(m => meditationView.classList.remove(m.class));
        meditationView.classList.add(mode.class);
        currentMeditationMode = mode;
        meditationAudio.src = currentMeditationMode.sound;
        meditationAudio.loop = true;
        if (isMeditationActive && !isMuted) {
            meditationAudio.play().catch(e => console.error("Audio play failed:", e));
        } else if (!isMeditationActive) {
            meditationAudio.load();
        }
        document.querySelectorAll('.meditation-mode-button').forEach(button => {
            button.classList.toggle('active', button.dataset.mode === mode.name);
        });
        
        // Handle rain animation
        if (mode.name === 'Rain') {
            startRainAnimation();
        } else {
            stopRainAnimation();
        }
        
        chrome.storage.sync.set({currentMeditationModeName: currentMeditationMode.name});
    }
    function applyMuteState(muted) {
        isMuted = muted;
        meditationAudio.muted = muted;
        if (muteButton) {
            muteButton.classList.toggle('muted', isMuted);
            const icon = muteButton.querySelector('i');
            if (icon) { icon.className = `fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`; }
        }
        if (!isMuted && isMeditationActive && meditationAudio.paused) {
             meditationAudio.play().catch(e => console.error("Audio play on unmute failed:", e));
        }
        chrome.storage.sync.set({isMuted});
    }
    function updateVolumeScaleDisplay() {
        if (!volumeBars) volumeBars = document.querySelectorAll('.volume-bar');
        const activeBarsCount = Math.round(currentVolume * volumeBars.length);
        volumeBars.forEach((bar, index) => bar.classList.toggle('active', index < activeBarsCount));
    }
    function adjustVolume(direction) {
        let newVolume = currentVolume;
        if (direction === 'up') newVolume = Math.min(1.0, currentVolume + VOLUME_INCREMENT);
        else if (direction === 'down') newVolume = Math.max(0.0, currentVolume - VOLUME_INCREMENT);
        currentVolume = parseFloat(newVolume.toFixed(2));
        meditationAudio.volume = currentVolume;
        updateVolumeScaleDisplay();
        applyMuteState(currentVolume === 0);
        chrome.storage.sync.set({meditationVolume: currentVolume});
    }
    function renderMeditationModeSelectors() {
        meditationModeSelector.innerHTML = '';
        meditationModes.forEach(mode => {
            const button = document.createElement('button');
            button.className = 'meditation-mode-button';
            button.textContent = mode.name;
            button.dataset.mode = mode.name;
            meditationModeSelector.appendChild(button);
        });
        const muteBtnHtml = `<button id="meditation-mute-button" class="meditation-mute-button" title="Mute/Unmute"><i class="fas fa-volume-up"></i></button>`;
        const volumeControlsGroup = document.querySelector('.volume-controls-group');
        if (volumeControlsGroup && !document.getElementById('meditation-mute-button')) {
            volumeControlsGroup.insertAdjacentHTML('afterbegin', muteBtnHtml);
            muteButton = document.getElementById('meditation-mute-button');
            muteButton.addEventListener('click', () => applyMuteState(!isMuted));
            
            // Add volume control event listeners
            volumeControlsGroup.addEventListener('click', (event) => {
                const volumeBar = event.target.closest('.volume-bar');
                if (volumeBar) {
                    // Click on volume bar to set volume level
                    const barIndex = Array.from(volumeBar.parentElement.children).indexOf(volumeBar);
                    const newVolume = (barIndex + 1) / 5; // Convert to 0.2, 0.4, 0.6, 0.8, 1.0
                    currentVolume = newVolume;
                    meditationAudio.volume = currentVolume;
                    updateVolumeScaleDisplay();
                    applyMuteState(currentVolume === 0);
                    chrome.storage.sync.set({meditationVolume: currentVolume});
                }
            });
        }
        meditationModeSelector.addEventListener('click', (event) => {
            const button = event.target.closest('.meditation-mode-button');
            if (button) {
                const newMode = meditationModes.find(m => m.name === button.dataset.mode);
                if (newMode) applyMeditationMode(newMode);
            }
        });
    }

    // --- Rain Animation Functions ---
    let rainDrops = [];
    let rainAnimationId = null;
    const MAX_RAINDROPS = 200; // Substantially increased
    
    function createRaindrop() {
        return {
            x: Math.random() * window.innerWidth,
            y: -Math.random() * 100 - 50, // Start above viewport
            length: Math.random() * 15 + 8, // 8-23px length (much smaller)
            width: Math.random() * 0.5 + 0.5, // 0.5-1px width (much thinner)
            speed: Math.random() * 2 + 3, // 3-5px per frame
            opacity: Math.random() * 0.4 + 0.4, // 0.4-0.8 opacity
            angle: 0 // No angle - straight down
        };
    }
    
    function startRainAnimation() {
        if (rainAnimationId) return; // Already running
        
        // Initialize raindrops with staggered positions
        rainDrops = [];
        for (let i = 0; i < MAX_RAINDROPS; i++) {
            const drop = createRaindrop();
            // Stagger initial positions across the screen height
            drop.y = -Math.random() * window.innerHeight - 50;
            rainDrops.push(drop);
        }
        
        // Create rain container
        let rainContainer = document.getElementById('rain-container');
        if (!rainContainer) {
            rainContainer = document.createElement('div');
            rainContainer.id = 'rain-container';
            rainContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 2;
                overflow: hidden;
            `;
            meditationView.appendChild(rainContainer);
        }
        
        animateRain();
    }
    
    function animateRain() {
        const rainContainer = document.getElementById('rain-container');
        if (!rainContainer) return;
        
        // Clear previous frame
        rainContainer.innerHTML = '';
        
        // Update and render each raindrop
        rainDrops.forEach((drop, index) => {
            // Update position
            drop.y += drop.speed;
            drop.x += drop.angle * 0.5; // Slight horizontal drift
            
            // Reset raindrop if it's off screen
            if (drop.y > window.innerHeight + 50) {
                rainDrops[index] = createRaindrop();
                return;
            }
            
            // Create raindrop element
            const dropElement = document.createElement('div');
            dropElement.style.cssText = `
                position: absolute;
                left: ${drop.x}px;
                top: ${drop.y}px;
                width: ${drop.width}px;
                height: ${drop.length}px;
                background: linear-gradient(to bottom, 
                    rgba(173, 216, 230, ${drop.opacity}) 0%, 
                    rgba(173, 216, 230, ${drop.opacity * 0.7}) 50%, 
                    rgba(173, 216, 230, ${drop.opacity * 0.3}) 100%);
                border-radius: ${drop.width / 2}px;
                transform: rotate(${drop.angle}deg);
                will-change: transform;
            `;
            rainContainer.appendChild(dropElement);
        });
        
        // Continue animation
        rainAnimationId = requestAnimationFrame(animateRain);
    }
    
    function stopRainAnimation() {
        if (rainAnimationId) {
            cancelAnimationFrame(rainAnimationId);
            rainAnimationId = null;
        }
        
        const rainContainer = document.getElementById('rain-container');
        if (rainContainer) {
            rainContainer.remove();
        }
        
        rainDrops = [];
    }

    // --- Cursor Follower Functions ---
    function initializeCursorFollower() {
        if (!cursorDot || !cursorCircle) {
            cursorDot = document.querySelector('.cursor-dot');
            cursorCircle = document.querySelector('.cursor-circle');
        }

        if (!cursorDot || !cursorCircle) {
            return false;
        }

        dotX = dotY = circleX = circleY = window.innerWidth / 2;
        mouseX = dotX;
        mouseY = dotY;

        cursorDot.style.transform = `translate3d(${dotX - 1.5}px, ${dotY - 1.5}px, 0)`;
        cursorCircle.style.transform = `translate3d(${circleX - 12}px, ${circleY - 12}px, 0)`;

        return true;
    }

    function bindCursorEvents() {
        if (cursorEventsBound) {
            return;
        }
        document.addEventListener('mousemove', updateCursorPosition);
        document.addEventListener('mouseenter', showCursor);
        document.addEventListener('mouseleave', hideCursor);
        cursorEventsBound = true;
    }

    function unbindCursorEvents() {
        if (!cursorEventsBound) {
            return;
        }
        document.removeEventListener('mousemove', updateCursorPosition);
        document.removeEventListener('mouseenter', showCursor);
        document.removeEventListener('mouseleave', hideCursor);
        cursorEventsBound = false;
    }
    
    function updateCursorPosition(event) {
        if (!userSettings.zenCursor) {
            return;
        }

        mouseX = event.clientX;
        mouseY = event.clientY;

        if (!isMouseActive) {
            isMouseActive = true;
            bodyElement.classList.add('cursor-active');
        }
    }
    
    function startCursorAnimation() {
        if (isCursorAnimationActive) {
            return;
        }

        if (!cursorDot || !cursorCircle) {
            const initialized = initializeCursorFollower();
            if (!initialized) {
                return;
            }
        }

        isCursorAnimationActive = true;
        cursorAnimationId = requestAnimationFrame(animateCursor);
    }

    function stopCursorAnimation() {
        if (!isCursorAnimationActive) {
            return;
        }

        isCursorAnimationActive = false;

        if (cursorAnimationId !== null) {
            cancelAnimationFrame(cursorAnimationId);
            cursorAnimationId = null;
        }
    }

    function animateCursor() {
        // Smooth interpolation for dot with slight delay
        dotX += (mouseX - dotX) * DOT_LERP_FACTOR;
        dotY += (mouseY - dotY) * DOT_LERP_FACTOR;
        
        // Smooth interpolation for circle (lerp/easing effect)
        // Circle follows the dot and centers around it when at rest
        circleX += (dotX - circleX) * CURSOR_LERP_FACTOR;
        circleY += (dotY - circleY) * CURSOR_LERP_FACTOR;
        
        // Apply transforms using translate3d for GPU acceleration
        // Dot positioned at exact cursor location (with -1.5px offset for centering the 3px dot)
        if (cursorDot) {
            cursorDot.style.transform = `translate3d(${dotX - 1.5}px, ${dotY - 1.5}px, 0)`;
        }
        
        // Circle positioned to center around the dot (with -12px offset for centering the 24px circle)
        if (cursorCircle) {
            cursorCircle.style.transform = `translate3d(${circleX - 12}px, ${circleY - 12}px, 0)`;
        }
        
        if (isCursorAnimationActive) {
            cursorAnimationId = requestAnimationFrame(animateCursor);
        } else {
            cursorAnimationId = null;
        }
    }
    
    function hideCursor() {
        isMouseActive = false;
        bodyElement.classList.remove('cursor-active');
    }
    
    function showCursor() {
        if (!userSettings.zenCursor) return;

        if (!isMouseActive) {
            isMouseActive = true;
            bodyElement.classList.add('cursor-active');
        }
    }

    // --- AI Tools Panel Functions ---
    function toggleAIToolsPanel() {
        if (userSettings.keepQuickLinksVisible) {
            showToast('Quick Links are pinned in Settings.');
            return;
        }

        const isVisible = aiToolsPanel.classList.contains('visible');

        if (isVisible) {
            aiToolsPanel.classList.remove('visible');
            aiToolsToggle.classList.remove('active');
        } else {
            aiToolsPanel.classList.add('visible');
            aiToolsToggle.classList.add('active');
        }

        updateAiToolsToggleState();
    }

    // --- Other Utility Functions ---
    function updateDateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dayElement = document.querySelector('.day');
        const dateElement = document.querySelector('.date');
        if (dayElement) dayElement.textContent = now.toLocaleDateString([], { weekday: 'long' });
        if (dateElement) dateElement.textContent = now.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function toggleQuickNotes() {
        if (quickNotesPanel) {
            quickNotesPanel.classList.toggle('visible');
        }
    }

    function saveQuickNotes() {
        if (quickNotesTextarea) {
            chrome.storage.sync.set({ quickNotes: quickNotesTextarea.value });
        }
    }

    function adjustNotesFontSize(action) {
        if (!quickNotesTextarea) return;

        const currentSize = parseInt(window.getComputedStyle(quickNotesTextarea).fontSize, 10);
        let newSize = currentSize;

        if (action === 'increase') {
            newSize = Math.min(24, currentSize + 2);
        } else if (action === 'decrease') {
            newSize = Math.max(10, currentSize - 2);
        }

        if (newSize !== currentSize) {
            quickNotesTextarea.style.fontSize = `${newSize}px`;
            chrome.storage.sync.set({ notesFontSize: newSize });
        }
    }

    // Task Card Resize Functionality
    let isTaskCardResizing = false;
    let resizingTaskCard = null;
    const SNAP_HEIGHTS = [300, 350, 400, 450, 500, 550, 600, 650, 700]; // Predefined snap heights

    function initTaskCardResize() {
        document.querySelectorAll('.task-card-resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                isTaskCardResizing = true;
                resizingTaskCard = handle.closest('.task-card');
                const initialHeight = resizingTaskCard.offsetHeight;
                let startY = e.clientY;

                document.body.classList.add('resizing');
                e.preventDefault();

                const handleMouseMove = (e) => {
                    if (!isTaskCardResizing || !resizingTaskCard) return;

                    const deltaY = e.clientY - startY;
                    let newHeight = initialHeight + deltaY;

                    // Snap to nearest predefined height
                    const snappedHeight = SNAP_HEIGHTS.reduce((closest, height) => {
                        return Math.abs(height - newHeight) < Math.abs(closest - newHeight) ? height : closest;
                    });

                    if (Math.abs(snappedHeight - newHeight) <= 50) { // Within 50px snap range
                        newHeight = snappedHeight;
                    }

                    // Clamp height
                    newHeight = Math.max(250, Math.min(800, newHeight));

                    resizingTaskCard.style.height = newHeight + 'px';
                };

                const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    isTaskCardResizing = false;
                    resizingTaskCard = null;
                    document.body.classList.remove('resizing');
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        });
    }

    // Quick Notes Resize Functionality
    let isResizing = false;
    let initialWidth, initialHeight, initialMouseX, initialMouseY;

    function initQuickNotesResize() {
        if (!quickNotesPanel) return;
        const handle = quickNotesPanel.querySelector('.quick-notes-resize-handle');
        if (!handle) return;

        const panel = quickNotesPanel;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            initialWidth = panel.offsetWidth;
            initialHeight = panel.offsetHeight;
            document.body.style.cursor = 'nw-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - initialMouseX;
            const deltaY = e.clientY - initialMouseY;

            let newWidth = Math.max(250, Math.min(500, initialWidth + deltaX));
            let newHeight = Math.max(150, Math.min(400, initialHeight - deltaY));

            panel.style.width = newWidth + 'px';
            panel.style.height = newHeight + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
    function getDaysSinceCreation(createdAt) { if (!createdAt) return 0; return Math.floor((new Date() - new Date(createdAt)) / 86400000); }
    function getWeeksSinceCreation(createdAt) { return Math.floor(getDaysSinceCreation(createdAt) / 7); }
    
    function renderAITools(tools) {
        aiLinksContainer.querySelectorAll('.ai-button').forEach(b => b.remove());
        (tools || []).forEach((tool, index) => {
            const toolButton = document.createElement('a');
            toolButton.href = tool.url;
            toolButton.target = '_blank';
            toolButton.className = 'ai-button';
            toolButton.textContent = tool.label;
            toolButton.title = tool.url;
            toolButton.style.backgroundColor = tool.color || '#4f46e5';
            const editButton = document.createElement('span');
            editButton.className = 'edit-tool';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.dataset.index = index;
            const deleteButton = document.createElement('span');
            deleteButton.className = 'delete-tool';
            deleteButton.innerHTML = '&times;';
            deleteButton.dataset.index = index;
            toolButton.appendChild(editButton);
            toolButton.appendChild(deleteButton);
            aiLinksContainer.insertBefore(toolButton, addToolButton);
        });
        addToolButton.style.display = (tools || []).length >= MAX_AI_TOOLS ? 'none' : 'flex';
    }
    function addAITool() { const label = toolLabelInput.value.trim(); const url = toolUrlInput.value.trim(); if (!label || !url) return; chrome.storage.sync.get(['aiTools'], (r) => { let tools = r.aiTools || []; if (tools.length >= MAX_AI_TOOLS) return; tools.push({label, url, color: '#4f46e5'}); chrome.storage.sync.set({aiTools: tools}, () => { renderAITools(tools); customToolModal.style.display = 'none'; toolLabelInput.value = ''; toolUrlInput.value = ''; showToast('AI tool added!'); }); }); }
    function editAITool() { const label = editToolLabelInput.value.trim(); const url = editToolUrlInput.value.trim(); if (!label || !url || editingToolIndex < 0) return; chrome.storage.sync.get(['aiTools'], (r) => { let tools = r.aiTools || []; if (editingToolIndex >= tools.length) return; tools[editingToolIndex].label = label; tools[editingToolIndex].url = url; chrome.storage.sync.set({aiTools: tools}, () => { renderAITools(tools); editToolModal.style.display = 'none'; editingToolIndex = -1; showToast('AI tool updated!'); }); }); }
    
    // --- Event Listeners Setup ---
    addTodayTaskBtn.addEventListener('click', () => { addTask(newTodayTaskInput.value, 'today', todayTaskList); newTodayTaskInput.value = ''; });
    newTodayTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodayTaskBtn.click(); });
    addWeeklyTaskBtn.addEventListener('click', () => { addTask(newWeeklyTaskInput.value, 'weekly', weeklyTaskList); newWeeklyTaskInput.value = ''; });
    newWeeklyTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWeeklyTaskBtn.click(); });
    todayTaskList.addEventListener('click', (e) => handleTaskAction(e, 'today', todayTaskList));
    weeklyTaskList.addEventListener('click', (e) => handleTaskAction(e, 'weekly', weeklyTaskList));
    listTitles.forEach(title => title.addEventListener('dblclick', handleTitleEdit));
    document.querySelectorAll('.edit-list-btn').forEach(btn => btn.addEventListener('click', handleTitleEdit));
    darkModeCheckbox.addEventListener('change', () => {
        const isDarkMode = darkModeCheckbox.checked;
        chrome.storage.sync.set({ isDarkMode }, () => {
            applyTheme('theme-natural', isDarkMode);
        });
    });
    closeModalButtons.forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none'));
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; });

    if (settingsToggleButton) {
        settingsToggleButton.addEventListener('click', () => {
            openSettingsOverlay();
        });
    }

    if (settingsCloseButton) {
        settingsCloseButton.addEventListener('click', () => closeSettingsOverlay());
    }

    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', (event) => handleOverlayBackdropClick(event, settingsOverlay, () => closeSettingsOverlay()));
    }

    if (viewStatsButton) {
        viewStatsButton.addEventListener('click', () => openStatsOverlay());
    }

    if (resetStatsButton) {
        resetStatsButton.addEventListener('click', () => {
            productivityStats = createDefaultStats();
            persistStats();
            renderStatsSummary();
            if (statsOverlay && statsOverlay.classList.contains('active')) {
                renderStatsOverlay(true);
            }
            showToast('All statistics have been reset.');
        });
    }

    if (statsCloseButton) {
        statsCloseButton.addEventListener('click', () => {
            closeStatsOverlay(false);
            openSettingsOverlay();
        });
    }

    if (statsOverlay) {
        statsOverlay.addEventListener('click', (event) => handleOverlayBackdropClick(event, statsOverlay, () => closeStatsOverlay()));
    }

    if (statsPeriodButtons && statsPeriodButtons.length) {
        statsPeriodButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const nextPeriod = button.dataset.period || 'all';
                setStatsPeriod(nextPeriod);
            });
        });
    }

    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (event) => applyFontSizePreference(event.target.value, true));
    }

    if (zenCursorToggle) {
        zenCursorToggle.addEventListener('change', (event) => applyZenCursor(event.target.checked, true));
    }

    if (quickLinksToggle) {
        quickLinksToggle.addEventListener('change', (event) => applyQuickLinksPinned(event.target.checked, true));
    }

    meditationTriggerButton.addEventListener('click', enterMeditationModeUI);
    startStopMeditationButton.addEventListener('click', () => { if (isMeditationActive) endMeditation(); else startMeditationSession(); });
    meditationTimerElement.addEventListener('click', () => { if (!isMeditationActive) { meditationTimerElement.style.display = 'none'; meditationDurationInput.style.display = 'block'; meditationDurationInputPlus.style.display = 'none'; meditationDurationInputMinus.style.display = 'none'; meditationDurationInput.focus(); meditationDurationInput.select(); } });
    meditationDurationInputPlus.addEventListener('click', () => { let val = parseInt(meditationDurationInput.value); meditationDurationInput.value = val + 1; handleMeditationDurationChange(); });
    meditationDurationInputMinus.addEventListener('click', () => { let val = parseInt(meditationDurationInput.value); if (val > 1) { meditationDurationInput.value = val - 1; handleMeditationDurationChange(); } });
    meditationDurationInput.addEventListener('blur', handleMeditationDurationChange);
    meditationDurationInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { handleMeditationDurationChange(); e.target.blur(); } });
    addToolButton.addEventListener('click', () => customToolModal.style.display = 'flex');
    addCustomToolButton.addEventListener('click', addAITool);
    [toolLabelInput, toolUrlInput].forEach((input) => {
        if (input) {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    addAITool();
                }
            });
        }
    });
    saveEditToolButton.addEventListener('click', editAITool);
    aiLinksContainer.addEventListener('click', (e) => {
        if(e.target.closest('.edit-tool')) {
            e.preventDefault();
            const index = parseInt(e.target.closest('.edit-tool').dataset.index);
            chrome.storage.sync.get(['aiTools'], (r) => {
                const tools = r.aiTools || [];
                if (index >= 0 && index < tools.length) {
                    editingToolIndex = index;
                    editToolLabelInput.value = tools[index].label;
                    editToolUrlInput.value = tools[index].url;
                    editToolModal.style.display = 'flex';
                }
            });
        } else if(e.target.closest('.delete-tool')) {
            e.preventDefault();
            if(confirm('Delete this tool?')) {
                const index = parseInt(e.target.closest('.delete-tool').dataset.index);
                chrome.storage.sync.get(['aiTools'], r => {
                    let tools = r.aiTools || [];
                    tools.splice(index, 1);
                    chrome.storage.sync.set({aiTools: tools}, () => renderAITools(tools));
                });
            }
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (statsOverlay && statsOverlay.classList.contains('active')) {
                event.preventDefault();
                closeStatsOverlay(false);
                if (settingsOverlay) {
                    openSettingsOverlay();
                }
                return;
            }

            if (settingsOverlay && settingsOverlay.classList.contains('active')) {
                event.preventDefault();
                closeSettingsOverlay();
                return;
            }

            if (meditationView.classList.contains('active')) {
                event.preventDefault();
                endMeditation();
                return;
            }

            if (customToolModal.style.display === 'flex') {
                event.preventDefault();
                customToolModal.style.display = 'none';
                return;
            }

            if (editToolModal.style.display === 'flex') {
                event.preventDefault();
                editToolModal.style.display = 'none';
                return;
            }

            if (quickNotesPanel && quickNotesPanel.classList.contains('visible')) {
                event.preventDefault();
                toggleQuickNotes();
                return;
            }
        }

        // Ctrl/Cmd + N: Focus on new daily task input
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            newTodayTaskInput.focus();
        }

        // Ctrl/Cmd + M: Toggle meditation
        if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
            event.preventDefault();
            if (meditationView.classList.contains('active')) {
                endMeditation();
            } else {
                enterMeditationModeUI();
            }
        }

        // Ctrl/Cmd + S: Toggle quick notes
        if ((event.ctrlKey || event.metaKey) && event.key === 's' && ENABLE_NEW_FEATURES) {
            event.preventDefault();
            toggleQuickNotes();
        }

        // Ctrl/Cmd + W: Toggle weekly task input
        if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
            event.preventDefault();
            newWeeklyTaskInput.focus();
        }
    });

    // Drag and Drop Listeners
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragend', handleDragEnd);

    // Cursor Follower Listeners are bound dynamically when Zen Cursor mode is enabled
    
    // AI Tools Panel Toggle Listener
    aiToolsToggle.addEventListener('click', toggleAIToolsPanel);
    
    // Initialize cursor follower after DOM is ready
    setTimeout(initializeCursorFollower, 100);

    initializeApp();

    // Initialize task card resizing
    initTaskCardResize();

    // NEW: Enhanced notes setup in init for better timing
    if (ENABLE_NEW_FEATURES) {
        setTimeout(() => {
            const quickNotesIcon = document.querySelector('.quick-notes-icon');
            const quickNotesPanel = document.querySelector('.quick-notes-panel');
            const quickNotesTextarea = quickNotesPanel ? quickNotesPanel.querySelector('textarea') : null;

            console.log('Setting up notes listeners:', { icon: !!quickNotesIcon, panel: !!quickNotesPanel, textarea: !!quickNotesTextarea });

            if (quickNotesIcon) {
                quickNotesIcon.addEventListener('click', () => {
                    console.log('Notes icon clicked');
                    toggleQuickNotes();
                });
            }
            if (quickNotesTextarea) {
                quickNotesTextarea.addEventListener('input', saveQuickNotes);
                quickNotesTextarea.addEventListener('blur', saveQuickNotes);
            }

            // Initialize resize functionality
            initQuickNotesResize();

            // Font size controls
            const fontSizeBtns = document.querySelectorAll('.font-size-btn');
            fontSizeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    adjustNotesFontSize(action);
                });
            });
        }, 500);
    }
});
