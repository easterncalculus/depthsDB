import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import RuleForm from '../../../components/RuleForm';
import styles from '../../../styles/Home.module.css';

export default function EditRulePage() {
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
  
  const handleUpdateRule = async (ruleData) => {
    const response = await fetch(`/api/rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ruleData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update rule');
    }
    
    return await response.json();
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <p>Loading rule...</p>
        </div>
      </div>
    );
  }
  
  if (error || !rule) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <p className={styles.error}>Error: {error || 'Rule not found'}</p>
          <Link href="/rules" className={styles.button}>
            Back to Rules
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Edit Rule: {rule.name} | DepthsDB</title>
        <meta name="description" content={`Edit rule: ${rule.name}`} />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Edit Rule</h1>
        
        <div className={styles.grid}>
          <Link href={`/rules/${id}`} className={styles.card}>
            <h2>&larr; Back to Rule Details</h2>
          </Link>
        </div>

        <RuleForm initialRule={rule} onSubmit={handleUpdateRule} />
      </main>
    </div>
  );
}