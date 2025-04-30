import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import RuleDisplay from '../../components/RuleDisplay';
import SearchBar from '../../components/SearchBar';
import styles from '../../styles/Home.module.css';
import { RuleType } from '../../types/rule';

export default function RulesPage() {
  const router = useRouter();
  const { type: initialType, search: initialSearch } = router.query;
  
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedType, setSelectedType] = useState(initialType || 'all');
  
  // Fetch rules whenever filters change
  useEffect(() => {
    const fetchRules = async () => {
      if (!router.isReady) return;
      
      setLoading(true);
      
      try {
        // Build the query string for filtering
        const params = new URLSearchParams();
        if (selectedType && selectedType !== 'all') {
          params.append('type', selectedType);
        }
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const response = await fetch(`/api/rules${queryString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch rules');
        }
        
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error('Error fetching rules:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
  }, [router.isReady, selectedType, searchTerm]);
  
  // Update URL when filters change
  useEffect(() => {
    if (!router.isReady) return;
    
    const params = new URLSearchParams();
    if (selectedType && selectedType !== 'all') {
      params.append('type', selectedType);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Replace URL without reloading the page
    router.replace(`/rules${queryString}`, undefined, { shallow: true });
  }, [selectedType, searchTerm, router.isReady]);
  
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };
  
  // Group rules by type for display
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
  
  const groupedRules = groupRulesByType();
  
  // Generate page title based on filters
  const getPageTitle = () => {
    let title = 'Game Rules';
    
    if (selectedType && selectedType !== 'all') {
      title = `${selectedType} Rules`;
    }
    
    if (searchTerm) {
      title += ` matching "${searchTerm}"`;
    }
    
    return title;
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{getPageTitle()} | DepthsDB</title>
        <meta name="description" content={`Browse ${getPageTitle().toLowerCase()} in the database`} />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>{getPageTitle()}</h1>
        
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Back to Home
          </Link>
          <Link href="/rules/create" className={styles.button}>
            Add New Rule
          </Link>
        </div>
        
        {/* Search and Filters */}
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search by rule name..."
        />
        
        <div className={styles.filterGroup} style={{ width: '100%', maxWidth: '600px' }}>
          <label htmlFor="typeFilter">Filter by Rule Type:</label>
          <select
            id="typeFilter"
            value={selectedType}
            onChange={handleTypeChange}
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
        ) : error ? (
          <div className={styles.error}>Error: {error}</div>
        ) : rules.length === 0 ? (
          <div className={styles.description}>
            <p>No rules found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.indexContainer}>
            {Object.entries(groupedRules).map(([type, typeRules]) => (
              <div key={type} className={styles.sectionContainer}>
                <h2 className={styles.sectionTitle}>{type} Rules</h2>
                <div className={styles.cardGrid}>
                  {typeRules.map(rule => (
                    <div key={rule.id} >
                      <RuleDisplay rule={rule} showActions={true} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}