// Yan Guzman — Interactive logic for my styled portfolio

// DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const glitchGif = document.getElementById('glitch-gif');
  const music = document.getElementById('bg-music');
  const wtBtn = document.getElementById('launch-wt-btn');
  const bankBtn = document.getElementById('launch-bank-btn');
  const toggleBtn = document.getElementById('toggle-darkmode');

  // Show "Enter" button with animation
  setTimeout(() => {
    enterBtn.classList.add('visible');
  }, 300);

  // Enter site logic
  enterBtn.addEventListener('click', () => {
    introScreen.remove();
    mainContent.classList.remove('hidden');
    wtBtn.classList.add('fade-in-button');
    bankBtn.classList.add('fade-in-button');
  });

  // GIF click plays music
  glitchGif.addEventListener('click', () => {
    glitchGif.src = 'assets/gif2.GIF';
    music.play();
  });

  // Title glitch effect loop
  startGlitchLoop();

  // Dark mode toggle
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
});

// Browser tab title glitch loop
function startGlitchLoop(duration = 3000) {
  const glitchTitles = [
    "Yantento.ai", "Y@nt3nto", "Yan Guzman", "Yantento.com", "YanG.dev"
  ];

  let glitchIndex = 0;
  const stableTitle = "Yantento.com";

  const glitchInterval = setInterval(() => {
    document.title = glitchTitles[glitchIndex % glitchTitles.length];
    glitchIndex++;
  }, 100);

  setTimeout(() => {
    clearInterval(glitchInterval);
    document.title = stableTitle;
    const delay = Math.floor(Math.random() * 4000) + 3000;
    setTimeout(() => startGlitchLoop(), delay);
  }, duration);
}
