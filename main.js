// Yan Guzman — Interactive AI Portfolio Controls

window.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');

  const toggleDarkModeBtn = document.getElementById('toggle-darkmode');
  const toggleMusicBtn = document.getElementById('toggle-music');
  const toggleWavesBtn = document.getElementById('toggle-waves');

  const music = document.getElementById('bg-music');
  const waveSound = document.getElementById('wave-sound');

  const wtBtn = document.getElementById('launch-wt-btn');
  const bankBtn = document.getElementById('launch-bank-btn');

  let isMusicPlaying = false;
  let isWavePlaying = false;

  // Fade in enter button
  setTimeout(() => {
    enterBtn.classList.add('visible');
  }, 300);

  // Enter site
  enterBtn.addEventListener('click', () => {
    introScreen.remove();
    mainContent.classList.remove('hidden');
    wtBtn.classList.add('fade-in-button');
    bankBtn.classList.add('fade-in-button');
  });

  // Toggle dark mode
  toggleDarkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Toggle background music
  toggleMusicBtn.addEventListener('click', () => {
    if (!isMusicPlaying) {
      music.play();
    } else {
      music.pause();
      music.currentTime = 0;
    }
    isMusicPlaying = !isMusicPlaying;
  });

  // Toggle wave sounds
  toggleWavesBtn.addEventListener('click', () => {
    if (!isWavePlaying) {
      waveSound.play();
    } else {
      waveSound.pause();
      waveSound.currentTime = 0;
    }
    isWavePlaying = !isWavePlaying;
  });

  // Start glitch title loop
  startGlitchLoop();
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
