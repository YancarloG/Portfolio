// Wait until everything is ready
window.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const glitchGif = document.getElementById('glitch-gif');
  const music = document.getElementById('bg-music');

  const wtBtn = document.getElementById('launch-wt-btn');
  const bankBtn = document.getElementById('launch-bank-btn');

  // Fade in the "Enter Site" button shortly after load
  setTimeout(() => {
    enterBtn.classList.add('visible');
  }, 300);

  // Clicking Enter Site removes intro and shows content
  enterBtn.addEventListener('click', () => {
    introScreen.remove(); // remove intro overlay
    mainContent.classList.remove('hidden'); // show main content
    wtBtn.classList.add('fade-in-button'); // animate Weight Tracker button
    bankBtn.classList.add('fade-in-button'); // animate Bankeze button
  });

  // Play music and change glitch gif on click
  glitchGif.addEventListener('click', () => {
    glitchGif.src = 'assets/gif2.gif'; // swap to active gif
    music.play(); // start background music
  });

  // Glitch the page title every few seconds
  startGlitchLoop();
});

// Glitching title loop
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
