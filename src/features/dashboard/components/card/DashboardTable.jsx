import React, { useState } from 'react';
import { NoDataOrLoading } from '../NoDataOrLoading';

/**
 * 확장/축소 버튼 컴포넌트 (ChevronButton 대체)
 */
function ExpandListButton({ 
  isExpanded, 
  setExpanded, 
  totalLength, 
  maxLength, 
  expandText 
}) {
  const handleToggle = () => {
    setExpanded(!isExpanded);
  };

  if (totalLength <= maxLength) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: '12px'
    }}>
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 12px',
          border: '1px solid #e5e7eb',
          backgroundColor: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}
      >
        {isExpanded ? (
          <>
            Show less
            <span style={{ fontSize: '10px' }}>▲</span>
          </>
        ) : (
          <>
            {expandText} ({totalLength - maxLength} more)
            <span style={{ fontSize: '10px' }}>▼</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * 대시보드 테이블 컴포넌트 (범용 테이블)
 * @param {Object} props
 * @param {Array} props.headers - 테이블 헤더 배열
 * @param {Array[]} props.rows - 테이블 행 데이터 (2차원 배열)
 * @param {React.ReactNode} props.children - 테이블 위에 표시할 추가 내용
 * @param {Object} props.collapse - 확장/축소 설정
 * @param {number} props.collapse.collapsed - 축소 시 표시할 행 수
 * @param {number} props.collapse.expanded - 확장 시 표시할 행 수
 * @param {Object} props.noDataProps - 데이터 없을 때 설정
 * @param {string} props.noDataProps.description - 설명 텍스트
 * @param {string} props.noDataProps.href - 도움말 링크
 * @param {boolean} props.isLoading - 로딩 상태
 */
export const DashboardTable = ({
  headers,
  rows,
  children,
  collapse,
  noDataProps,
  isLoading = false,
}) => {
  const [isExpanded, setExpanded] = useState(false);

  // 표시할 행 수 계산
  const displayRows = collapse 
    ? rows.slice(0, isExpanded ? collapse.expanded : collapse.collapsed)
    : rows;

  return (
    <>
      {children}
      
      {rows.length > 0 ? (
        <div style={{ marginTop: '16px' }}>
          {/* 테이블 컨테이너 */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ 
              display: 'inline-block', 
              minWidth: '100%', 
              verticalAlign: 'middle' 
            }}>
              <table style={{
                minWidth: '100%',
                borderCollapse: 'collapse',
                borderSpacing: 0
              }}>
                {/* 헤더 */}
                <thead>
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        style={{
                          whiteSpace: 'nowrap',
                          paddingTop: '14px',
                          paddingBottom: '14px',
                          paddingLeft: i === 0 ? '16px' : '12px',
                          paddingRight: '12px',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          borderBottom: '1px solid #e5e7eb'
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* 바디 */}
                <tbody style={{
                  backgroundColor: 'white'
                }}>
                  {displayRows.map((row, i) => (
                    <tr 
                      key={i}
                      style={{
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          style={{
                            whiteSpace: 'nowrap',
                            paddingTop: '8px',
                            paddingBottom: '8px',
                            paddingLeft: j === 0 ? '16px' : '12px',
                            paddingRight: '8px',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 확장/축소 버튼 */}
          {collapse && (
            <ExpandListButton
              isExpanded={isExpanded}
              setExpanded={setExpanded}
              totalLength={rows.length}
              maxLength={collapse.collapsed}
              expandText={
                rows.length > collapse.expanded
                  ? `Show top ${collapse.expanded}`
                  : "Show all"
              }
            />
          )}
        </div>
      ) : (
        <NoDataOrLoading 
          isLoading={isLoading} 
          {...noDataProps} 
        />
      )}
    </>
  );
};

export default DashboardTable;