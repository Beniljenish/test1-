import React from 'react';
import { useTask } from '../../../context/TaskContext';
import Avatar from '../../common/Avatar/Avatar';
import './Categories.css';

const Categories = () => {
  const { categories } = useTask();

  return (
    <div className="categories-widget">
      <div className="categories-header">
        <h3>My categories</h3>
        <button className="more-btn">⋯</button>
      </div>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category-item">
            <div className="category-info">
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                <span>📁</span>
              </div>
              <div className="category-details">
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.count})</span>
              </div>
            </div>

            <div className="category-members">
              {category.members.map((member, index) => (
                <Avatar
                  key={index}
                  size="small"
                  emoji={member.avatar}
                  className="member-avatar"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="add-more-btn">
        + Add more
      </button>
    </div>
  );
};

export default Categories;