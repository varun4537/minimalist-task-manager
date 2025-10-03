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
    const CURSOR_LERP_FACTOR = 0.15; // Smooth easing factor for circle
    const DOT_LERP_FACTOR = 0.8; // Slight delay for dot (higher = faster)

    // --- Initialization ---
    function initializeApp() {
        updateDateTime();
        setInterval(updateDateTime, 30000); // Update time periodically
        loadData();
    }

    // --- Data Management & Core UI ---
    function loadData() {
        // Fallback for when running outside Chrome extension context
        const storageAPI = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage.sync : {
            get: (keys, callback) => callback({}),
            set: (data, callback) => callback && callback()
        };
        
        storageAPI.get([
            'todayTasks', 'weeklyTasks', 'aiTools', 'isDarkMode', 'listData',
            'meditationDuration', 'currentMeditationModeName', 'isMuted', 'meditationVolume', 'quickNotes', 'notesFontSize'
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
                aiTools = [
                    { label: 'ChatGPT', url: 'https://chat.openai.com/', color: '#094637' },
                    { label: 'Claude', url: 'https://claude.ai/', color: '#945104' },
                    { label: 'Gemini', url: 'https://gemini.google.com/', color: '#4f46e5' }
                ];
                storageAPI.set({ aiTools }, () => {});
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
        });
    }

    function applyTheme(theme, isDarkMode) {
        bodyElement.className = ''; // Clear all classes
        if (isDarkMode) {
            bodyElement.classList.add('dark-mode');
        }
        // This logic ensures the correct combined class is applied e.g., "dark-mode theme-serene-dark"
        bodyElement.classList.add(`${theme}-${isDarkMode ? 'dark' : 'light'}`);
    }

    function updateBadgeText(todayTasks) {
        if (chrome.action && chrome.action.setBadgeText) {
            const incompleteCount = (todayTasks || []).filter(task => !task.completed).length;
            chrome.action.setBadgeText({ text: incompleteCount > 0 ? String(incompleteCount) : '' });
            chrome.action.setBadgeBackgroundColor({ color: '#E53E3E' });
        }
    }

    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
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
        
        // Use the stored data-index for accuracy, not DOM position
        const index = parseInt(listItem.dataset.index);
        const storageKey = `${taskType}Tasks`;

        chrome.storage.sync.get(storageKey, (result) => {
            let tasks = result[storageKey] || [];
            if (index < 0 || index >= tasks.length) return;

            let actionTaken = false;
            if (target.type === 'checkbox') {
                tasks[index].completed = target.checked;
                if (tasks[index].completed) tasks[index].starred = false;
                actionTaken = true;
            } else if (target.classList.contains('fa-star')) {
                if (!tasks[index].completed) {
                    tasks[index].starred = !tasks[index].starred;
                    actionTaken = true;
                }
            } else if (target.classList.contains('remove-task')) {
                tasks.splice(index, 1);
                showToast("Task removed.");
                actionTaken = true;
            }

            if (actionTaken) {
                chrome.storage.sync.set({ [storageKey]: tasks }, () => {
                    renderTasks(tasks, taskListElement, taskType);
                    if (taskType === 'today') updateBadgeText(tasks);
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
        clearInterval(meditationTimerInterval);
        meditationTimerInterval = setInterval(() => {
            timeRemaining--;
            updateMeditationTimerDisplay();
            if (timeRemaining <= 5 && !meditationAudio.muted) {
                meditationAudio.volume = currentVolume * (Math.max(0, timeRemaining) / 5);
            }
            if (timeRemaining <= 0) { endMeditation(); }
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

        // Show start notification
        showMeditationNotification('Meditation Session Started', `Beginning ${Math.floor(meditationDuration / 60)}-minute ${currentMeditationMode.name} meditation. Find your center.`);

        setTimeout(() => {
            prepareMessageElement.style.opacity = 0;
            prepareMessageElement.classList.remove('fade-out');
            startMeditationTimer();
            breathingBubble.style.animationPlayState = 'running';
            meditationAudio.volume = currentVolume;
            if (!isMuted) {
                meditationAudio.play().catch(e => console.error("Error playing audio:", e));
            }
        }, 5000);
    }
    function endMeditation() {
        clearInterval(meditationTimerInterval);
        breathingBubble.style.animationPlayState = 'paused';
        isMeditationActive = false;
        meditationAudio.pause();
        meditationAudio.currentTime = 0;
        meditationAudio.volume = currentVolume;

        // Show end notification
        const sessionDuration = Math.floor((meditationDuration - timeRemaining) / 60);
        showMeditationNotification('Meditation Session Complete', `Well done! You completed a ${sessionDuration}-minute ${currentMeditationMode.name} session. Take a moment to breathe.`);

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
        cursorDot = document.querySelector('.cursor-dot');
        cursorCircle = document.querySelector('.cursor-circle');
        
        if (!cursorDot || !cursorCircle) return;
        
        // Initialize positions
        dotX = dotY = circleX = circleY = window.innerWidth / 2;
        
        // Start animation loop
        animateCursor();
    }
    
    function updateCursorPosition(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
        
        // Show cursor elements
        if (!isMouseActive) {
            isMouseActive = true;
            bodyElement.classList.add('cursor-active');
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
        
        // Continue animation loop
        cursorAnimationId = requestAnimationFrame(animateCursor);
    }
    
    function hideCursor() {
        isMouseActive = false;
        bodyElement.classList.remove('cursor-active');
    }
    
    function showCursor() {
        if (!isMouseActive) {
            isMouseActive = true;
            bodyElement.classList.add('cursor-active');
        }
    }

    // --- AI Tools Panel Functions ---
    function toggleAIToolsPanel() {
        const isVisible = aiToolsPanel.classList.contains('visible');
        
        if (isVisible) {
            // Hide panel
            aiToolsPanel.classList.remove('visible');
            aiToolsToggle.classList.remove('active');
        } else {
            // Show panel
            aiToolsPanel.classList.add('visible');
            aiToolsToggle.classList.add('active');
        }
    }

    // --- Other Utility Functions ---
    function updateDateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        dateElement.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
    }

    function toggleQuickNotes() {
        const quickNotesPanel = document.querySelector('.quick-notes-panel');
        if (quickNotesPanel) {
            quickNotesPanel.classList.toggle('visible');
        }
    }

    function saveQuickNotes() {
        const quickNotesTextarea = document.querySelector('.quick-notes-panel textarea');
        if (quickNotesTextarea) {
            const notes = quickNotesTextarea.value;
            chrome.storage.sync.set({ quickNotes: notes });
        }
    }

    function adjustNotesFontSize(action) {
        const textarea = document.querySelector('.quick-notes-panel textarea');
        if (!textarea) return;

        let currentSize = parseInt(window.getComputedStyle(textarea).fontSize);
        let newSize;

        if (action === 'increase') {
            newSize = Math.min(24, currentSize + 2);
        } else if (action === 'decrease') {
            newSize = Math.max(10, currentSize - 2);
        }

        if (newSize !== currentSize) {
            textarea.style.fontSize = newSize + 'px';
            chrome.storage.sync.set({ notesFontSize: newSize });
        }
    }

    // Quick Notes Resize Functionality
    let isResizing = false;
    let initialWidth, initialHeight, initialMouseX, initialMouseY;

    function initQuickNotesResize() {
        const handle = document.querySelector('.quick-notes-resize-handle');
        const panel = document.querySelector('.quick-notes-panel');

        if (!handle || !panel) return;

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
    meditationTriggerButton.addEventListener('click', enterMeditationModeUI);
    startStopMeditationButton.addEventListener('click', () => { if (isMeditationActive) endMeditation(); else startMeditationSession(); });
    meditationTimerElement.addEventListener('click', () => { if (!isMeditationActive) { meditationTimerElement.style.display = 'none'; meditationDurationInput.style.display = 'block'; meditationDurationInputPlus.style.display = 'none'; meditationDurationInputMinus.style.display = 'none'; meditationDurationInput.focus(); meditationDurationInput.select(); } });
    meditationDurationInputPlus.addEventListener('click', () => { let val = parseInt(meditationDurationInput.value); meditationDurationInput.value = val + 1; handleMeditationDurationChange(); });
    meditationDurationInputMinus.addEventListener('click', () => { let val = parseInt(meditationDurationInput.value); if (val > 1) { meditationDurationInput.value = val - 1; handleMeditationDurationChange(); } });
    meditationDurationInput.addEventListener('blur', handleMeditationDurationChange);
    meditationDurationInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { handleMeditationDurationChange(); e.target.blur(); } });
    addToolButton.addEventListener('click', () => customToolModal.style.display = 'flex');
    addCustomToolButton.addEventListener('click', addAITool);
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
        // Escape key handling
        if (event.key === 'Escape') {
            if (meditationView.classList.contains('active')) endMeditation();
            if (customToolModal.style.display === 'flex') customToolModal.style.display = 'none';
            if (editToolModal.style.display === 'flex') editToolModal.style.display = 'none';
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

    // Cursor Follower Listeners
    document.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mouseenter', showCursor);
    document.addEventListener('mouseleave', hideCursor);
    
    // AI Tools Panel Toggle Listener
    aiToolsToggle.addEventListener('click', toggleAIToolsPanel);
    
    // Initialize cursor follower after DOM is ready
    setTimeout(initializeCursorFollower, 100);

    initializeApp();

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
