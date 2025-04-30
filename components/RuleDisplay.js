import React from 'react';
import Link from 'next/link';
import ReferenceText from './ReferenceText';

const RuleDisplay = ({ rule }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm mb-4 bg-white">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold mb-2">{rule.name}</h2>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {rule.type}
        </span>
      </div>
      
      <div className="text-gray-700 mb-4">
        <ReferenceText text={rule.description} references={rule.references} />
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-500">
          Reference ID: #r{rule.id}
        </div>
        <div className="flex space-x-2">
          <Link href={`/rules/${rule.id}`}>
            <span className="text-blue-500 hover:text-blue-700">View</span>
          </Link>
          <Link href={`/rules/${rule.id}/edit`}>
            <span className="text-green-500 hover:text-green-700">Edit</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RuleDisplay;