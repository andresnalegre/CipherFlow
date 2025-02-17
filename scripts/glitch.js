const GlitchText = {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()",
    isRunning: false,
    animationFrameId: null,

    calculateFontSize() {
        const width = window.innerWidth;
        if (width < 600) {
            return Math.max(24, Math.floor(width / 15));
        }
        return 48;
    },

    init(overlayTextElement) {
        if (this.isRunning) {
            this.stop();
        }
        
        this.isRunning = true;
        
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = '10';
        
        overlayTextElement.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const textX = canvas.width / 2;
        const textY = canvas.height / 2;
        
        const fontSize = this.calculateFontSize();
        ctx.font = `bold ${fontSize}px 'Courier New'`;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const staticText = "ENTER THE ";
        const targetText = "MATRIX";
        
        const textMetricsStatic = ctx.measureText(staticText);
        const textMetricsTarget = ctx.measureText(targetText);
        const totalTextWidth = ctx.measureText(staticText + targetText).width;
        
        const boundingBox = {
            x: textX - totalTextWidth / 2 + textMetricsStatic.width,
            y: textY - fontSize / 2,
            width: textMetricsTarget.width,
            height: fontSize
        };
        
        ctx.shadowColor = '#0F0';
        ctx.shadowBlur = fontSize / 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        this.startGlitch(ctx, textX, textY, staticText, targetText, boundingBox, canvas);
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const newFontSize = this.calculateFontSize();
            ctx.font = `bold ${newFontSize}px 'Courier New'`;
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = '#0F0';
            ctx.shadowBlur = newFontSize / 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        });
    },
    
    startGlitch(ctx, textX, textY, staticText, targetText, boundingBox, canvas) {
        let lastTime = 0;
        const glitchInterval = 200;
        
        const glitchEffect = (currentTime) => {
            if (currentTime - lastTime > glitchInterval) {
                const glitchedTarget = targetText
                    .split("")
                    .map(char => {
                        if (Math.random() < 0.3) {
                            return this.chars[Math.floor(Math.random() * this.chars.length)];
                        }
                        return char;
                    })
                    .join("");
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (Math.random() < 0.05) {
                    ctx.fillStyle = '#0F0';
                    const offset = Math.random() * 5;
                    ctx.fillText(staticText + glitchedTarget, textX + offset, textY);
                    ctx.fillStyle = '#FFF';
                    ctx.fillText(staticText + glitchedTarget, textX - offset, textY);
                } else {
                    ctx.fillStyle = '#FFF';
                    ctx.fillText(staticText + glitchedTarget, textX, textY);
                }
                
                lastTime = currentTime;
            }
            
            if (this.isRunning) {
                this.animationFrameId = requestAnimationFrame(glitchEffect);
            }
        };
        
        this.animationFrameId = requestAnimationFrame(glitchEffect);
    },
    
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
};