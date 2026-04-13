document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       CLI MODE RESTORATION (PERSISTENT)
       ========================================= */
    const savedCliMode = localStorage.getItem('cli-mode');
    if (savedCliMode === 'true') {
        document.documentElement.setAttribute('data-cli-mode', 'true');
    }

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
        
        // Dispatch custom event to notify JS components like the 3D Cube
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
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
        const intersecting = entries.filter(entry => entry.isIntersecting);
        intersecting.forEach((entry, index) => {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 150); // Stagger effect

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

        terminalInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const commandLine = this.value.trim();
                this.value = '';

                // Print command
                const cmdNode = document.createElement('p');
                cmdNode.innerHTML = `<span class="prompt"><span class="term-user">goku@portfolio</span>:<span class="term-path">${currentPath}</span>$</span> <span class="term-cmd">${commandLine}</span>`;
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
                    response = "<span class='help-title'>Available Commands</span>"
                        + "<span class='help-line'><span class='help-cmd'>ls</span><span class='help-desc'>list directory contents</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>cd</span><span class='help-desc'>change directory</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>cat</span><span class='help-desc'>print file contents</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>clear</span><span class='help-desc'>clear terminal output</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>whoami</span><span class='help-desc'>print current user</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>about</span><span class='help-desc'>print developer info</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>distros</span><span class='help-desc'>list favorite linux distros</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>mode -cli</span><span class='help-desc'>enable CLI theme</span></span>"
                        + "<span class='help-line'><span class='help-cmd'>mode -def</span><span class='help-desc'>switch back to default theme</span></span>";
                    break;
                case 'distros':
                    response = "- Kali Linux<br>- Ubuntu<br>- Garuda Linux<br>- Zorin OS<br>- Pop!_OS";
                    break;
                case 'about':
                    response = `<pre style="line-height: 1.2; font-family: inherit; color: var(--text-primary); margin: 0.5rem 0; font-weight: bold;">  ____  ___  _  ___   _ 
 / ___|/ _ \\| |/ / | | |
| |  _| | | | ' /| | | |
| |_| | |_| | . \\| |_| |
 \\____|\\___/|_|\\_\\\\___/ </pre>Hi, I'm Gokulraj A S! A web developer passionate about creating premium, dynamic user experiences.`;
                    break;
                case 'whoami':
                    response = "I'm a web developer passionate about creating premium, dynamic user experiences.";
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
                                return isDir ? `<span class="term-dir">${k}/</span>` : k;
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
                    terminalPrompt.innerHTML = `<span class="term-user">goku@portfolio</span>:<span class="term-path">${currentPath}</span>$`;
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
                case 'mode':
                    const modeFlag = args[1];
                    if (!modeFlag) {
                        response = `<span class="error">mode: missing flag | usage: mode -cli or mode -def</span>`;
                    } else if (modeFlag === '-cli') {
                        document.documentElement.setAttribute('data-cli-mode', 'true');
                        response = `<span class="highlight">CLI Mode Enabled</span>  >=>  Welcome to the Matrix Neo! 🟢`;
                        localStorage.setItem('cli-mode', 'true');
                    } else if (modeFlag === '-def') {
                        document.documentElement.setAttribute('data-cli-mode', 'false');
                        response = `<span class="highlight">CLI Mode Disabled</span>  <=  Back to the normal world`;
                        localStorage.setItem('cli-mode', 'false');
                    } else {
                        response = `<span class="error">mode: invalid flag '${modeFlag}' | usage: mode -cli or mode -def</span>`;
                    }
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

        // Mobile Terminal Popup Window Logic
        const mobileTerminalBtn = document.getElementById('mobile-terminal-btn');
        const terminalWrapper = document.querySelector('.terminal-wrapper');
        const closeBtn = document.querySelector('.terminal-dot.close');

        if (mobileTerminalBtn && terminalWrapper) {
            const originalParent = terminalWrapper.parentElement;

            const closeTerminal = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                terminalWrapper.classList.remove('visible-on-mobile');
                // Return it back to the original layout flexbox tree
                setTimeout(() => {
                    if (!terminalWrapper.classList.contains('visible-on-mobile')) {
                        originalParent.appendChild(terminalWrapper);
                    }
                }, 300);
            };

            mobileTerminalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Break out of all CSS stacking contexts by appending to body
                document.body.appendChild(terminalWrapper);
                
                // Ensure DOM update before triggering CSS transitions
                requestAnimationFrame(() => {
                    terminalWrapper.classList.add('visible-on-mobile');
                    setTimeout(() => {
                        if (terminalInput) terminalInput.focus();
                    }, 50);
                });
            });

            // Close when clicking the red dot in the terminal header
            if (closeBtn) {
                closeBtn.style.cursor = 'pointer';
                closeBtn.addEventListener('click', closeTerminal);
            }

            // Close when clicking the backdrop wrapper outside the terminal
            terminalWrapper.addEventListener('click', (e) => {
                if (e.target === terminalWrapper && terminalWrapper.classList.contains('visible-on-mobile')) {
                    closeTerminal();
                }
            });
        }
    }

    /* =========================================
       DIRECTION-AWARE SKILL CARD FLIP
       ========================================= */
    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function (e) {
            const rect = card.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;

            // Calculate mouse position relative to center of element
            const x = (e.clientX - rect.left - (w / 2)) * (w > h ? (h / w) : 1);
            const y = (e.clientY - rect.top - (h / 2)) * (h > w ? (w / h) : 1);

            // Calculate direction (0: top, 1: right, 2: bottom, 3: left)
            const direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;

            // Remove previous direction classes
            card.classList.remove('dir-top', 'dir-right', 'dir-bottom', 'dir-left');

            // Add new direction class
            if (direction === 0) card.classList.add('dir-top');
            else if (direction === 1) card.classList.add('dir-right');
            else if (direction === 2) card.classList.add('dir-bottom');
            else if (direction === 3) card.classList.add('dir-left');

            // Add hover state class
            card.classList.add('is-hovered');
        });

        card.addEventListener('mouseleave', function (e) {
            // Remove hover state to trigger un-flip
            card.classList.remove('is-hovered');
        });
    });

    /* =========================================
       HERO BACKGROUND INTERACTIVITY
       ========================================= */
    const heroSection = document.getElementById('hero');
    const heroBg = document.querySelector('.hero-bg-animated');

    if (heroSection && heroBg) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            
            // Normalize cursor coordinates from -1 to 1 based on section center
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            // 3D rotation logic (up to 15 degrees)
            const rotateX = -y * 30; // Tilt based on vertical axis
            const rotateY = x * 30;  // Tilt based on horizontal axis

            // Mild translation
            const moveX = x * -20;
            const moveY = y * -20;

            heroBg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${moveX}px, ${moveY}px)`;
        });
        
        // Reset tilt on mouse leave
        heroSection.addEventListener('mouseleave', () => {
            // Restore to flat
            heroBg.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)`;
        });
    }

    /* =========================================
       THREE.JS RUBIK'S CUBE (INTERACTIVE)
       ========================================= */
    const container = document.getElementById('three-cube-container');
    if (container && window.THREE) {
        const scene = new THREE.Scene();
        
        // Setup Camera
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 8;
        
        // Setup Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Group holds 27 small cubes to form a Rubik's shape
        const rubiksGroup = new THREE.Group();
        
        const boxSize = 0.96; // slightly less to create matrix gaps
        const offset = 1;
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        
        // Dynamic Glass Material
        const material = new THREE.MeshPhysicalMaterial({
            color: document.documentElement.getAttribute('data-theme') === 'light' ? 0xf8fafc : 0x0f172a,
            metalness: 0.2,
            roughness: 0.2,
            clearcoat: 1.0,
            transparent: true,
            opacity: 0.95
        });
        
        // Dynamic Wireframes
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: document.documentElement.getAttribute('data-theme') === 'light' ? 0x1e293b : 0x27c93f, 
            transparent: true, 
            opacity: 0.8 
        });
        
        // Listen for Theme Toggle to swap colors live
        document.addEventListener('themeChanged', (e) => {
            if(e.detail.theme === 'light') {
                material.color.setHex(0xf8fafc);
                edgesMaterial.color.setHex(0x1e293b);
            } else {
                material.color.setHex(0x0f172a);
                edgesMaterial.color.setHex(0x27c93f);
            }
        });
        
        for(let x = -1; x <= 1; x++) {
            for(let y = -1; y <= 1; y++) {
                for(let z = -1; z <= 1; z++) {
                    const cubeMesh = new THREE.Mesh(geometry, material);
                    cubeMesh.position.set(x * offset, y * offset, z * offset);
                    
                    const edges = new THREE.EdgesGeometry(geometry);
                    const line = new THREE.LineSegments(edges, edgesMaterial);
                    cubeMesh.add(line);
                    
                    rubiksGroup.add(cubeMesh);
                }
            }
        }
        
        scene.add(rubiksGroup);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);
        
        // Interaction Logic / Physics
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let velocity = { x: 0.005, y: 0.01 };
        let autoRotate = true;
        let dragTimeout;
        
        // Initial Orientation
        rubiksGroup.rotation.x = Math.PI / 6;
        rubiksGroup.rotation.y = Math.PI / 4;
        
        const dragStart = (e) => {
            isDragging = true;
            autoRotate = false;
            clearTimeout(dragTimeout);
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            previousMousePosition = { x: clientX, y: clientY };
            velocity = { x: 0, y: 0 };
        };
        
        const applyRotation = (dx, dy) => {
            // Apply mouse drag as quaternion rotation relative to unrotated world axes
            const quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
            const quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
            
            rubiksGroup.quaternion.premultiply(quaternionY);
            rubiksGroup.quaternion.premultiply(quaternionX);
        };
        
        const drag = (e) => {
            if (!isDragging) return;
            if(e.cancelable) e.preventDefault();
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const deltaX = clientX - previousMousePosition.x;
            const deltaY = clientY - previousMousePosition.y;
            
            velocity = { x: deltaX * 0.005, y: deltaY * 0.005 };
            applyRotation(velocity.x, velocity.y);
            
            previousMousePosition = { x: clientX, y: clientY };
        };
        
        const dragEnd = () => {
            if(!isDragging) return;
            isDragging = false;
            dragTimeout = setTimeout(() => {
                autoRotate = true;
            }, 2500);
        };
        
        container.addEventListener('mousedown', dragStart);
        window.addEventListener('mousemove', drag, {passive: false});
        window.addEventListener('mouseup', dragEnd);
        container.addEventListener('mouseleave', dragEnd);
        
        container.addEventListener('touchstart', dragStart, {passive: true});
        window.addEventListener('touchmove', drag, {passive: false});
        window.addEventListener('touchend', dragEnd);

        const animate = () => {
            requestAnimationFrame(animate);
            
            if(!isDragging) {
                applyRotation(velocity.x, velocity.y);
                
                velocity.x *= 0.95;
                velocity.y *= 0.95;
                
                if(autoRotate) {
                    velocity.x += (0.01 - velocity.x) * 0.05;
                    velocity.y += (0.005 - velocity.y) * 0.05;
                }
            }
            
            renderer.render(scene, camera);
        };
        animate();
        
        window.addEventListener('resize', () => {
            if(camera && renderer && container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    }
});
