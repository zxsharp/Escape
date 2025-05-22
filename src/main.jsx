import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setupGlobalAudioHandlers } from './utils/audio.js'

// Setup global audio handlers as early as possible
setupGlobalAudioHandlers();

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

