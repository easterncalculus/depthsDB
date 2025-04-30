import Head from 'next/head';
import Link from 'next/link';
import RuleForm from '../../components/RuleForm';
import styles from '../../styles/Home.module.css';

export default function CreateRulePage() {
  const handleCreateRule = async (ruleData) => {
    const response = await fetch('/api/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ruleData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create rule');
    }
    
    return await response.json();
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Create New Rule | DepthsDB</title>
        <meta name="description" content="Add a new rule to the database" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Create New Rule</h1>
        
        <div className={styles.grid}>
          <Link href="/rules" className={styles.card}>
            <h2>&larr; Back to Rules Library</h2>
          </Link>
        </div>

        <RuleForm onSubmit={handleCreateRule} />
      </main>
    </div>
  );
}