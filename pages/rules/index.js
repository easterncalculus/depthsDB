import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RuleDisplay from '../../components/RuleDisplay';
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
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Game Rules</title>
      </Head>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Game Rules</h1>
        <Link href="/rules/create">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add New Rule
          </span>
        </Link>
      </div>
      
      <div className="mb-6">
        <label htmlFor="typeFilter" className="block mb-2 text-sm font-medium text-gray-700">
          Filter by Rule Type:
        </label>
        <select
          id="typeFilter"
          value={selectedType}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
        <div className="text-center py-8">
          <p>Loading rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8">
          <p>No rules found. Create some rules to get started!</p>
        </div>
      ) : (
        Object.entries(groupedRules).map(([type, rules]) => (
          <div key={type} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{type} Rules</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rules.map(rule => (
                <RuleDisplay key={rule.id} rule={rule} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};