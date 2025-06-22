// Yan Guzman — JS logic for landing page

// Run once DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-btn');
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const glitchGif = document.getElementById('glitch-gif');
  const music = document.getElementById('bg-music');

  const wtBtn = document.getElementById('launch-wt-btn');
  const bankBtn = document.getElementById('launch-bank-btn');

  // Show "Enter" button with delay for effect
  setTimeout(() => {
    enterBtn.classList.add('visible');
  }, 300);

  // Handle "Enter" button click
  enterBtn.addEventListener('click', () => {
    introScreen.remove(); // Remove intro screen
    mainContent.classList.remove('hidden'); // Reveal main content
    wtBtn.classList.add('fade-in-button'); // Animate project buttons
    bankBtn.classList.add('fade-in-button');
  });

  // Trigger alternate gif and play background music
  glitchGif.addEventListener('click', () => {
    glitchGif.src = 'assets/gif2.gif';
    music.play();
  });

  // Start glitching tab title loop
  startGlitchLoop();
});

// Function to randomly cycle the document title for glitch effect
function startGlitchLoop(duration = 3000) {
  const glitchTitles = [
    "Yantento.ai", "Y@nt3nto", "Yan Guzman", "Yantento.com", "YanG.dev"
  ];

  let glitchIndex = 0;
  let glitchInterval;
  const stableTitle = "Yantento.com";

  glitchInterval = setInterval(() => {
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
