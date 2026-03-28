document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       THEME TOGGLE (LIGHT / DARK MODE)
       ========================================= */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme') || 'dark';

    // Function to set theme
    const setTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update Icon
        if (theme === 'light') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    };

    // Apply initial theme
    setTheme(currentTheme);

    // Event listener for toggle button
    themeToggleBtn.addEventListener('click', () => {
        let theme = htmlElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    /* =========================================
       MOBILE NAVIGATION (HAMBURGER)
       ========================================= */
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        // Toggle mobile menu
        navLinksContainer.classList.toggle('nav-active');
        // Animate hamburger to X
        hamburger.classList.toggle('toggle');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('nav-active')) {
                navLinksContainer.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            }
        });
    });

    /* =========================================
       STICKY NAVBAR UPDATES
       ========================================= */
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Highlight active link based on scroll position
    const sections = document.querySelectorAll('section, header');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            // Adjust the offset threshold based on your navbar height
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /* =========================================
       INTERSECTION OBSERVER (SCROLL ANIMATIONS)
       ========================================= */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('active');
            // Stop observing once revealed
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealOnScroll.observe(element);
    });

    /* =========================================
       TYPEWRITER EFFECT
       ========================================= */
    const textArray = ["Linux enthu!!", "Web developer", "Python developer"];
    const typingDelay = 100;
    const erasingDelay = 100;
    const newTextDelay = 2000; // Delay between current and next text
    let textArrayIndex = 0;
    let charIndex = 0;

    const typewriterSpan = document.querySelector(".typewriter");
    const cursorSpan = document.querySelector(".cursor");

    function type() {
        if (!typewriterSpan || !cursorSpan) return;
        if (charIndex < textArray[textArrayIndex].length) {
            if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
            typewriterSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingDelay);
        } else {
            cursorSpan.classList.remove("typing");
            setTimeout(erase, newTextDelay);
        }
    }

    function erase() {
        if (!typewriterSpan || !cursorSpan) return;
        if (charIndex > 0) {
            if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
            typewriterSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingDelay);
        } else {
            cursorSpan.classList.remove("typing");
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingDelay + 500);
        }
    }

    if (textArray.length) setTimeout(type, newTextDelay + 250);

    /* =========================================
       TERMINAL MODULE LOGIC
       ========================================= */
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalPrompt = document.getElementById('terminal-prompt');
    const terminalBodyWrapper = document.getElementById('terminal-body');

    if (terminalInput) {
        // Focus input when clicking anywhere on terminal
        terminalBodyWrapper.addEventListener('click', () => {
            terminalInput.focus();
        });

        const fileSystem = {
            "~": {
                type: "dir",
                children: {
                    "skills": {
                        type: "dir",
                        children: {
                            "frontend.txt": { type: "file", content: "HTML, CSS, JavaScript, React, Tailwind CSS" },
                            "backend.txt": { type: "file", content: "Node.js, Express, Python, Django, SQL" },
                            "tools.txt": { type: "file", content: "Git, bare-metal configuration, Figma" }
                        }
                    },
                    "projects": {
                        type: "dir",
                        children: {
                            "readme.txt": { type: "file", content: "Type 'cd ~' then explore the site via standard navigation for visual projects!" }
                        }
                    },
                    "about.txt": { type: "file", content: "Hi! I'm Goku, a passionate developer pursuing highly interactive and clean architectures.\nMy favorite tools are a terminal and a text editor." }
                }
            }
        };

        let currentPath = "~";

        function getDirFromPath(path) {
            if (path === "~") return fileSystem["~"];
            const parts = path.replace(/^~\//, "").split("/");
            let current = fileSystem["~"];
            for (let p of parts) {
                if (p && current.children && current.children[p]) {
                    current = current.children[p];
                } else {
                    return null;
                }
            }
            return current;
        }

        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                const commandLine = this.value.trim();
                this.value = '';
                
                // Print command
                const cmdNode = document.createElement('p');
                cmdNode.innerHTML = `<span class="prompt">goku@portfolio:${currentPath}$</span> ${commandLine}`;
                terminalOutput.appendChild(cmdNode);

                if (commandLine) {
                    processCommand(commandLine);
                }
                
                // Scroll to bottom
                terminalBodyWrapper.scrollTop = terminalBodyWrapper.scrollHeight;
            }
        });

        function processCommand(cmdLine) {
            const args = cmdLine.split(' ').filter(Boolean);
            const command = args[0].toLowerCase();

            const currentDirObj = getDirFromPath(currentPath);
            let response = "";

            switch (command) {
                case 'help':
                    response = "Available: <br>ls &nbsp;&nbsp;&nbsp;&nbsp;- list directory contents<br>cd &nbsp;&nbsp;&nbsp;&nbsp;- change directory<br>cat &nbsp;&nbsp;&nbsp;- print file contents<br>clear &nbsp;- clear terminal output<br>whoami - print current user";
                    break;
                case 'whoami':
                    response = "goku";
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    return;
                case 'pwd':
                    response = `/home/goku/${currentPath.replace('~', '')}`;
                    break;
                case 'ls':
                    if (currentDirObj.type === "dir") {
                        const keys = Object.keys(currentDirObj.children || {});
                        if (keys.length > 0) {
                            response = keys.map(k => {
                                const isDir = currentDirObj.children[k].type === "dir";
                                return isDir ? `<span style="color:var(--accent-1);font-weight:bold;">${k}/</span>` : k;
                            }).join("&nbsp;&nbsp;&nbsp;&nbsp;");
                        }
                    }
                    break;
                case 'cd':
                    const targetDir = args[1];
                    if (!targetDir || targetDir === "~" || targetDir === "/") {
                        currentPath = "~";
                    } else if (targetDir === "..") {
                        if (currentPath !== "~") {
                            const parts = currentPath.split("/");
                            parts.pop();
                            currentPath = parts.join("/") || "~";
                        }
                    } else {
                        const nextDir = currentDirObj.children ? currentDirObj.children[targetDir] : null;
                        if (nextDir && nextDir.type === "dir") {
                            currentPath = currentPath === "~" ? `~/${targetDir}` : `${currentPath}/${targetDir}`;
                        } else if (nextDir && nextDir.type === "file") {
                            response = `<span class="error">cd: ${targetDir}: Not a directory</span>`;
                        } else {
                            response = `<span class="error">cd: ${targetDir}: No such file or directory</span>`;
                        }
                    }
                    terminalPrompt.textContent = `goku@portfolio:${currentPath}$`;
                    break;
                case 'cat':
                    const targetFile = args[1];
                    if (!targetFile) {
                        response = "cat: missing file operand";
                    } else {
                        const contentNode = currentDirObj.children ? currentDirObj.children[targetFile] : null;
                        if (contentNode && contentNode.type === "file") {
                            response = contentNode.content.replace(/\n/g, '<br>');
                        } else if (contentNode && contentNode.type === "dir") {
                            response = `<span class="error">cat: ${targetFile}: Is a directory</span>`;
                        } else {
                            response = `<span class="error">cat: ${targetFile}: No such file or directory</span>`;
                        }
                    }
                    break;
                case 'echo':
                    response = args.slice(1).join(' ');
                    break;
                default:
                    response = `<span class="error">${command}: command not found</span>`;
            }

            if (response) {
                const resNode = document.createElement('p');
                resNode.innerHTML = response;
                terminalOutput.appendChild(resNode);
            }
        }
    }
});
