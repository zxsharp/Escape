import { mazeConfig } from './configs/mazeConfig.js';
import { Player } from './entities/Player.js';
import { SceneManager } from './scene/SceneManager.js';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import './App.css'

function App() {
  const canvasRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const playerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    // Initialize scene and player
    const canvas = canvasRef.current;
    const sceneManager = new SceneManager(canvas);
    const player = new Player(mazeConfig);
    
    sceneManagerRef.current = sceneManager;
    playerRef.current = player;
    
    // Create and add win popup
    const winPopup = document.createElement('div');
    winPopup.className = 'win-popup';
    winPopup.innerHTML = `
        <div class="popup-content">
            <h2>You Won!</h2>
            <button id="retry-btn">Retry</button>
            <button id="continue-btn">Continue</button>
        </div>
    `;
    winPopup.style.display = 'none';
    document.body.appendChild(winPopup);

    // Add event listeners for popup buttons
    document.getElementById('retry-btn').addEventListener('click', () => {
        location.reload();
    });

    document.getElementById('continue-btn').addEventListener('click', () => {
        winPopup.style.display = 'none';
    });

    // Create maze and add player
    sceneManager.createWalls(mazeConfig);
    sceneManager.scene.add(player.mesh);

    // Handle window resizing
    const handleResize = () => sceneManager.handleResize();
    window.addEventListener('resize', handleResize);

    // Animation function
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      
      player.update(mazeConfig.walls, delta);
      sceneManager.updateCameraPosition(player.mesh.position, player.rotation, delta);
      sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
    };

    // Start the animation loop
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.body.removeChild(winPopup);
    };
  }, []); // Empty dependency array means this effect runs once on mount
  
  return (
    <canvas ref={canvasRef} id="canvas" />
  );
}

export default App;
