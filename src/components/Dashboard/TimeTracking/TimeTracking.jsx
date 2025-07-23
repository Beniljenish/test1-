import React, { useState } from 'react';
import { useTask } from '../../../context/TaskContext';
import './TimeTracking.css';

const TimeTracking = () => {
  const { trackingItems } = useTask();
  const [activeTimer, setActiveTimer] = useState(trackingItems.find(item => item.isActive)?.id || null);

  const toggleTimer = (itemId) => {
    setActiveTimer(activeTimer === itemId ? null : itemId);
  };

  return (
    <div className="time-tracking">
      <div className="time-tracking-header">
        <h3>My tracking</h3>
        <button className="more-btn">⋯</button>
      </div>

      <div className="tracking-items">
        {trackingItems.map(item => (
          <div key={item.id} className="tracking-item">
            <div className="tracking-info">
              <button 
                className={`play-btn ${activeTimer === item.id ? 'active' : ''}`}
                onClick={() => toggleTimer(item.id)}
              >
                {activeTimer === item.id ? '⏸' : '▶'}
              </button>
              <span className="tracking-title">{item.title}</span>
            </div>

            <div className="tracking-time">
              <span className="time-display">{item.time}</span>
              <button className="more-options">⋯</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeTracking;