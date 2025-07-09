import React, { useState, useEffect } from 'react';
import styles from '../styles/ModeSelector.module.css';

const ModeSelector = ({ selectedMode, onModeChange }) => {
  const [modeProfiles, setModeProfiles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModeProfiles = async () => {
      try {
        const profiles = await import('../checklists/mode_profiles.json');
        setModeProfiles(profiles.default || profiles);
      } catch (error) {
        console.error('Error loading mode profiles:', error);
        // Fallback to default profiles
        setModeProfiles({
          mode_profiles: {
            blueprint_logic: {
              name: "Blueprint Logic",
              description: "Structured approach for business planning",
              icon: "🏗️",
              color: "#3498db"
            },
            search_prep: {
              name: "Search Preparation", 
              description: "Job search and career transition",
              icon: "🔍",
              color: "#e74c3c"
            }
          },
          default_mode: "blueprint_logic"
        });
      } finally {
        setLoading(false);
      }
    };

    loadModeProfiles();
  }, []);

  if (loading) {
    return (
      <div className={styles.modeSelector}>
        <div className={styles.loading}>Loading mode profiles...</div>
      </div>
    );
  }

  const { mode_profiles, mode_metadata } = modeProfiles;

  return (
    <div className={styles.modeSelector}>
      <h3>🎛️ Select Your Approach Mode</h3>
      <p>Choose the methodology that best fits your goals:</p>
      
      <div className={styles.modeGrid}>
        {Object.entries(mode_profiles).map(([modeId, profile]) => {
          const metadata = mode_metadata?.[modeId] || {};
          const isSelected = selectedMode === modeId;
          
          return (
            <div
              key={modeId}
              className={`${styles.modeCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => onModeChange(modeId)}
              style={{ 
                '--mode-color': metadata.color || profile.color || '#3498db',
                borderColor: isSelected ? (metadata.color || profile.color || '#3498db') : '#e1e5e9'
              }}
            >
              <div className={styles.modeHeader}>
                <div className={styles.modeIcon}>{metadata.icon || profile.icon || '🎯'}</div>
                <div className={styles.modeContent}>
                  <h4>{profile.name}</h4>
                  <p>{profile.description}</p>
                </div>
                {isSelected && (
                  <div className={styles.selectedIndicator}>✓</div>
                )}
              </div>
              
              {metadata.tags && (
                <div className={styles.modeTags}>
                  {metadata.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={styles.modeInfo}>
        <p>
          <strong>Current Mode:</strong> {mode_profiles[selectedMode]?.name || 'Blueprint Logic'}
        </p>
        <p className={styles.modeDescription}>
          {mode_profiles[selectedMode]?.description || 'Structured approach for business planning and strategy development'}
        </p>
      </div>
    </div>
  );
};

export default ModeSelector; 