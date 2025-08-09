import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';
import './TaskCreate.css';

const TaskCreate = ({ isOpen, onClose }) => {
  const { addTask } = useTask();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    dueDate: 'Today',
    notification: 'In 1 hour',
    priority: '',
    tags: '',
    assignee: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      addTask({
        title: formData.title,
        dueDate: formData.dueDate,
        stage: 'not-started',
        priority: formData.priority || 'medium',
        description: formData.description
      });
      
      // Reset form
      setFormData({
        title: '',
        dueDate: 'Today',
        notification: 'In 1 hour',
        priority: '',
        tags: '',
        assignee: '',
        description: ''
      });
      
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const selectedDate = new Date(date);
    
    if (selectedDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (selectedDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const options = { month: 'short', day: 'numeric' };
      return selectedDate.toLocaleDateString('en-US', options);
    }
  };

  const generateCalendar = () => {
    const currentMonth = calendarDate.getMonth();
    const currentYear = calendarDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const navigateCalendar = (direction) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateSelect = (date) => {
    const formattedDate = formatDate(date);
    handleChange('dueDate', formattedDate);
    setShowCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="task-create-overlay" onClick={onClose}>
      <div className="task-create-modal" onClick={e => e.stopPropagation()}>
        <div className="task-create-header">
          <h2>Name of task</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-create-form">
          <input
            type="text"
            className="task-title-input"
            placeholder="Name of task"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            autoFocus
          />

          <div className="form-row">
            <div className="form-field">
              <span className="field-icon">🕐</span>
              <span className="field-label">Day</span>
              <div className="field-options">
                <button
                  type="button"
                  className={`option-btn ${formData.dueDate === 'Today' ? 'active' : ''}`}
                  onClick={() => handleChange('dueDate', 'Today')}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`option-btn ${formData.dueDate === 'Tomorrow' ? 'active' : ''}`}
                  onClick={() => handleChange('dueDate', 'Tomorrow')}
                >
                  Tomorrow
                </button>
                <button 
                  type="button" 
                  className="calendar-btn"
                  onClick={() => setShowCalendar(!showCalendar)}
                  title="Choose date"
                >
                  📅
                </button>
              </div>
              
              {showCalendar && (
                <div className="mini-calendar">
                  <div className="mini-calendar-header">
                    <button 
                      type="button" 
                      className="mini-nav-btn"
                      onClick={() => navigateCalendar(-1)}
                    >
                      ‹
                    </button>
                    <span className="mini-month-year">
                      {calendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button 
                      type="button" 
                      className="mini-nav-btn"
                      onClick={() => navigateCalendar(1)}
                    >
                      ›
                    </button>
                  </div>
                  <div className="mini-calendar-grid">
                    <div className="mini-weekdays">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={index} className="mini-weekday">{day}</div>
                      ))}
                    </div>
                    <div className="mini-days">
                      {generateCalendar().map((date, index) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
                        const isSelected = formData.dueDate === formatDate(date);
                        return (
                          <button
                            key={index}
                            type="button"
                            className={`mini-day ${isToday ? 'mini-today' : ''} ${!isCurrentMonth ? 'mini-other-month' : ''} ${isSelected ? 'mini-selected' : ''}`}
                            onClick={() => handleDateSelect(date)}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <span className="field-icon">🔔</span>
              <span className="field-label">Notification</span>
              <div className="field-options">
                <button
                  type="button"
                  className={`option-btn ${formData.notification === 'In 1 hour' ? 'active' : ''}`}
                  onClick={() => handleChange('notification', 'In 1 hour')}
                >
                  In 1 hour
                </button>
                <button type="button" className="add-btn">+</button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <span className="field-icon">📍</span>
              <span className="field-label">Priority</span>
              <div className="field-options">
                {!formData.priority ? (
                  <button 
                    type="button" 
                    className="add-btn" 
                    onClick={() => setShowPriority(!showPriority)}
                  >
                    + Add priority
                  </button>
                ) : (
                  <div className="priority-options">
                    <button
                      type="button"
                      className={`option-btn priority-high ${formData.priority === 'high' ? 'active' : ''}`}
                      onClick={() => handleChange('priority', 'high')}
                    >
                      High
                    </button>
                    <button
                      type="button"
                      className={`option-btn priority-medium ${formData.priority === 'medium' ? 'active' : ''}`}
                      onClick={() => handleChange('priority', 'medium')}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className={`option-btn priority-low ${formData.priority === 'low' ? 'active' : ''}`}
                      onClick={() => handleChange('priority', 'low')}
                    >
                      Low
                    </button>
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => handleChange('priority', '')}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {showPriority && !formData.priority && (
              <div className="priority-dropdown">
                <button
                  type="button"
                  className="priority-option high"
                  onClick={() => {
                    handleChange('priority', 'high');
                    setShowPriority(false);
                  }}
                >
                  High
                </button>
                <button
                  type="button"
                  className="priority-option medium"
                  onClick={() => {
                    handleChange('priority', 'medium');
                    setShowPriority(false);
                  }}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className="priority-option low"
                  onClick={() => {
                    handleChange('priority', 'low');
                    setShowPriority(false);
                  }}
                >
                  Low
                </button>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-field">
              <span className="field-icon">🏷️</span>
              <span className="field-label">Tags</span>
              <div className="field-options">
                <button type="button" className="add-btn">+ Add tags</button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <span className="field-icon">👤</span>
              <span className="field-label">Assign</span>
              <div className="field-options">
                <button type="button" className="add-btn">+ Add assignee</button>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <textarea
              className="description-input"
              placeholder="Add description..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="create-task-btn">
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreate;
