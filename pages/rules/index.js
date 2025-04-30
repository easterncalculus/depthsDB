import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RuleDisplay from '../../components/RuleDisplay';
import styles from '../../styles/Home.module.css';
import { RuleType } from '../../types/rule';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const url = selectedType === 'all' 
          ? '/api/rules' 
          : `/api/rules?type=${selectedType}`;
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch rules');
        }
        
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error('Error fetching rules:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
  }, [selectedType]);
  
  const groupRulesByType = () => {
    if (selectedType !== 'all') {
      return { [selectedType]: rules };
    }
    
    return rules.reduce((groups, rule) => {
      const type = rule.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(rule);
      return groups;
    }, {});
  };
  
  const handleFilterChange = (e) => {
    setSelectedType(e.target.value);
  };
  
  const groupedRules = groupRulesByType();
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Game Rules | DepthsDB</title>
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Game Rules</h1>
        
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Back to Home
          </Link>
          <Link href="/rules/create" className={styles.button}>
            Add New Rule
          </Link>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="typeFilter">Filter by Rule Type:</label>
          <select
            id="typeFilter"
            value={selectedType}
            onChange={handleFilterChange}
            className={styles.select}
          >
            <option value="all">All Types</option>
            {Object.values(RuleType).map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <div className={styles.loading}>Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className={styles.description}>
            <p>No rules found. Create some rules to get started!</p>
          </div>
        ) : (
          <div className={styles.indexContainer}>
            {Object.entries(groupedRules).map(([type, typeRules]) => (
              <div key={type} className={styles.sectionContainer}>
                <h2 className={styles.sectionTitle}>{type} Rules</h2>
                <div className={styles.cardGrid}>
                  {typeRules.map(rule => (
                    // <Link href={`/rules/${rule.id}`} key={rule.id} className={styles.card}>
                      <RuleDisplay rule={rule} showActions={true} />
                      /* <h3>{rule.name}</h3>
                      <p className={styles.descriptionCell}>
                        {rule.description.substring(0, 120)}
                        {rule.description.length > 120 ? '...' : ''}
                      </p>
                      <div className={styles.cardMeta}>
                        <span>Type: {rule.type}</span>
                      </div> */
                    // </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};