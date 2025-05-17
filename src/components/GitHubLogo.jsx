import React from 'react';

const GitHubLogo = ({ className = '' }) => {
  return (
    <div className={`github-logo ${className}`}>
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Maze outline */}
        <rect x="10" y="10" width="80" height="80" rx="5" fill="#0D1117" stroke="#30363D" strokeWidth="2"/>
        
        {/* Maze inner paths */}
        <path d="M25 25H75" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        <path d="M25 40H60" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        <path d="M60 40V55" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        <path d="M25 55H60" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        <path d="M25 25V70" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 70H75" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 55V70" stroke="#30363D" strokeWidth="3" strokeLinecap="round"/>
        
        {/* Start point */}
        <circle cx="17.5" cy="17.5" r="5" fill="#58A6FF"/>
        
        {/* End point */}
        <circle cx="82.5" cy="82.5" r="5" fill="#F85149"/>
        
        {/* Player (GitHub Octocat-inspired) */}
        <circle cx="45" cy="45" r="7" fill="#58A6FF"/>
        <path d="M42 42L48 48" stroke="#C9D1D9" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M48 42L42 48" stroke="#C9D1D9" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <div className="logo-text">Escape The Maze</div>
    </div>
  );
};

export default GitHubLogo;
