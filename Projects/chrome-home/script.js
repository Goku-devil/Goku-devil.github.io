const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchSuggestions = document.getElementById("search-suggestions");
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const shortcutsGrid = document.getElementById("shortcuts-grid");
const tasksSection = document.getElementById("tasks-section");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const taskClearAll = document.getElementById("task-clear-all");
const taskClearCompleted = document.getElementById("task-clear-completed");
const quickAddTaskBtn = document.getElementById("quick-add-task-btn");
const quotesList = document.getElementById("quotes-list");
const shortcutModal = document.getElementById("shortcut-modal");
const taskWarningModal = document.getElementById("task-warning-modal");
const taskWarningMessage = document.getElementById("task-warning-message");
const taskWarningDismiss = document.getElementById("task-warning-dismiss");
const quickTaskModal = document.getElementById("quick-task-modal");
const quickTaskForm = document.getElementById("quick-task-form");
const quickTaskInput = document.getElementById("quick-task-input");
const quickTaskCancel = document.getElementById("quick-task-cancel");
const shortcutForm = document.getElementById("shortcut-form");
const shortcutName = document.getElementById("shortcut-name");
const shortcutUrl = document.getElementById("shortcut-url");
const shortcutCancel = document.getElementById("shortcut-cancel");
const shortcutModalTitle = document.getElementById("shortcut-modal-title");
const shortcutSubmit = document.getElementById("shortcut-submit");
const customizeBtn = document.getElementById("customize-btn");
const customizeModal = document.getElementById("customize-modal");
const customizeClose = document.getElementById("customize-close");
const customizeReset = document.getElementById("customize-reset");
const themeSelect = document.getElementById("theme-select");
const terminalModeToggle = document.getElementById("terminal-mode-toggle");
const layoutGrid = document.getElementById("layout-grid");
const bgUpload = document.getElementById("bg-upload");
const templateGrid = document.getElementById("template-grid");
const customTemplateControls = document.getElementById("custom-template-controls");
const customPrimary = document.getElementById("custom-primary");
const customSecondary = document.getElementById("custom-secondary");
const customGlow = document.getElementById("custom-glow");
const customSpeed = document.getElementById("custom-speed");
const root = document.documentElement;

const SHORTCUTS_KEY = "customHomeShortcuts";
const TASKS_KEY = "customHomeTasks";
const SETTINGS_KEY = "customHomeSettings";
const DEFAULT_BACKGROUND = "asserts/image.png";
const themeTokens = {
	ocean: {
		accent: "#4cc9f0",
		accent2: "#3a86ff",
		panel: "rgba(8, 14, 24, 0.58)",
		panelBorder: "rgba(255, 255, 255, 0.18)"
	},
	emerald: {
		accent: "#58d68d",
		accent2: "#16a085",
		panel: "rgba(6, 19, 15, 0.58)",
		panelBorder: "rgba(172, 255, 214, 0.24)"
	},
	sunset: {
		accent: "#ff9966",
		accent2: "#ff5e62",
		panel: "rgba(24, 10, 11, 0.58)",
		panelBorder: "rgba(255, 200, 184, 0.25)"
	},
	mono: {
		accent: "#b0bec5",
		accent2: "#78909c",
		panel: "rgba(10, 13, 17, 0.62)",
		panelBorder: "rgba(224, 231, 236, 0.22)"
	}
};

const defaultSettings = {
	theme: "ocean",
	terminalMode: false,
	layout: "centered",
	background: DEFAULT_BACKGROUND,
	template: "aurora",
	custom: {
		primary: "#4cc9f0",
		secondary: "#3a86ff",
		glow: "#ffffff",
		speed: 8
	}
};

const layoutAliases = {
	focus: "centered",
	split: "wide",
	compact: "minimal"
};

const validLayouts = new Set(["centered", "wide", "minimal"]);

const defaultShortcuts = [
	{ name: "Google", url: "https://www.google.com" },
	{ name: "YouTube", url: "https://youtube.com" },
	{ name: "Gmail", url: "https://mail.google.com" },
	{ name: "GitHub", url: "https://github.com" },
	{ name: "Drive", url: "https://drive.google.com" }
];

