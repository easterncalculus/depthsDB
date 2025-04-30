import React from 'react';
import Head from 'next/head';
import RuleForm from '../../components/RuleForm';

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
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Create New Rule</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-8">Create New Rule</h1>
      
      <RuleForm onSubmit={handleCreateRule} />
    </div>
  );
};