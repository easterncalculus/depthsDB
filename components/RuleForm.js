import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { RuleType } from '../types/rule';
import EnhancedReferenceAutocomplete from './EnhancedReferenceAutocomplete';
import styles from '../styles/Home.module.css';

const RuleForm = ({ initialRule, onSubmit }) => {
  const router = useRouter();
  const [rule, setRule] = useState({
    name: '',
    description: '',
    type: RuleType.GENERAL
  });
  const descriptionRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (initialRule) {
      setRule(initialRule);
    }
  }, [initialRule]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRule(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(rule);
      router.push('/rules');
    } catch (error) {
      console.error('Failed to save rule:', error);
      setError(error.message || 'Failed to save rule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Rule Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={rule.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="type">Rule Type:</label>
        <select
          id="type"
          name="type"
          value={rule.type}
          onChange={handleChange}
          required
        >
          {Object.values(RuleType).map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description">Description:</label>
        <div className={styles.textareaWrapper}>
          <textarea
            id="description"
            name="description"
            value={rule.description}
            onChange={handleChange}
            required
            rows={5}
            ref={descriptionRef}
            placeholder="Type # for card references or $ for rule references"
          />
          <EnhancedReferenceAutocomplete 
            textAreaRef={descriptionRef}
            onSelectReference={(reference) => {
              // Automatically update the form data when a reference is selected
              setRule(prev => ({
                ...prev,
                description: descriptionRef.current.value
              }));
            }}
          />
        </div>
        <small className={styles.formHelp}>
          You can reference cards with <code>#</code> and rules with <code>$</code> followed by text to search.
          Use arrow keys and Enter/Tab to select a reference. References are formatted as <code>&lt;#123|Card Name#&gt;</code> or <code>&lt;$456|Rule Name$&gt;</code>.
        </small>
      </div>
      
      <div className={styles.formGroup}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialRule ? 'Update Rule' : 'Create Rule')}
        </button>
      </div>
    </form>
  );
};

export default RuleForm;