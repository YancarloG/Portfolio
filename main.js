// Yan Guzman — Interactive logic for my styled portfolio

window.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const glitchGif = document.getElementById('glitch-gif');
  const music = document.getElementById('bg-music');
  const wtBtn = document.getElementById('launch-wt-btn');
  const bankBtn = document.getElementById('launch-bank-btn');
  const toggleBtn = document.getElementById('toggle-darkmode');

  let isMusicPlaying = false;

  // Show enter button with delay
  setTimeout(() => {
    enterBtn.classList.add('visible');
  }, 300);

  // Enter site behavior
  enterBtn.addEventListener('click', () => {
    introScreen.remove();
    mainContent.classList.remove('hidden');
    wtBtn.classList.add('fade-in-button');
    bankBtn.classList.add('fade-in-button');
  });

  // Toggle play/pause music and switch gif
  glitchGif.addEventListener('click', () => {
    if (!isMusicPlaying) {
      glitchGif.src = 'assets/gif2.GIF';
      music.play();
    } else {
      glitchGif.src = 'assets/gif1.GIF';
      music.pause();
      music.currentTime = 0;
    }
    isMusicPlaying = !isMusicPlaying;
  });

  // Tab glitch title loop
  startGlitchLoop();

  // Toggle dark mode
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
});

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
