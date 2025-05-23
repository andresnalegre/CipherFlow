(() => {
    const messages = ["Wake up, Neo...", "The Matrix has you..."];
    const typingText = document.getElementById("typingText");
    const matrixAudio = document.getElementById("matrixAudio");
    
    // Create a pool of typewriter sound effects for better control
    const typewriterAudioPool = [];
    const AUDIO_POOL_SIZE = 3;
    
    for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
        const audio = new Audio('./assets/audio/TypeWriter.mp3');
        audio.volume = 0.4;
        typewriterAudioPool.push(audio);
    }
    
    let audioIndex = 0;
    let charIndex = 0;
    let audioInitialized = false;
    let isMobileDevice = window.innerWidth <= 768;
    let messageSequenceComplete = false;
    let activeTypewriterSounds = []; // Track active sounds to stop them

    matrixAudio.volume = 0.3;

    // Create and add black overlay to start
    const blackOverlay = document.createElement('div');
    blackOverlay.id = 'blackOverlay';
    blackOverlay.style.position = 'fixed';
    blackOverlay.style.top = '0';
    blackOverlay.style.left = '0';
    blackOverlay.style.width = '100%';
    blackOverlay.style.height = '100%';
    blackOverlay.style.backgroundColor = '#000';
    blackOverlay.style.zIndex = '1000';
    blackOverlay.style.cursor = 'pointer';
    document.body.appendChild(blackOverlay);

    // Hide typingText initially
    typingText.style.opacity = '0';

    function initializeAudio() {
        if (!audioInitialized) {
            // Initialize all audio elements
            const promises = [matrixAudio.play().then(() => matrixAudio.pause())];
            
            typewriterAudioPool.forEach(audio => {
                promises.push(audio.play().then(() => audio.pause()));
            });
            
            Promise.all(promises)
                .then(() => {
                    audioInitialized = true;
                    console.log("Audio initialized successfully");
                })
                .catch(error => {
                    console.log("Error initializing audio:", error);
                    document.addEventListener('click', () => {
                        if (!audioInitialized) initializeAudio();
                    }, { once: true });
                });
        }
    }

    function handleInitialClick() {
        // Initialize audio first
        initializeAudio();
        
        // Remove black overlay
        blackOverlay.style.transition = 'opacity 1s';
        blackOverlay.style.opacity = '0';
        
        setTimeout(() => {
            // Remove overlay completely after fade
            document.body.removeChild(blackOverlay);
            
            // Show typingText
            typingText.style.transition = 'opacity 0.5s';
            typingText.style.opacity = '1';
            
            // Start sequence
            startSequence();
        }, 1000);

        // Remove event listeners
        blackOverlay.removeEventListener('click', handleInitialClick);
        blackOverlay.removeEventListener('touchstart', handleInitialClick);
    }

    // Add event listeners for initial click
    blackOverlay.addEventListener('click', handleInitialClick);
    blackOverlay.addEventListener('touchstart', handleInitialClick);

    function startSequence() {
        typeMessage(messages[0], () => {
            document.addEventListener("click", handleFirstClick);
            document.addEventListener("touchstart", handleFirstClick);
            document.addEventListener("keydown", handleFirstKeydown);
        });
    }

    function handleFirstClick() {
        document.removeEventListener("click", handleFirstClick);
        document.removeEventListener("touchstart", handleFirstClick);
        document.removeEventListener("keydown", handleFirstKeydown);
        
        // Stop any ongoing typewriter sounds
        stopAllTypewriterSounds();
        
        deleteMessage(() => {
            setTimeout(showSecondMessage, 500);
        });
    }

    function handleFirstKeydown(event) {
        if (event.key === " " || event.key === "Enter") {
            handleFirstClick();
        }
    }
    
    // Helper function to stop all typewriter sounds
    function stopAllTypewriterSounds() {
        activeTypewriterSounds.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                console.error("Error stopping typewriter sound:", e);
            }
        });
        activeTypewriterSounds = [];
    }

    function playTypewriterSound() {
        if (!audioInitialized) return null;
        
        try {
            // Get the next audio object from the pool
            const audio = typewriterAudioPool[audioIndex];
            
            // Reset the audio to the beginning
            audio.currentTime = 0;
            
            // Play the sound
            const playPromise = audio.play();
            
            // Handle potential promise rejection
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Error playing typewriter sound:", error);
                    // Remove from active sounds list on error
                    const index = activeTypewriterSounds.indexOf(audio);
                    if (index > -1) {
                        activeTypewriterSounds.splice(index, 1);
                    }
                });
            }
            
            // Add to active sounds list
            activeTypewriterSounds.push(audio);
            
            // Create a timeout to remove this sound from active list after its duration
            const soundDuration = isMobileDevice ? 200 : 150; // Adjust based on your audio file
            setTimeout(() => {
                const index = activeTypewriterSounds.indexOf(audio);
                if (index > -1) {
                    activeTypewriterSounds.splice(index, 1);
                }
            }, soundDuration);
            
            // Move to the next audio object for the next character
            audioIndex = (audioIndex + 1) % AUDIO_POOL_SIZE;
            
            return audio;
        } catch (e) {
            console.error("Error in typewriter sound:", e);
            return null;
        }
    }

    function typeMessage(message, callback) {
        charIndex = 0;
        
        // Ensure any previous typewriter sounds are stopped
        stopAllTypewriterSounds();
        
        function type() {
            if (charIndex < message.length) {
                // Play typewriter sound for each character
                playTypewriterSound();
                
                typingText.textContent = message.slice(0, charIndex + 1);
                charIndex++;
                
                // Adjust typing speed based on device size for better sound sync
                const randomDelay = isMobileDevice 
                    ? Math.floor(Math.random() * 180) + 70  
                    : Math.floor(Math.random() * 150) + 50;
                    
                setTimeout(type, randomDelay);
            } else if (callback) {
                // When typing is complete, ensure all typewriter sounds are stopped
                stopAllTypewriterSounds();
                setTimeout(callback, 500);
            }
        }
        
        type();
    }
  
    function deleteMessage(callback) {
        // Ensure any ongoing typewriter sounds are stopped
        stopAllTypewriterSounds();
        
        function deleteChar() {
            if (charIndex > 0) {
                typingText.textContent = typingText.textContent.slice(0, charIndex - 1);
                charIndex--;
                
                // Adjust delete speed based on device
                const randomDelay = isMobileDevice
                    ? Math.floor(Math.random() * 70) + 40
                    : Math.floor(Math.random() * 50) + 30;
                    
                setTimeout(deleteChar, randomDelay);
            } else if (callback) {
                callback();
            }
        }
        
        deleteChar();
    }
  
    function showSecondMessage() {
        typeMessage(messages[1], () => {
            typingText.classList.add("blink");
            
            // Mark the message sequence as complete
            messageSequenceComplete = true;
            
            // Wait a moment before starting the Matrix experience
            setTimeout(startMatrixExperience, 1000);
        });
    }
  
    function startMatrixExperience() {
        const matrixContainer = document.getElementById("matrixContainer");
        const overlayText = document.getElementById("overlayText");
        const developerCredit = document.getElementById("developerCredit");
    
        typingText.classList.add("hidden");
        matrixContainer.classList.remove("hidden");
        overlayText.classList.remove("hidden");
    
        const matrix = new MatrixRain('matrixContainer');
    
        setTimeout(() => {
            if (typeof GlitchText !== 'undefined') {
                GlitchText.init(overlayText);
            }
        }, 100);
    
        // Only play the Matrix soundtrack after message sequence is complete
        if (audioInitialized && messageSequenceComplete) {
            console.log("Playing Matrix soundtrack");
            
            // For mobile devices, ensure soundtrack starts clean
            if (isMobileDevice) {
                matrixAudio.currentTime = 0;
            }
            
            matrixAudio.play().catch(error => {
                console.error("Error playing Matrix soundtrack:", error);
            });
        }
    
        // First show developer credit
        setTimeout(() => {
            developerCredit.classList.remove("hidden");
            developerCredit.style.opacity = "0";
            developerCredit.style.zIndex = "1000";
            requestAnimationFrame(() => {
                developerCredit.style.opacity = "1";
            });
        }, 1500);
        
        // Then show social links with a delay
        setTimeout(() => {
            const socialLinks = document.getElementById("socialLinks");
            socialLinks.classList.remove("hidden");
            socialLinks.style.opacity = "0";
            socialLinks.style.zIndex = "1000";
            requestAnimationFrame(() => {
                socialLinks.style.opacity = "1";
            });
        }, 2000);
    }

    class MatrixRain {
        constructor(containerId, fontSize = 16) {
            this.container = document.getElementById(containerId);
            this.fontSize = fontSize;
            this.characters = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789@#$%^&*";
            this.columns = [];
            this.drops = [];
            
            this.container.style.overflow = 'hidden';
            this.container.style.position = 'fixed';
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            
            this.init();
            this.animate();
        }
  
        init() {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.container.appendChild(this.canvas);
            
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.zIndex = '1';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.initDrops();
        }
  
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            if (window.innerWidth <= 480) {
                this.fontSize = 12;
            } else if (window.innerWidth <= 768) {
                this.fontSize = 14;
            } else {
                this.fontSize = 16;
            }
            
            this.columns = Math.ceil(this.canvas.width / this.fontSize) + 1;
            this.ctx.font = `${this.fontSize}px monospace`;
            
            this.initDrops();
            
            // Update mobile detection on resize
            isMobileDevice = window.innerWidth <= 768;
        }
  
        initDrops() {
            this.drops = [];
            for (let i = 0; i < this.columns; i++) {
                this.drops[i] = Math.floor(Math.random() * -100);
            }
        }
  
        animate() {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
            this.ctx.fillStyle = '#0F0';
            
            for (let i = 0; i < this.drops.length; i++) {
                const char = this.characters[Math.floor(Math.random() * this.characters.length)];
                const x = (i * this.fontSize) - 1;
                const y = this.drops[i] * this.fontSize;
        
                this.ctx.fillText(char, x, y);
        
                if (y > this.canvas.height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }
        
                this.drops[i] += 0.7;
            }
        
            setTimeout(() => {
                requestAnimationFrame(() => this.animate());
            }, 33);
        }
    }

    window.addEventListener('resize', () => {
        if (typeof GlitchText !== 'undefined' && GlitchText.isRunning) {
            const overlayText = document.getElementById("overlayText");
            while (overlayText.firstChild) {
                overlayText.removeChild(overlayText.firstChild);
            }
            GlitchText.init(overlayText);
        }
    });
    
    // Stop sounds when page is hidden or browser tab changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAllTypewriterSounds();
        }
    });
    
    // Monitor orientation changes for mobile devices
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            isMobileDevice = window.innerWidth <= 768;
        }, 200);
    });
  
    // Remove the automatic start on load - now we wait for user click
    // window.addEventListener("load", startSequence);
})();