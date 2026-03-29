const THEME_KEY = "calculatorTheme";

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
	const preferredTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "dark";
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
		if (!targetHash || !targetHash.startsWith("#")) return;

		const section = document.querySelector(targetHash);
		if (!section) return;

		link.addEventListener("click", (event) => {
			event.preventDefault();
			section.scrollIntoView({ behavior: "smooth", block: "start" });
			history.replaceState(null, "", targetHash);
			setActiveLink(targetHash);
			closeMenu();
		});
	});

	window.addEventListener("resize", () => {
		if (window.innerWidth > 700) {
			closeMenu();
		}
	});

	window.addEventListener("scroll", () => {
		navbar.classList.toggle("scrolled", window.scrollY > 20);
	});
}

function initializeCalculator() {
	const display = document.getElementById("calcDisplay");
	const buttons = document.querySelectorAll(".calc-btn");
	if (!display || buttons.length === 0) return;

	const OPERATORS = ["+", "-", "*", "/", "%"];
	let expression = "0";

	const updateDisplay = () => {
		display.value = expression;
	};

	const appendValue = (value) => {
		if (expression === "0" && value !== ".") {
			expression = value;
			return;
		}

		const lastChar = expression[expression.length - 1];

		if (value === ".") {
			const tokens = expression.split(/[+\-*/%]/);
			const currentToken = tokens[tokens.length - 1];
			if (currentToken.includes(".")) return;
		}

		if (OPERATORS.includes(value) && OPERATORS.includes(lastChar)) {
			expression = expression.slice(0, -1) + value;
			return;
		}

		expression += value;
	};

	const clearAll = () => {
		expression = "0";
	};

	const deleteLast = () => {
		if (expression.length <= 1) {
			expression = "0";
			return;
		}
		expression = expression.slice(0, -1);
	};

	const evaluateExpression = () => {
		try {
			const sanitized = expression.replace(/%/g, "/100");
			const result = Function(`"use strict"; return (${sanitized})`)();

			if (!Number.isFinite(result)) {
				expression = "Error";
				return;
			}

			expression = Number(result.toFixed(10)).toString();
		} catch {
			expression = "Error";
		}
	};

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const action = button.dataset.action;
			const value = button.dataset.value;

			if (expression === "Error" && action !== "clear") {
				expression = "0";
			}

			if (action === "clear") {
				clearAll();
			} else if (action === "delete") {
				deleteLast();
			} else if (action === "equals") {
				evaluateExpression();
			} else if (value) {
				appendValue(value);
			}

			updateDisplay();
		});
	});

	window.addEventListener("keydown", (event) => {
		const allowedKeys = [...OPERATORS, ".", ..."0123456789"];
		if (allowedKeys.includes(event.key)) {
			if (expression === "Error") expression = "0";
			appendValue(event.key);
			updateDisplay();
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			evaluateExpression();
			updateDisplay();
		}

		if (event.key === "Backspace") {
			deleteLast();
			updateDisplay();
		}

		if (event.key === "Escape") {
			clearAll();
			updateDisplay();
		}
	});

	updateDisplay();
}

initializeTheme();
initializeNavbar();
initializeCalculator();
