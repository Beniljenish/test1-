import React from 'react';
import './Dashboard.css';
import Calendar from './Calendar/Calendar';
import Categories from './Categories/Categories';
import TaskList from './TaskList/TaskList';
import TimeTracking from './TimeTracking/TimeTracking';
import Comments from './Comments/Comments';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="left-column">
          <Calendar />
          <Categories />
        </div>

        <div className="center-column">
          <TaskList />
          <TimeTracking />
        </div>

        <div className="right-column">
          <Comments />
        </div>
      </div>
    </div>
  );
}
