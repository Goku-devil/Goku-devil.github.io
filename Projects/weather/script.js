const THEME_KEY = "weatherTheme";

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

const WEATHER_CODE_MAP = {
	0: "Clear sky",
	1: "Mainly clear",
	2: "Partly cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Depositing rime fog",
	51: "Light drizzle",
	53: "Moderate drizzle",
	55: "Dense drizzle",
	56: "Light freezing drizzle",
	57: "Dense freezing drizzle",
	61: "Slight rain",
	63: "Moderate rain",
	65: "Heavy rain",
	66: "Light freezing rain",
	67: "Heavy freezing rain",
	71: "Slight snow fall",
	73: "Moderate snow fall",
	75: "Heavy snow fall",
	77: "Snow grains",
	80: "Slight rain showers",
	81: "Moderate rain showers",
	82: "Violent rain showers",
	85: "Slight snow showers",
	86: "Heavy snow showers",
	95: "Thunderstorm",
	96: "Thunderstorm with slight hail",
	99: "Thunderstorm with heavy hail"
};

function setStatusMessage(message, variant = "") {
	const statusMessage = document.getElementById("statusMessage");
	if (!statusMessage) return;
	statusMessage.textContent = message;
	statusMessage.className = "status-message";
	if (variant) {
		statusMessage.classList.add(variant);
	}
}

function formatTime(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "--";
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderWeather(cityLabel, payload) {
	const weatherResult = document.getElementById("weatherResult");
	if (!weatherResult) return;

	const current = payload.current;
	document.getElementById("cityName").textContent = cityLabel;
	document.getElementById("weatherDescription").textContent = WEATHER_CODE_MAP[current.weather_code] || "Unknown conditions";
	document.getElementById("temperature").textContent = `${Math.round(current.temperature_2m)}${payload.current_units.temperature_2m}`;
	document.getElementById("feelsLike").textContent = `Feels like ${Math.round(current.apparent_temperature)}${payload.current_units.apparent_temperature}`;
	document.getElementById("humidity").textContent = `${current.relative_humidity_2m}${payload.current_units.relative_humidity_2m}`;
	document.getElementById("windSpeed").textContent = `${Math.round(current.wind_speed_10m)} ${payload.current_units.wind_speed_10m}`;
	document.getElementById("pressure").textContent = `${current.surface_pressure} ${payload.current_units.surface_pressure}`;
	document.getElementById("updatedAt").textContent = formatTime(current.time);

	weatherResult.hidden = false;
}

async function fetchCityCoordinates(city) {
	const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
	url.searchParams.set("name", city);
	url.searchParams.set("count", "1");
	url.searchParams.set("language", "en");
	url.searchParams.set("format", "json");

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Unable to search city right now.");
	}

	const data = await response.json();
	if (!data.results || data.results.length === 0) {
		throw new Error("City not found. Try a different name.");
	}

	return data.results[0];
}

async function fetchWeather(latitude, longitude) {
	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.searchParams.set("latitude", String(latitude));
	url.searchParams.set("longitude", String(longitude));
	url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code");
	url.searchParams.set("timezone", "auto");

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Unable to fetch weather data.");
	}

	const data = await response.json();
	if (!data.current) {
		throw new Error("Incomplete weather data received.");
	}

	return data;
}

function initializeWeatherApp() {
	const form = document.getElementById("weatherForm");
	const input = document.getElementById("cityInput");
	const button = document.getElementById("searchBtn");
	if (!form || !input || !button) return;

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const city = input.value.trim();
		if (!city) {
			setStatusMessage("Please enter a city name.", "error");
			return;
		}

		button.disabled = true;
		setStatusMessage("Checking weather...", "loading");

		try {
			const cityData = await fetchCityCoordinates(city);
			const weatherData = await fetchWeather(cityData.latitude, cityData.longitude);
			const cityLabel = [cityData.name, cityData.admin1, cityData.country].filter(Boolean).join(", ");
			renderWeather(cityLabel, weatherData);
			setStatusMessage("Live weather updated.", "success");
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : "Something went wrong.", "error");
		}

		button.disabled = false;
	});

	input.value = "Chennai";
	form.requestSubmit();
}

initializeTheme();
initializeNavbar();
initializeWeatherApp();
