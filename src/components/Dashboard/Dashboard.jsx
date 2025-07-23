import React from 'react';
import Layout from '../Layout/Layout';
import Calendar from './Calendar/Calendar';
import TaskList from './TaskList/TaskList';
import Categories from './Categories/Categories';
import TimeTracking from './TimeTracking/TimeTracking';
import Comments from './Comments/Comments';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-main">
          <div className="dashboard-left">
            <Calendar />
            <Categories />
          </div>

          <div className="dashboard-center">
            <TaskList />
          </div>

          <div className="dashboard-right">
            <TimeTracking />
            <Comments />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;