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

initializeTheme();
initializeNavbar();
