import React from 'react';
import './MyTask.css';

const tasks = [
  {
    id: 1,
    section: 'Today',
    title: "Finish monthly reporting",
    stage: 'in-progress',
    priority: 'high',
    due: 'Today',
    team: 'Marketing 02',
    avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
  },
  {
    id: 2,
    section: 'Today',
    title: "Contract signing",
    stage: 'in-progress',
    priority: 'medium',
    due: 'Today',
    team: 'Operations',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
  {
    id: 3,
    section: 'Today',
    title: "Market overview keynote",
    stage: 'in-progress',
    priority: 'high',
    due: 'Today',
    team: 'Customer Care',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 4,
    section: 'Tomorrow',
    title: "Brand proposal",
    stage: 'not-started',
    priority: 'high',
    due: 'Tomorrow',
    team: 'Marketing 02',
    avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
  },
  {
    id: 5,
    section: 'Tomorrow',
    title: "Social media review",
    stage: 'in-progress',
    priority: 'medium',
    due: 'Tomorrow',
    team: 'Operations',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
  {
    id: 6,
    section: 'Tomorrow',
    title: "Report – Week 30",
    stage: 'not-started',
    priority: 'low',
    due: 'Tomorrow',
    team: 'Operations',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 7,
    section: 'This week',
    title: "Order check-ins",
    stage: 'in-progress',
    priority: 'medium',
    due: 'Wednesday',
    team: 'Retails',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
  },
  {
    id: 8,
    section: 'This week',
    title: "HR reviews",
    stage: 'not-started',
    priority: 'medium',
    due: 'Wednesday',
    team: 'People',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    id: 9,
    section: 'This week',
    title: "Report – Week 30",
    stage: 'not-started',
    priority: 'low',
    due: 'Friday',
    team: 'Development',
    avatar: 'https://randomuser.me/api/portraits/men/48.jpg',
  },
];

const groupBySection = (tasks) => {
  return tasks.reduce((acc, task) => {
    if (!acc[task.section]) acc[task.section] = [];
    acc[task.section].push(task);
    return acc;
  }, {});
};

const MyTask = () => {
  const grouped = groupBySection(tasks);

  return (
    <div className="task-page-wrapper">
      <div className="tasks-wrapper">
        {Object.keys(grouped).map(section => (
          <div key={section} className="tasks-section">
            <h3>{section}</h3>
            <div className="row head">
              <div></div>
              <div className="title">Title</div>
              <div>Due Date</div>
              <div>Stage</div>
              <div>Priority</div>
              <div>Team</div>
              <div>Assignee</div>
            </div>
            {grouped[section].map(task => (
              <div key={task.id} className="row">
                <input type="checkbox" />
                <div className="title">{task.title}</div>
                <div className="due">{task.due}</div>
                <div className={`badge stage ${task.stage}`}>{task.stage.replace('-', ' ')}</div>
                <div className={`badge priority ${task.priority}`}>{task.priority}</div>
                <div className="team">{task.team}</div>
                <img src={task.avatar} alt="avatar" className="avatar" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTask;
