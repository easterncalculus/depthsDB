import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading rule details...</p>
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
        <title>{rule.name} | Rule Details</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <Link href="/rules">
          <span className="text-blue-500 hover:underline">← Back to Rules</span>
        </Link>
        <div className="space-x-2">
          <Link href={`/rules/${id}/edit`}>
            <span className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Edit
            </span>
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{rule.name}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {rule.type}
          </span>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{rule.description}</p>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Created: {new Date(rule.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(rule.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};