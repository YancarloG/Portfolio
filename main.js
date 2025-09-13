// main.js
window.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');

  const toggleDarkModeBtn = document.getElementById('toggle-darkmode');
  const toggleMusicBtn = document.getElementById('toggle-music');
  const toggleWavesBtn = document.getElementById('toggle-waves');

  const music = document.getElementById('bg-music');
  const waveSound = document.getElementById('wave-sound');

  let isMusicPlaying = false;
  let isWavePlaying = false;

  // Fade in the "Enter" button shortly after load
  setTimeout(() => {
    if (enterBtn) enterBtn.classList.add('visible');
  }, 300);

  // Enter site: remove intro, reveal main, trigger CSS-driven button animations
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      if (introScreen) introScreen.remove();
      if (mainContent) mainContent.classList.remove('hidden');

      // Single toggle that lets CSS animate ALL project buttons
      document.body.classList.add('entered');
    });
  }

  // Toggle dark mode
  if (toggleDarkModeBtn) {
    toggleDarkModeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  // Toggle background music
  if (toggleMusicBtn && music) {
    toggleMusicBtn.addEventListener('click', () => {
      if (!isMusicPlaying) {
        music.play().catch(() => {/* autoplay may be blocked until user interaction */});
      } else {
        music.pause();
        music.currentTime = 0;
      }
      isMusicPlaying = !isMusicPlaying;
    });
  }

  // Toggle wave sounds
  if (toggleWavesBtn && waveSound) {
    toggleWavesBtn.addEventListener('click', () => {
      if (!isWavePlaying) {
        waveSound.play().catch(() => {/* autoplay may be blocked until user interaction */});
      } else {
        waveSound.pause();
        waveSound.currentTime = 0;
      }
      isWavePlaying = !isWavePlaying;
    });
  }

  // Start glitch title loop
  startGlitchLoop();
});

// Glitch the document title briefly, then restore, then repeat after a random delay
function startGlitchLoop(duration = 3000) {
  const glitchTitles = ["Yantento.ai", "Y@nt3nto", "Yan Guzman", "Yantento.com", "YanG.dev"];
  const stableTitle = "Yantento.com";
  let glitchIndex = 0;

  const glitchInterval = setInterval(() => {
    document.title = glitchTitles[glitchIndex % glitchTitles.length];
    glitchIndex++;
  }, 100);

  setTimeout(() => {
    clearInterval(glitchInterval);
    document.title = stableTitle;
    const delay = Math.floor(Math.random() * 4000) + 3000; // 3–7s
    setTimeout(() => startGlitchLoop(), delay);
  }, duration);
}
