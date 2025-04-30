import React from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import ReferenceText from './ReferenceText';

const RuleDisplay = ({ rule, showActions = true }) => {
  return (
    <div className={`${styles.cardDisplay} ${styles.ruleDisplay} ${styles[`rule${rule.type}`]} ${styles.cardItem}`}>
      <div className={styles.cardContent}>
        {/* Header section */}
        <div className={styles.ruleHeader}>
        <Link href={`/rules/${rule.id}`}><h2>{rule.name}</h2></Link>
          <div className={styles.ruleBadge}>{rule.type}</div>
        </div>
        
        {/* Description with references */}
        <div className={styles.cardDescription}>
          <ReferenceText text={rule.description} references={rule.references} />
        </div>
      </div>
    </div>
  );
};

export default RuleDisplay;