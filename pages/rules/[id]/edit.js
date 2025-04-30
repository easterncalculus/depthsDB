import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import RuleForm from '../../../components/RuleForm';

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
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading rule...</p>
      </div>
    );
  }
  
  if (error || !rule) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Error: {error || 'Rule not found'}</p>
        <Link href="/rules">
          <span className="text-blue-500 hover:underline">Back to Rules</span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Edit Rule | {rule.name}</title>
      </Head>
      
      <div className="mb-6">
        <Link href={`/rules/${id}`}>
          <span className="text-blue-500 hover:underline">← Back to Rule Details</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Edit Rule: {rule.name}</h1>
      
      <RuleForm initialRule={rule} onSubmit={handleUpdateRule} />
    </div>
  );
};