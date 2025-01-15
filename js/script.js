const messages = ["Wake up, Neo...", "The Matrix has you..."];
const typingText = document.getElementById("typingText");
const socialLinksContainer = document.createElement("div");
let charIndex = 0;

function createSocialLinks() {
  socialLinksContainer.classList.add("social-icons");
  socialLinksContainer.id = "socialLinks";

  const links = [
    {
      href: "https://github.com/andresnalegre",
      imgSrc: "./images/github-icon.png",
      alt: "GitHub",
    },
    {
      href: "https://www.linkedin.com/in/andresni/",
      imgSrc: "./images/linkedin-icon.png",
      alt: "LinkedIn",
    },
    {
      href: "https://www.codecademy.com/profiles/andresnicolas",
      imgSrc: "./images/codeacademy-icon.png",
      alt: "Codecademy",
    },
  ];

  links.forEach(link => {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.target = "_blank";

    const img = document.createElement("img");
    img.src = link.imgSrc;
    img.alt = link.alt;
    img.classList.add("social-icon");

    anchor.appendChild(img);
    socialLinksContainer.appendChild(anchor);
  });

  document.body.appendChild(socialLinksContainer);
  socialLinksContainer.style.display = "none";
}

function typeMessage(message, callback) {
  charIndex = 0;

  function type() {
    typingText.textContent = message.slice(0, charIndex);
    if (charIndex < message.length) {
      charIndex++;
      const randomDelay = Math.floor(Math.random() * 150) + 50;
      setTimeout(type, randomDelay);
    } else if (callback) {
      setTimeout(callback, 500);
    }
  }
  type();
}

function deleteMessage(callback) {
  function deleteChar() {
    typingText.textContent = typingText.textContent.slice(0, charIndex);
    if (charIndex > 0) {
      charIndex--;
      const randomDelay = Math.floor(Math.random() * 50) + 30;
      setTimeout(deleteChar, randomDelay);
    } else if (callback) {
      callback();
    }
  }
  deleteChar();
}

function startSequence() {
  typeMessage(messages[0], () => {
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener(
      "keydown",
      event => {
        if (event.key === " " || event.key === "Enter") {
          handleInteraction();
        }
      },
      { once: true }
    );
  });
}

function handleInteraction() {
  deleteMessage(() => {
    setTimeout(showSecondMessage, 500);
  });
}

function showSecondMessage() {
  typeMessage(messages[1], () => {
    typingText.classList.add("blink");
    setTimeout(startMatrixExperience, 1000);
  });
}

function startMatrixExperience() {
  const matrixAudio = document.getElementById("matrixAudio");
  const matrixCanvas = document.getElementById("matrixCanvas");

  typingText.classList.add("hidden");
  matrixCanvas.classList.remove("hidden");

  const matrixAnimation = new MatrixRain("matrixCanvas");

  matrixAudio.currentTime = 34.8;
  matrixAudio.muted = false;
  matrixAudio.play().catch(error => {
    console.log("Autoplay blocked. Try enabling audio manually.");
  });

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = matrixCanvas.width;
  overlayCanvas.height = matrixCanvas.height;
  overlayCanvas.style.position = "absolute";
  overlayCanvas.style.top = "50%";
  overlayCanvas.style.left = "50%";
  overlayCanvas.style.transform = "translate(-50%, -50%)";
  overlayCanvas.style.zIndex = "10";
  document.body.appendChild(overlayCanvas);

  const overlayCtx = overlayCanvas.getContext("2d");

  typeTextOnOverlay(
    overlayCtx,
    overlayCanvas,
    "ENTER THE ",
    "MATRIX",
    () => {
      setTimeout(showSocialLinks, 2000);
    }
  );
}

function typeTextOnOverlay(ctx, canvas, staticText, targetText, callback) {
  let fullText = staticText + targetText;
  let index = 0;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
  let matrixBoundingBox = null;

  function typeLetter() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 48px 'Courier New'";
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textX = canvas.width / 2;
    const textY = canvas.height / 2;

    ctx.fillText(fullText.slice(0, index), textX, textY);

    if (index < fullText.length) {
      index++;
      const randomDelay = Math.floor(Math.random() * 150) + 50;
      setTimeout(typeLetter, randomDelay);
    } else {
      const textMetricsStatic = ctx.measureText(staticText);
      const textMetricsTarget = ctx.measureText(targetText);
      const totalTextWidth = ctx.measureText(fullText).width;

      matrixBoundingBox = {
        x: textX - totalTextWidth / 2 + textMetricsStatic.width,
        y: textY - parseInt(ctx.font, 10) / 2,
        width: textMetricsTarget.width,
        height: parseInt(ctx.font, 10),
      };

      if (callback) callback(matrixBoundingBox);
      startGlitch(targetText, ctx, textX, textY, staticText, matrixBoundingBox);
    }
  }

  function startGlitch(target, ctx, textX, textY, staticText, boundingBox) {
    function glitchEffect() {
      const glitchedTarget = target
        .split("")
        .map(char => (Math.random() < 0.3 ? chars[Math.floor(Math.random() * chars.length)] : char))
        .join("");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText(staticText + glitchedTarget, textX, textY);

      ctx.strokeStyle = "red";
      ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);

      setTimeout(glitchEffect, 200);
    }

    glitchEffect();
  }

  typeLetter();
}

function showSocialLinks() {
  const socialLinksContainer = document.getElementById("socialLinks");
  socialLinksContainer.classList.remove("hidden");
  socialLinksContainer.style.opacity = 0;
  socialLinksContainer.style.pointerEvents = "none";
  socialLinksContainer.style.transition = "opacity 1s ease-in-out";

  setTimeout(() => {
    socialLinksContainer.style.opacity = 1;
    socialLinksContainer.style.pointerEvents = "auto";
  }, 100);
}

class MatrixRain {
    constructor(canvasId, fontSize = 16, speed = 50, density = 0.975) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.fontSize = fontSize;
      this.speed = speed;
      this.density = density;
      this.characters = this.generateCharacters();
      this.columns = [];
      this.initCanvas(); // Inicializa a canvas apenas uma vez
      this.startAnimation();
    }
  
    generateCharacters() {
      const range = (start, end, step = 1) =>
        Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, i) => start + i * step);
      const charRange = (start, end) =>
        range(start.charCodeAt(0), end.charCodeAt(0)).map(code => String.fromCharCode(code));
  
      return [].concat(
        charRange("0", "9"),
        charRange("A", "Z"),
        charRange("a", "z")
      );
    }
  
    initCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx.font = `${this.fontSize}px monospace`;
      this.columns = Array(Math.floor(this.canvas.width / this.fontSize)).fill(1);
    }
  
    drawRain() {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#0F0";
  
      this.columns.forEach((yPos, colIdx) => {
        const char = this.characters[Math.floor(Math.random() * this.characters.length)];
        const xPos = colIdx * this.fontSize;
        this.ctx.fillText(char, xPos, yPos * this.fontSize);
  
        if (yPos * this.fontSize > this.canvas.height && Math.random() > this.density) {
          this.columns[colIdx] = 0;
        }
        this.columns[colIdx]++;
      });
    }
  
    startAnimation() {
      this.intervalId = setInterval(() => this.drawRain(), this.speed);
    }
  }
  

window.addEventListener("load", () => {
  createSocialLinks();
  startSequence();
});
