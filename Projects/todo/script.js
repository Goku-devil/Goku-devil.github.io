let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const THEME_KEY = "todoTheme";

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
        const themeIcon = toggleButton.querySelector("i");
        if (themeIcon) {
            themeIcon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
        }
        toggleButton.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const preferredTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
    applyTheme(preferredTheme);

    const toggleButton = document.getElementById("theme-toggle");
    if (!toggleButton) return;

    toggleButton.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, nextTheme);
        applyTheme(nextTheme);
    });
}

function initializeNavbar() {
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    if (!navToggle || !navMenu || !navbar) return;

    const closeMenu = () => {
        navMenu.classList.remove("nav-active");
        navToggle.classList.remove("toggle");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation menu");
    };

    navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("nav-active");
        navToggle.classList.toggle("toggle", isOpen);
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    const setActiveLink = (hash) => {
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === hash);
        });
    };

    navLinks.forEach((link) => {
        const targetHash = link.getAttribute("href");
        if (!targetHash || !targetHash.startsWith("#")) {
            return;
        }

        const section = document.querySelector(targetHash);
        if (!section) {
            return;
        }

        link.addEventListener("click", (event) => {
            event.preventDefault();
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", targetHash);
            setActiveLink(targetHash);
            closeMenu();
        });
    });

    const sections = navLinks
        .map((link) => {
            const hash = link.getAttribute("href");
            return hash ? document.querySelector(hash) : null;
        })
        .filter(Boolean);

    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveLink(`#${entry.target.id}`);
                    }
                });
            },
            { threshold: 0.45 }
        );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            closeMenu();
        }
    });

    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    const initialHash = window.location.hash;
    const hasInitialTarget = initialHash ? document.querySelector(initialHash) : null;
    if (hasInitialTarget) {
        setActiveLink(initialHash);
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;

    list.innerHTML = "";

    if (tasks.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";
        emptyItem.textContent = "No tasks yet. Add one to get started.";
        list.appendChild(emptyItem);
        return;
    }

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

                const textSpan = document.createElement("span");
                textSpan.textContent = task.text;
                textSpan.addEventListener("click", () => toggleTask(index));

                const actions = document.createElement("div");
                actions.className = "actions";

                const completeBtn = document.createElement("button");
                completeBtn.className = "complete-btn";
                completeBtn.textContent = "✓";
                completeBtn.type = "button";
                completeBtn.setAttribute("aria-label", task.completed ? "Mark task incomplete" : "Mark task complete");
                completeBtn.addEventListener("click", () => toggleTask(index));

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "✕";
                deleteBtn.type = "button";
                deleteBtn.setAttribute("aria-label", "Delete task");
                deleteBtn.addEventListener("click", () => deleteTask(index));

                actions.appendChild(completeBtn);
                actions.appendChild(deleteBtn);
                li.appendChild(textSpan);
                li.appendChild(actions);

        list.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById("taskInput");
    if (!input) return;

    const text = input.value.trim();

    if (text === "") return;

    tasks.push({ text, completed: false });
    input.value = "";

    saveTasks();
    renderTasks();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

const taskInput = document.getElementById("taskInput");
if (taskInput) {
    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addTask();
        }
    });
}

initializeTheme();
initializeNavbar();
renderTasks();