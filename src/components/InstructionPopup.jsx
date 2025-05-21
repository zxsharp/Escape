import { useEffect, useState } from 'react';

const InstructionPopup = () => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);   
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`instruction-popup ${visible ? 'visible' : ''}`}>
      <div className="icon">↔️</div>
      <div className="title">Camera Controls</div>
      <div className="message">
        Drag with your {window.innerWidth <= 768 ? 'finger' : 'mouse'} to look around the maze
      </div>
    </div>
  );
};

export default InstructionPopup;