const techQuotes = [
	{ text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
	{ text: "The science of today is the technology of tomorrow.", author: "Edward Teller" },
	{ text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
	{ text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
	{ text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
	{ text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
	{ text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
	{ text: "It has become appallingly obvious that our technology has exceeded our humanity.", author: "Albert Einstein" },
	{ text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
	{ text: "Code is like humor. When you have to explain it, it is bad.", author: "Cory House" },
	{ text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
	{ text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" }
];
let shortcuts = [];
let tasks = [];
let editingIndex = -1;
let settings = { ...defaultSettings };
let suggestionItems = [];
let highlightedSuggestionIndex = -1;
let suggestionAbortController = null;
let suggestionDebounceTimer = null;

function updateDateTime() {
	const now = new Date();
	clockEl.textContent = now.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});

	dateEl.textContent = now.toLocaleDateString([], {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric"
	});
}

function normalizeUrl(value) {
	if (/^https?:\/\//i.test(value)) {
		return value;
	}
	return `https://${value}`;
}

function clearSuggestions() {
	suggestionItems = [];
	highlightedSuggestionIndex = -1;
	searchSuggestions.hidden = true;
	searchSuggestions.innerHTML = "";
	searchInput.setAttribute("aria-expanded", "false");
}

function renderSuggestions(items) {
	suggestionItems = items;
	highlightedSuggestionIndex = -1;
	searchSuggestions.innerHTML = "";

	if (!items.length) {
		const empty = document.createElement("div");
		empty.className = "suggestion-empty";
		empty.textContent = "No suggestions";
		searchSuggestions.append(empty);
		searchSuggestions.hidden = false;
		searchInput.setAttribute("aria-expanded", "true");
		return;
	}

	items.forEach((item, index) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "suggestion-item";
		button.setAttribute("role", "option");
		button.textContent = item;
		button.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			searchInput.value = item;
			clearSuggestions();
			searchForm.requestSubmit();
		});
		button.addEventListener("mouseenter", () => {
			highlightSuggestion(index);
		});
		searchSuggestions.append(button);
	});

	searchSuggestions.hidden = false;
	searchInput.setAttribute("aria-expanded", "true");
}

function highlightSuggestion(index) {
	const buttons = Array.from(searchSuggestions.querySelectorAll(".suggestion-item"));
	buttons.forEach((button, buttonIndex) => {
		button.classList.toggle("active", buttonIndex === index);
	});
	highlightedSuggestionIndex = index;
	if (index >= 0 && suggestionItems[index]) {
		searchInput.value = suggestionItems[index];
	}
}

function chooseSuggestion(index) {
	const choice = suggestionItems[index];
	if (!choice) {
		return;
	}
	searchInput.value = choice;
	clearSuggestions();
	searchForm.requestSubmit();
}

async function fetchGoogleSuggestions(query) {
	if (suggestionAbortController) {
		suggestionAbortController.abort();
	}
	const controller = new AbortController();
	suggestionAbortController = controller;

	const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(query)}`;
	const response = await fetch(url, { signal: controller.signal });
	if (!response.ok) {
		throw new Error("Failed to fetch suggestions");
	}
	const data = await response.json();
	return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
}

function queueSuggestions() {
	const query = searchInput.value.trim();
	if (query.length < 2) {
		clearSuggestions();
		return;
	}

	clearTimeout(suggestionDebounceTimer);
	suggestionDebounceTimer = setTimeout(async () => {
		try {
			const items = await fetchGoogleSuggestions(query);
			if (searchInput.value.trim() === query) {
				renderSuggestions(items.slice(0, 8));
			}
		} catch {
			if (searchInput.value.trim() === query) {
				clearSuggestions();
			}
		}
	}, 150);
}

function loadShortcuts() {
	const raw = localStorage.getItem(SHORTCUTS_KEY);
	if (!raw) {
		return [...defaultShortcuts];
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return [...defaultShortcuts];
		}
		return parsed.filter((item) => item && item.name && item.url);
	} catch {
		return [...defaultShortcuts];
	}
}

function saveShortcuts() {
	localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
}

function createTaskId() {
	if (window.crypto && typeof window.crypto.randomUUID === "function") {
		return window.crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
	const raw = localStorage.getItem(TASKS_KEY);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return [];
		}
		return parsed
			.map((item) => {
				if (typeof item === "string") {
					return {
						id: createTaskId(),
						text: item,
						done: false,
						createdAt: Date.now()
					};
				}
				if (!item || typeof item.text !== "string") {
					return null;
				}
				return {
					id: typeof item.id === "string" && item.id ? item.id : createTaskId(),
					text: item.text,
					done: Boolean(item.done),
					createdAt: Number(item.createdAt) || Date.now()
				};
			})
			.filter(Boolean)
			.slice(0, 100);
	} catch {
		return [];
	}
}

function saveTasks() {
	localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function renderTasks() {
	if (!taskList || !taskCount) {
		return;
	}

	taskList.innerHTML = "";

	if (!tasks.length) {
		if (tasksSection) {
			tasksSection.hidden = true;
		}
		if (quickAddTaskBtn) {
			quickAddTaskBtn.hidden = false;
		}
		taskCount.textContent = "0 open";
		if (taskClearAll) {
			taskClearAll.disabled = true;
		}
		if (taskClearCompleted) {
			taskClearCompleted.disabled = true;
		}
		return;
	}

	if (tasksSection) {
		tasksSection.hidden = false;
	}
	if (quickAddTaskBtn) {
		quickAddTaskBtn.hidden = true;
	}

	let openCount = 0;
	let completedCount = 0;

	tasks.forEach((task) => {
		if (task.done) {
			completedCount += 1;
		} else {
			openCount += 1;
		}

		const item = document.createElement("li");
		item.className = `task-item${task.done ? " done" : ""}`;
		item.dataset.taskId = task.id;

		const label = document.createElement("label");
		label.className = "task-check";

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = task.done;

		const mark = document.createElement("span");
		mark.className = "task-mark";
		mark.setAttribute("aria-hidden", "true");

		const text = document.createElement("span");
		text.className = "task-text";
		text.textContent = task.text;

		const removeButton = document.createElement("button");
		removeButton.type = "button";
		removeButton.className = "task-remove";
		removeButton.setAttribute("aria-label", `Delete task: ${task.text}`);
		removeButton.textContent = "×";

		label.append(checkbox, mark, text);
		item.append(label, removeButton);
		taskList.append(item);
	});

	taskCount.textContent = `${openCount} open${completedCount ? ` · ${completedCount} done` : ""}`;
	if (taskClearAll) {
		taskClearAll.disabled = false;
	}
	if (taskClearCompleted) {
		taskClearCompleted.disabled = completedCount === 0;
	}
}

function addTask(text) {
	const trimmed = text.trim();
	if (!trimmed) {
		return;
	}

	tasks.unshift({
		id: createTaskId(),
		text: trimmed,
		done: false,
		createdAt: Date.now()
	});
	saveTasks();
	renderTasks();
}

function updateTask(taskId, updates) {
	tasks = tasks.map((task) => {
		if (task.id !== taskId) {
			return task;
		}
		return { ...task, ...updates };
	});
	saveTasks();
	renderTasks();
}

function removeTask(taskId) {
	tasks = tasks.filter((task) => task.id !== taskId);
	saveTasks();
	renderTasks();
}

function clearCompletedTasks() {
	tasks = tasks.filter((task) => !task.done);
	saveTasks();
	renderTasks();
}

function clearAllTasks() {
	if (!tasks.length) {
		return;
	}
	tasks = [];
	saveTasks();
	renderTasks();
	closeTaskWarningPopup();
}

function closeQuickTaskModal() {
	if (!quickTaskModal) {
		return;
	}
	quickTaskModal.hidden = true;
	if (quickTaskForm) {
		quickTaskForm.reset();
	}
}

function openQuickTaskModal() {
	if (!quickTaskModal) {
		if (tasksSection) {
			tasksSection.hidden = false;
		}
		if (quickAddTaskBtn) {
			quickAddTaskBtn.hidden = true;
		}
		if (taskInput) {
			taskInput.focus();
		}
		return;
	}
	quickTaskModal.hidden = false;
	if (quickTaskInput) {
		quickTaskInput.focus();
	}
}

function closeTaskWarningPopup() {
	if (!taskWarningModal) {
		return;
	}
	taskWarningModal.hidden = true;
}

function openTaskWarningPopup(pendingCount) {
	if (!taskWarningModal || !taskWarningMessage) {
		const label = pendingCount === 1 ? "task" : "tasks";
		window.alert(`Warning: You still have ${pendingCount} incomplete ${label}.`);
		return;
	}

	const label = pendingCount === 1 ? "task" : "tasks";
	taskWarningMessage.textContent = `You still have ${pendingCount} incomplete ${label}. Finish them to keep your streak clean.`;
	taskWarningModal.hidden = false;
	if (taskWarningDismiss) {
		taskWarningDismiss.focus();
	}
}

function warnPendingTasksOnOpen() {
	const pendingCount = tasks.filter((task) => !task.done).length;
	if (pendingCount === 0) {
		return;
	}
	openTaskWarningPopup(pendingCount);
}

function setTheme(themeName) {
	const theme = themeTokens[themeName] || themeTokens.ocean;
	root.style.setProperty("--accent", theme.accent);
	root.style.setProperty("--accent-2", theme.accent2);
	root.style.setProperty("--panel", theme.panel);
	root.style.setProperty("--panel-border", theme.panelBorder);
}

function setBackground(value) {
	const source = value || DEFAULT_BACKGROUND;
	root.style.setProperty("--bg-image", `url("${source}")`);
}

function setTemplate(templateName) {
	document.body.classList.remove("template-aurora", "template-prism", "template-dark-wave");
	document.body.classList.remove("template-neon-grid", "template-sunrise", "template-midnight", "template-custom");
	document.body.classList.remove("template-fluid-flow", "template-pulse-ring", "template-spiral-orbit", "template-bouncing-bg");
	const safeTemplate = templateName || defaultSettings.template;
	document.body.classList.add(`template-${safeTemplate}`);
	templateGrid.querySelectorAll(".template-chip").forEach((chip) => {
		chip.classList.toggle("active", chip.dataset.template === safeTemplate);
	});
	if (customTemplateControls) {
		customTemplateControls.hidden = safeTemplate !== "custom";
	}
	if (safeTemplate === "custom") {
		applyCustomTemplate();
	}
}

function setLayout(layoutName) {
	document.body.classList.remove(
		"layout-focus",
		"layout-split",
		"layout-compact",
		"layout-centered",
		"layout-wide",
		"layout-minimal"
	);
	const candidate = layoutAliases[layoutName] || layoutName;
	const safeLayout = validLayouts.has(candidate) ? candidate : defaultSettings.layout;
	document.body.classList.add(`layout-${safeLayout}`);
	if (layoutGrid) {
		layoutGrid.querySelectorAll(".layout-chip").forEach((chip) => {
			chip.classList.toggle("active", chip.dataset.layout === safeLayout);
		});
	}
}

function applyCustomTemplate() {
	const custom = settings.custom || defaultSettings.custom;
	root.style.setProperty("--custom-primary", custom.primary);
	root.style.setProperty("--custom-secondary", custom.secondary);
	root.style.setProperty("--custom-glow", custom.glow);
	root.style.setProperty("--custom-speed", `${custom.speed}s`);
	if (customPrimary) customPrimary.value = custom.primary;
	if (customSecondary) customSecondary.value = custom.secondary;
	if (customGlow) customGlow.value = custom.glow;
	if (customSpeed) customSpeed.value = String(custom.speed);
}

function saveSettings() {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
	const raw = localStorage.getItem(SETTINGS_KEY);
	if (!raw) {
		return { ...defaultSettings };
	}

	try {
		const parsed = JSON.parse(raw);
		const parsedLayout = layoutAliases[parsed.layout] || parsed.layout;
		return {
			theme: parsed.theme in themeTokens ? parsed.theme : defaultSettings.theme,
			terminalMode: Boolean(parsed.terminalMode),
			layout: validLayouts.has(parsedLayout) ? parsedLayout : defaultSettings.layout,
			background: parsed.background || defaultSettings.background,
			template: parsed.template || defaultSettings.template,
			custom: {
				primary: parsed.custom?.primary || defaultSettings.custom.primary,
				secondary: parsed.custom?.secondary || defaultSettings.custom.secondary,
				glow: parsed.custom?.glow || defaultSettings.custom.glow,
				speed: Number(parsed.custom?.speed) || defaultSettings.custom.speed
			}
		};
	} catch {
		return { ...defaultSettings };
	}
}

function applySettings() {
	setTheme(settings.theme);
	document.body.classList.toggle("terminal-mode", Boolean(settings.terminalMode));
	setLayout(settings.layout);
	setBackground(settings.background);
	setTemplate(settings.template);
	applyCustomTemplate();

	themeSelect.value = settings.theme;
	if (terminalModeToggle) {
		terminalModeToggle.checked = Boolean(settings.terminalMode);
	}
}

function openCustomizeModal() {
	applySettings();
	customizeModal.hidden = false;
}

function closeCustomizeModal() {
	customizeModal.hidden = true;
}

function getHost(url) {
	try {
		return new URL(normalizeUrl(url)).hostname;
	} catch {
		return "";
	}
}

function faviconFor(url) {
	const host = getHost(url);
	return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
}

function openShortcutModal() {
	editingIndex = -1;
	shortcutModalTitle.textContent = "Add Shortcut";
	shortcutSubmit.textContent = "Add";
	shortcutName.value = "";
	shortcutUrl.value = "";
	shortcutModal.hidden = false;
	shortcutName.focus();
}

function openEditShortcutModal(index) {
	const item = shortcuts[index];
	if (!item) {
		return;
	}

	editingIndex = index;
	shortcutModalTitle.textContent = "Edit Shortcut";
	shortcutSubmit.textContent = "Save";
	shortcutName.value = item.name;
	shortcutUrl.value = item.url;
	shortcutModal.hidden = false;
	shortcutName.focus();
}

function closeShortcutModal() {
	shortcutForm.reset();
	editingIndex = -1;
	shortcutModal.hidden = true;
}

function createShortcutTile(item, index) {
	const tile = document.createElement("div");
	tile.className = "shortcut-tile";

	const shortcutLink = document.createElement("a");
	shortcutLink.className = "shortcut-link";
	shortcutLink.href = normalizeUrl(item.url);

	const iconWrap = document.createElement("span");
	iconWrap.className = "shortcut-icon";

	const icon = document.createElement("img");
	icon.src = faviconFor(item.url);
	icon.alt = `${item.name} logo`;

	const label = document.createElement("span");
	label.className = "shortcut-label";
	label.textContent = item.name;

	const menuWrap = document.createElement("div");
	menuWrap.className = "shortcut-menu-wrap";

	const menuBtn = document.createElement("button");
	menuBtn.type = "button";
	menuBtn.className = "shortcut-menu-btn";
	menuBtn.textContent = "⋮";
	menuBtn.setAttribute("aria-label", "Shortcut options");

	const menu = document.createElement("div");
	menu.className = "shortcut-menu";
	menu.hidden = true;

	const editBtn = document.createElement("button");
	editBtn.type = "button";
	editBtn.className = "shortcut-menu-item";
	editBtn.textContent = "Edit";
	editBtn.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		menu.hidden = true;
		menuWrap.classList.remove("open");
		openEditShortcutModal(index);
	});

	const deleteBtn = document.createElement("button");
	deleteBtn.type = "button";
	deleteBtn.className = "shortcut-menu-item danger";
	deleteBtn.textContent = "Delete";
	deleteBtn.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		shortcuts.splice(index, 1);
		saveShortcuts();
		renderShortcuts();
	});

	menuBtn.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		const isOpen = !menu.hidden;
		document.querySelectorAll(".shortcut-menu").forEach((element) => {
			element.hidden = true;
		});
		document.querySelectorAll(".shortcut-menu-wrap.open").forEach((element) => {
			element.classList.remove("open");
		});
		menu.hidden = isOpen;
		if (!isOpen) {
			menuWrap.classList.add("open");
		} else {
			menuWrap.classList.remove("open");
		}
	});

	menu.append(editBtn, deleteBtn);
	menuWrap.append(menuBtn, menu);

	iconWrap.append(icon);
	shortcutLink.append(iconWrap, label);
	tile.append(shortcutLink, menuWrap);

	return tile;
}

function createAddTile() {
	const addTile = document.createElement("button");
	addTile.type = "button";
	addTile.className = "shortcut-tile add-tile";

	const icon = document.createElement("span");
	icon.className = "shortcut-icon";
	icon.textContent = "+";

	const label = document.createElement("span");
	label.className = "shortcut-label";
	label.textContent = "Add shortcut";

	addTile.append(icon, label);
	addTile.addEventListener("click", openShortcutModal);

	return addTile;
}

function renderShortcuts() {
	shortcutsGrid.innerHTML = "";
	shortcuts.forEach((item, index) => {
		shortcutsGrid.append(createShortcutTile(item, index));
	});
	shortcutsGrid.append(createAddTile());
}

function pickRandomQuotes(count) {
	const pool = [...techQuotes];
	for (let index = pool.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
	}
	return pool.slice(0, Math.max(1, Math.min(count, pool.length)));
}

function renderTechQuotes() {
	if (!quotesList) {
		return;
	}

	quotesList.innerHTML = "";
	pickRandomQuotes(1).forEach((quote) => {
		const item = document.createElement("figure");
		item.className = "quote-item";

		const body = document.createElement("blockquote");
		body.textContent = quote.text;

		const author = document.createElement("figcaption");
		author.textContent = quote.author;

		item.append(body, author);
		quotesList.append(item);
	});
}

function looksLikeUrl(value) {
	return /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value);
}

function updatePointerVars(clientX, clientY) {
	const x = clientX / window.innerWidth;
	const y = clientY / window.innerHeight;
	root.style.setProperty("--pointer-x", x.toFixed(3));
	root.style.setProperty("--pointer-y", y.toFixed(3));
}

searchForm.addEventListener("submit", (event) => {
	const query = searchInput.value.trim();
	if (!query) {
		return;
	}

	if (looksLikeUrl(query)) {
		event.preventDefault();
		window.location.href = normalizeUrl(query);
	}
	clearSuggestions();
});

if (taskForm && taskInput) {
	taskForm.addEventListener("submit", (event) => {
		event.preventDefault();
		addTask(taskInput.value);
		taskInput.value = "";
		taskInput.focus();
	});
}

if (taskList) {
	taskList.addEventListener("change", (event) => {
		const checkbox = event.target.closest('input[type="checkbox"]');
		if (!checkbox) {
			return;
		}

		const taskItem = checkbox.closest(".task-item");
		if (!taskItem || !taskItem.dataset.taskId) {
			return;
		}

		updateTask(taskItem.dataset.taskId, { done: checkbox.checked });
	});

	taskList.addEventListener("click", (event) => {
		const removeButton = event.target.closest(".task-remove");
		if (!removeButton) {
			return;
		}

		const taskItem = removeButton.closest(".task-item");
		if (!taskItem || !taskItem.dataset.taskId) {
			return;
		}

		removeTask(taskItem.dataset.taskId);
	});
}

if (taskClearCompleted) {
	taskClearCompleted.addEventListener("click", clearCompletedTasks);
}

if (taskClearAll) {
	taskClearAll.addEventListener("click", clearAllTasks);
}

if (quickAddTaskBtn) {
	quickAddTaskBtn.addEventListener("click", openQuickTaskModal);
}

if (quickTaskCancel) {
	quickTaskCancel.addEventListener("click", closeQuickTaskModal);
}

if (quickTaskForm && quickTaskInput) {
	quickTaskForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const value = quickTaskInput.value.trim();
		if (!value) {
			return;
		}
		addTask(value);
		closeQuickTaskModal();
	});
}

if (quickTaskModal) {
	quickTaskModal.addEventListener("click", (event) => {
		if (event.target === quickTaskModal) {
			closeQuickTaskModal();
		}
	});
}

searchInput.addEventListener("input", queueSuggestions);

searchInput.addEventListener("focus", () => {
	if (suggestionItems.length) {
		searchSuggestions.hidden = false;
		searchInput.setAttribute("aria-expanded", "true");
	}
});

searchInput.addEventListener("keydown", (event) => {
	if (searchSuggestions.hidden) {
		return;
	}

	if (event.key === "ArrowDown") {
		event.preventDefault();
		const nextIndex = Math.min(highlightedSuggestionIndex + 1, suggestionItems.length - 1);
		highlightSuggestion(nextIndex);
	} else if (event.key === "ArrowUp") {
		event.preventDefault();
		const nextIndex = Math.max(highlightedSuggestionIndex - 1, 0);
		highlightSuggestion(nextIndex);
	} else if (event.key === "Enter" && highlightedSuggestionIndex >= 0) {
		event.preventDefault();
		chooseSuggestion(highlightedSuggestionIndex);
	} else if (event.key === "Escape") {
		clearSuggestions();
	}
});

searchInput.addEventListener("blur", () => {
	setTimeout(() => {
		clearSuggestions();
	}, 120);
});

updateDateTime();
setInterval(updateDateTime, 1000);

window.addEventListener("pointermove", (event) => {
	updatePointerVars(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
	updatePointerVars(window.innerWidth / 2, window.innerHeight / 2);
});

shortcutCancel.addEventListener("click", closeShortcutModal);

customizeBtn.addEventListener("click", openCustomizeModal);
customizeClose.addEventListener("click", closeCustomizeModal);

customizeModal.addEventListener("click", (event) => {
	if (event.target === customizeModal) {
		closeCustomizeModal();
	}
});

themeSelect.addEventListener("change", () => {
	settings.theme = themeSelect.value;
	setTheme(settings.theme);
	saveSettings();
});

if (terminalModeToggle) {
	terminalModeToggle.addEventListener("change", () => {
		settings.terminalMode = terminalModeToggle.checked;
		document.body.classList.toggle("terminal-mode", settings.terminalMode);
		saveSettings();
	});
}

if (layoutGrid) {
	layoutGrid.addEventListener("click", (event) => {
		const chip = event.target.closest(".layout-chip");
		if (!chip) {
			return;
		}

		settings.layout = chip.dataset.layout || defaultSettings.layout;
		setLayout(settings.layout);
		saveSettings();
	});
}

bgUpload.addEventListener("change", () => {
	const file = bgUpload.files && bgUpload.files[0];
	if (!file) {
		return;
	}

	const reader = new FileReader();
	reader.onload = () => {
		if (typeof reader.result !== "string") {
			return;
		}
		settings.background = reader.result;
		setBackground(settings.background);
		saveSettings();
	};
	reader.readAsDataURL(file);
});

[customPrimary, customSecondary, customGlow, customSpeed].forEach((control) => {
	if (!control) {
		return;
	}
	control.addEventListener("input", () => {
		settings.custom = {
			primary: customPrimary ? customPrimary.value : defaultSettings.custom.primary,
			secondary: customSecondary ? customSecondary.value : defaultSettings.custom.secondary,
			glow: customGlow ? customGlow.value : defaultSettings.custom.glow,
			speed: customSpeed ? Number(customSpeed.value) : defaultSettings.custom.speed
		};
		applyCustomTemplate();
		saveSettings();
	});
});

templateGrid.addEventListener("click", (event) => {
	const chip = event.target.closest(".template-chip");
	if (!chip) {
		return;
	}

	settings.template = chip.dataset.template || defaultSettings.template;
	setTemplate(settings.template);
	saveSettings();
});

customizeReset.addEventListener("click", () => {
	settings = { ...defaultSettings };
	bgUpload.value = "";
	applyCustomTemplate();
	applySettings();
	saveSettings();
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		closeShortcutModal();
		closeCustomizeModal();
		closeTaskWarningPopup();
		closeQuickTaskModal();
	}
});

document.addEventListener("click", () => {
	document.querySelectorAll(".shortcut-menu").forEach((element) => {
		element.hidden = true;
	});
	document.querySelectorAll(".shortcut-menu-wrap.open").forEach((element) => {
		element.classList.remove("open");
	});
});

document.addEventListener("click", (event) => {
	if (!searchForm.contains(event.target)) {
		clearSuggestions();
	}
});

shortcutModal.addEventListener("click", (event) => {
	if (event.target === shortcutModal) {
		closeShortcutModal();
	}
});

if (taskWarningDismiss) {
	taskWarningDismiss.addEventListener("click", closeTaskWarningPopup);
}

if (taskWarningModal) {
	taskWarningModal.addEventListener("click", (event) => {
		if (event.target === taskWarningModal) {
			closeTaskWarningPopup();
		}
	});
}

shortcutForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const name = shortcutName.value.trim();
	const url = shortcutUrl.value.trim();
	if (!name || !url) {
		return;
	}

	const normalized = normalizeUrl(url);
	if (editingIndex >= 0) {
		shortcuts[editingIndex] = { name, url: normalized };
	} else {
		shortcuts.push({ name, url: normalized });
	}
	saveShortcuts();
	renderShortcuts();
	closeShortcutModal();
});

shortcuts = loadShortcuts();
tasks = loadTasks();
settings = loadSettings();
applySettings();
renderShortcuts();
renderTasks();
renderTechQuotes();
warnPendingTasksOnOpen();
