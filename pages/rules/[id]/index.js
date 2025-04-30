import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../../styles/Home.module.css';
import RuleDisplay from '../../../components/RuleDisplay';

export default function RuleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchRule = async () => {
      try {
        const response = await fetch(`/api/rules/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch rule');
        }
        
        const data = await response.json();
        setRule(data);
      } catch (error) {
        console.error('Error fetching rule:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRule();
  }, [id]);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete rule');
      }
      
      router.push('/rules');
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading rule details...</p>
      </div>
    );
  }
  
  if (error || !rule) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Error: {error || 'Rule not found'}</p>
        <Link href="/rules" className={styles.button}>
          Back to Rules
        </Link>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{rule.name} | Rule Details</title>
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>{rule.name}</h1>
        
        <div className={styles.actions}>
          <Link href="/rules" className={styles.button}>
            Back to Rules
          </Link>
          <Link href={`/rules/${id}/edit`} className={styles.button}>
            Edit Rule
          </Link>
          <button 
            onClick={handleDelete} 
            className={styles.deleteButton}
          >
            Delete Rule
          </button>
        </div>
        
        <div className={styles.cardDetailContainer}>
          <RuleDisplay rule={rule} />
          
          <div className={styles.metadata}>
            <div>Created: {new Date(rule.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(rule.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </main>
    </div>
  );
};