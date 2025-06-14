// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const glitchGif = document.getElementById('glitch-gif');
  const music = document.getElementById('bg-music');

  const wtBtn = document.getElementById('launch-wt-btn');
  const bankBtn = document.getElementById('launch-bank-btn');

  // Fade in "Enter Site" button after load
  setTimeout(() => {
    enterBtn.classList.add('visible');
  }, 300);

  // Clicking Enter transitions to main site
  enterBtn.addEventListener('click', () => {
    introScreen.remove();
    mainContent.classList.remove('hidden');
    wtBtn.classList.add('fade-in-button');
    bankBtn.classList.add('fade-in-button');
  });

  // Clicking glitch gif starts music
  glitchGif.addEventListener('click', () => {
    glitchGif.src = 'assets/gif2.gif';
    music.play();
  });

  // Glitching tab title loop
  startGlitchLoop();
});

// Glitch tab title every few seconds
function startGlitchLoop(duration = 3000) {
  const glitchTitles = [
    "Y4ntent0", "Y@nt3nt0", "Yan7en7o", "Yant3n70", "Yant3nt0",
    "Y@ntento", "Y4n73n70", "Y4N7EN70", "YANT3NT0", "y4nt3nt0"
  ];

  let glitchIndex = 0;
  let glitchInterval;
  let isGlitching = false;
  const stableTitle = "Yantento.com";

  if (isGlitching) return;
  isGlitching = true;

  glitchInterval = setInterval(() => {
    document.title = glitchTitles[glitchIndex % glitchTitles.length];
    glitchIndex++;
  }, 100);

  setTimeout(() => {
    clearInterval(glitchInterval);
    document.title = stableTitle;
    isGlitching = false;
    const delay = Math.floor(Math.random() * 4000) + 3000;
    setTimeout(() => startGlitchLoop(), delay);
  }, duration);
}
