import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

const CalendarWidget = () => {
  const [value, setValue] = useState(new Date());

  return (
    <div className="calendar-widget">
      <div className="calendar-container">
        <Calendar
          onChange={setValue}
          value={value}
          nextLabel="›"
          prevLabel="‹"
          formatShortWeekday={(locale, date) =>
            ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][date.getDay()]
          }
        />
      </div>
    </div>
  );
};

export default CalendarWidget;
