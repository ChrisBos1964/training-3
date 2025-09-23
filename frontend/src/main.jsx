import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Console Easter Egg - Hidden developer features
console.champions = function() {
  console.log('🏆 CHAMPIONS TRAINING APP 🏆');
  console.log('+==========================================================+');
  console.log('|                                                          |');
  console.log('|              Welcome to the secret zone!                |');
  console.log('|                                                          |');
  console.log('|           Type \'console.help()\' for more               |');
  console.log('|           hidden commands and surprises!                |');
  console.log('|                                                          |');
  console.log('+==========================================================+');
};

console.help = function() {
  console.group('🎯 Available secret commands:');
  console.log('+==========================================================+');
  console.log('|                                                          |');
  console.log('|           console.champions() - Main message            |');
  console.log('|           console.help() - This help menu               |');
  console.log('|           console.creator() - Creator info              |');
  console.log('|           console.easterEgg() - Surprise!               |');
  console.log('|                                                          |');
  console.log('+==========================================================+');
  console.groupEnd();
};

console.creator = function() {
  console.log('👨‍💻 CREATOR INFORMATION 👨‍💻');
  console.log('+==========================================================+');
  console.log('|                                                          |');
  console.log('|                    Created by                            |');
  console.log('|                   Joël Grimberg                          |');
  console.log('|                                                          |');
  console.log('|              GrimbergIT / Grimberg Academy               |');
  console.log('|                                                          |');
  console.log('+==========================================================+');
};

console.easterEgg = function() {
  console.log('🥚 EASTER EGG DISCOVERED! 🥚');
  console.log('+==========================================================+');
  console.log('|                                                          |');
  console.log('|                🎉 CONGRATULATIONS! 🎉                   |');
  console.log('|                                                          |');
  console.log('|              You found the hidden surprise!              |');
  console.log('|              This app is built with love and             |');
  console.log('|              attention to detail. Enjoy! 🚀              |');
  console.log('|                                                          |');
  console.log('+==========================================================+');
};

// Auto-display welcome message when console is opened
console.log(`
  🏆 Welcome to Champions Training App!
  💡 Try typing 'console.champions()' for a surprise!
`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
