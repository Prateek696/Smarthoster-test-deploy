import React from 'react';

const Expenses: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Expenses</h1>
          <p className="text-gray-600">Expenses management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Expenses;