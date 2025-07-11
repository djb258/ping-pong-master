import React from 'react';
import styles from '../styles/ChecklistGuardrail.module.css';
import { withComponentErrorHandling } from '../utils/errorHandler.js';

const ChecklistGuardrail = withComponentErrorHandling(({ 
  checklist, 
  onToggleCheck, 
  promotionStatus, 
  onAcceptAllLLM, 
  onResetChecks 
}) => {
  if (!checklist) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading checklist...</div>
      </div>
    );
  }

  const { checklist_items, name, description } = checklist;
  const { ready, checked, required, percentage } = promotionStatus;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{name} Guardrails</h3>
          <p className={styles.description}>{description}</p>
        </div>
        
        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${ready ? styles.complete : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {checked} / {required} items checked ({percentage}%)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button 
          onClick={onAcceptAllLLM}
          className={styles.actionButton}
          title="Accept all LLM recommendations"
        >
          Accept LLM Suggestions
        </button>
        <button 
          onClick={onResetChecks}
          className={`${styles.actionButton} ${styles.resetButton}`}
          title="Reset all user checks"
        >
          Reset All
        </button>
      </div>

      {/* Checklist Items */}
      <div className={styles.checklistItems}>
        {checklist_items.map((item) => (
          <ChecklistItem 
            key={item.id}
            item={item}
            onToggle={onToggleCheck}
          />
        ))}
      </div>

      {/* Promotion Status */}
      <div className={`${styles.promotionStatus} ${ready ? styles.ready : styles.notReady}`}>
        <div className={styles.statusIcon}>
          {ready ? '✅' : '⏳'}
        </div>
        <div className={styles.statusText}>
          {ready 
            ? 'Ready to promote to next level!' 
            : `${required - checked} more items needed to promote`
          }
        </div>
      </div>
    </div>
  );
});

const ChecklistItem = ({ item, onToggle }) => {
  const { id, label, description, llm_checked, llm_reason, user_checked, category } = item;
  
  const isLlmAgreement = llm_checked === user_checked;
  const hasLlmReason = llm_reason && llm_reason.trim().length > 0;

  return (
    <div className={`${styles.checklistItem} ${user_checked ? styles.checked : ''}`}>
      {/* Checkbox */}
      <div className={styles.checkboxSection}>
        <input
          type="checkbox"
          id={id}
          checked={user_checked}
          onChange={() => onToggle(id)}
          className={styles.checkbox}
        />
        <label htmlFor={id} className={styles.checkboxLabel}>
          {label}
        </label>
      </div>

      {/* Description */}
      <div className={styles.itemDescription}>
        {description}
      </div>

      {/* LLM Evaluation */}
      <div className={styles.llmSection}>
        <div className={styles.llmIndicator}>
          <span className={`${styles.llmStatus} ${llm_checked ? styles.llmChecked : styles.llmUnchecked}`}>
            {llm_checked ? '✓' : '✗'} LLM
          </span>
          {!isLlmAgreement && (
            <span className={styles.disagreement}>
              {user_checked ? 'You disagreed' : 'You agreed'}
            </span>
          )}
        </div>
        
        {hasLlmReason && (
          <div className={styles.llmReason}>
            <strong>LLM Reasoning:</strong> {llm_reason}
          </div>
        )}
      </div>

      {/* Category Tag */}
      <div className={styles.categoryTag}>
        {category}
      </div>
    </div>
  );
};

export default ChecklistGuardrail; 