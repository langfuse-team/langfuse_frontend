import React from 'react';

const  TotalMetric = ({
  className = '',
  metric,
  description,
  children
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'baseline',
        gap: '8px',
        animation: 'fadeIn 0.3s ease-in'
      }}
      className={className}
    >
      {/* Metric - 큰 숫자 */}
      <div style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: '1'
      }}>
        {metric}
      </div>
      
      {/* Description - 작은 설명 텍스트 */}
      {description && (
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          lineHeight: '1.25'
        }}>
          {description}
        </div>
      )}
      
      {/* Children - 추가 요소들 */}
      {children}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default TotalMetric;