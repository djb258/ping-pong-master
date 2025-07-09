import React from 'react';
import styles from '../styles/TemplateSelector.module.css';

const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
  const templates = [
    {
      id: 'career',
      name: 'Career Development',
      description: 'For exploring career paths, job transitions, and professional growth',
      icon: '💼'
    },
    {
      id: 'business',
      name: 'Business Development',
      description: 'For exploring business ideas, startups, and entrepreneurial ventures',
      icon: '🚀'
    },
    {
      id: 'tech',
      name: 'Technology Development',
      description: 'For exploring software projects, apps, and technology solutions',
      icon: '💻'
    },
    {
      id: 'creative',
      name: 'Creative Development',
      description: 'For exploring creative projects, content creation, and artistic endeavors',
      icon: '🎨'
    },
    {
      id: 'learning',
      name: 'Learning Development',
      description: 'For exploring learning goals, skill development, and educational projects',
      icon: '📚'
    },
    {
      id: 'personal',
      name: 'Personal Development',
      description: 'For exploring personal goals, life changes, and self-improvement projects',
      icon: '🌟'
    }
  ];

  return (
    <div className={styles.templateSelector}>
      <h3>Choose Your Focus Area</h3>
      <p>Select the type of project you want to explore:</p>
      
      <div className={styles.templateGrid}>
        {templates.map((template) => (
          <div
            key={template.id}
            className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.selected : ''}`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className={styles.templateIcon}>{template.icon}</div>
            <div className={styles.templateContent}>
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div className={styles.selectedIndicator}>✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector; 