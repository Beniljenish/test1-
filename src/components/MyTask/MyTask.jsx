import React from 'react';
import { useTask } from '../../context/TaskContext';
import { useNavigate } from 'react-router-dom';
import './MyTask.css';

const MyTask = () => {
  const { tasks } = useTask();
  const navigate = useNavigate();

  // Function to determine which section a date belongs to
  const getDateSection = (dateString) => {
    if (!dateString) return 'Next Month';
    
    const taskDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    // Calculate time differences
    const timeDiff = taskDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff === 0) {
      return 'Today';
    } else if (daysDiff === 1) {
      return 'Tomorrow';
    } else if (daysDiff > 1 && daysDiff <= 7) {
      return 'Next Week';
    } else {
      return 'Next Month';
    }
  };

  // Transform tasks to match MyTask format
  const transformedTasks = tasks.map(task => ({
    id: task.id,
    section: getDateSection(task.dueDate),
    title: task.title,
    stage: task.stage,
    priority: task.priority || 'medium',
    due: task.dueDate,
    team: task.team || 'Development',
    avatar: task.avatar || 'https://randomuser.me/api/portraits/men/30.jpg',
  }));

  const groupBySection = (tasks) => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.section]) acc[task.section] = [];
      acc[task.section].push(task);
      return acc;
    }, {});
  };

  // Define section order for consistent display
  const sectionOrder = ['Today', 'Tomorrow', 'Next Week', 'Next Month'];

  const grouped = groupBySection(transformedTasks);

  const handleTitleClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="task-page-wrapper">
      <div className="tasks-wrapper">
        {sectionOrder.map(section => {
          // Only render sections that have tasks
          if (!grouped[section] || grouped[section].length === 0) return null;
          
          return (
            <div key={section} className="tasks-section">
              <h3>{section}</h3>
              <div className="row head">
                <div></div>
                <div className="title">{section}</div>
                <div>Due Date</div>
                <div>Stage</div>
                <div>Priority</div>
                <div>Team</div>
                <div>Assignee</div>
              </div>
              {grouped[section].map(task => (
                <div key={task.id} className="row">
                  <input type="checkbox" />
                  <div 
                    className="title clickable" 
                    onClick={() => handleTitleClick(task.id)}
                  >
                    {task.title}
                  </div>
                  <div className="due">{task.due}</div>
                  <div className={`badge stage ${task.stage}`}>{task.stage.replace('-', ' ')}</div>
                  <div className={`badge priority ${task.priority}`}>{task.priority}</div>
                  <div className="team">{task.team}</div>
                  <img src={task.avatar} alt="avatar" className="avatar" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTask;
