import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color, subtitle, trend }) => {
  return (
    <div className="stats-card" style={{ '--card-color': color }}>
      <div className="stats-card-header">
        <div className="stats-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="stats-trend">
          {trend && (
            <span className={`trend-indicator ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-value">{value}</div>
        {subtitle && (
          <p className="stats-subtitle">{subtitle}</p>
        )}
      </div>
      
      <div className="stats-card-footer">
        <div className="stats-bar">
          <div 
            className="stats-bar-fill" 
            style={{ 
              backgroundColor: color,
              width: trend ? `${Math.min(Math.abs(trend), 100)}%` : '100%'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
