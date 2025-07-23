import React, { useState } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getCurrentMonth = () => {
    return months[currentDate.getMonth()];
  };

  const getCurrentYear = () => {
    return currentDate.getFullYear();
  };

  const getDaysInMonth = () => {
    const year = getCurrentYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate;
  };

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(-1)}
        >
          ←
        </button>
        <h3>{getCurrentMonth()} {getCurrentYear()}</h3>
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(1)}
        >
          →
        </button>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {getDaysInMonth().map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day ? 'calendar-day-active' : ''} ${
              day && isToday(day) ? 'today' : ''
            } ${day && isSelected(day) ? 'selected' : ''}`}
            onClick={() => day && setSelectedDate(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;