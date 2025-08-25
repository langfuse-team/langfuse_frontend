import React, { useState } from 'react';
import DashboardCard from './cards/DashboardCard';
import TotalMetric from './TotalMetric';
import { compactNumberFormatter } from '../utils/numbers';
import NoDataOrLoading from './NoDataOrLoading';

// ExpandListButton 간단 구현 (임시)
const ExpandListButton = ({ 
  isExpanded, 
  setExpanded, 
  totalLength, 
  maxLength, 
  expandText 
}) => {
  if (totalLength <= maxLength) return null;

  return (
    <button
      onClick={() => setExpanded(!isExpanded)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '8px 16px',
        marginTop: '12px',
        border: '1px solid #d1d5db',
        backgroundColor: 'white',
        color: '#374151',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f9fafb';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'white';
      }}
    >
      {isExpanded ? 'Show less' : expandText}
      <span style={{ 
        marginLeft: '4px',
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s'
      }}>
        ▼
      </span>
    </button>
  );
};

// BarList 컴포넌트 (Tremor 대체)
const BarList = ({ data, valueFormatter, showAnimation = true, color = "indigo" }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  const getBarColor = (colorName) => {
    const colors = {
      indigo: '#6366f1',
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      red: '#ef4444'
    };
    return colors[colorName] || colors.indigo;
  };

  return (
    <div style={{ marginTop: '24px' }}>
      {data.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        
        return (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              padding: '4px 0'
            }}
          >
            {/* 이름 */}
            <div style={{
              minWidth: '120px',
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.name}
            </div>
            
            {/* 바 컨테이너 */}
            <div style={{
              flex: 1,
              margin: '0 12px',
              height: '20px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* 실제 바 */}
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: getBarColor(color),
                  borderRadius: '4px',
                  transition: showAnimation ? 'width 0.8s ease-out' : 'none',
                  opacity: 0.8
                }}
              />
            </div>
            
            {/* 값 */}
            <div style={{
              minWidth: '60px',
              textAlign: 'right',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 트레이스 바 리스트 차트 컴포넌트
 * 트레이스 이름별 개수를 바 차트로 표시
 * @param {Object} props
 * @param {string} props.className - CSS 클래스
 * @param {string} props.projectId - 프로젝트 ID
 * @param {Object} props.globalFilterState - 글로벌 필터 상태
 * @param {Date} props.fromTimestamp - 시작 시간
 * @param {Date} props.toTimestamp - 종료 시간
 * @param {boolean} props.isLoading - 로딩 상태
 */
const TracesBarListChart = ({
  className,
  projectId,
  globalFilterState,
  fromTimestamp,
  toTimestamp,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // TODO: 실제 API 연동 필요
  console.log('TracesBarListChart props:', {
    projectId,
    globalFilterState,
    fromTimestamp: fromTimestamp?.toISOString(),
    toTimestamp: toTimestamp?.toISOString(),
    isLoading
  });

  // Mock 총 트레이스 데이터
  const mockTotalTraces = {
    isLoading: false,
    data: [{ count_count: 15847 }]
  };

  // Mock 트레이스 이름별 데이터
  const mockTracesData = [
    { name: 'chat-completion', count_count: 5234 },
    { name: 'document-analysis', count_count: 3421 },
    { name: 'code-generation', count_count: 2156 },
    { name: 'text-summarization', count_count: 1789 },
    { name: 'question-answering', count_count: 1234 },
    { name: 'translation', count_count: 987 },
    { name: 'sentiment-analysis', count_count: 654 },
    { name: 'content-moderation', count_count: 432 },
    { name: 'image-captioning', count_count: 321 },
    { name: 'speech-to-text', count_count: 234 },
    { name: 'text-to-speech', count_count: 187 },
    { name: 'recommendation', count_count: 156 },
    { name: 'classification', count_count: 123 },
    { name: 'entity-extraction', count_count: 89 },
    { name: 'keyword-extraction', count_count: 67 }
  ];

  const mockTraces = {
    isLoading: false,
    data: mockTracesData
  };

  const totalTraces = mockTotalTraces;
  const traces = mockTraces;

  // 데이터 변환
  const transformedTraces = traces.data?.map((item) => {
    return {
      name: item.name ? item.name : "Unknown",
      value: Number(item.count_count),
    };
  }) ?? [];

  const maxNumberOfEntries = { collapsed: 5, expanded: 20 };

  const adjustedData = isExpanded
    ? transformedTraces.slice(0, maxNumberOfEntries.expanded)
    : transformedTraces.slice(0, maxNumberOfEntries.collapsed);

  return (
    <DashboardCard
      className={className}
      title="Traces"
      description={null}
      isLoading={isLoading || traces.isLoading || totalTraces.isLoading}
    >
      <>
        <TotalMetric
          metric={compactNumberFormatter(
            totalTraces.data?.[0]?.count_count
              ? Number(totalTraces.data[0].count_count)
              : 0,
          )}
          description="Total traces tracked"
        />
        {adjustedData.length > 0 ? (
          <BarList
            data={adjustedData}
            valueFormatter={(number) =>
              Intl.NumberFormat("en-US").format(number).toString()
            }
            showAnimation={true}
            color="indigo"
          />
        ) : (
          <NoDataOrLoading
            isLoading={isLoading || traces.isLoading || totalTraces.isLoading}
            description="Traces contain details about LLM applications and can be created using the SDK."
            href="https://langfuse.com/docs/get-started"
          />
        )}
        <ExpandListButton
          isExpanded={isExpanded}
          setExpanded={setIsExpanded}
          totalLength={transformedTraces.length}
          maxLength={maxNumberOfEntries.collapsed}
          expandText={
            transformedTraces.length > maxNumberOfEntries.expanded
              ? `Show top ${maxNumberOfEntries.expanded}`
              : "Show all"
          }
        />
      </>
    </DashboardCard>
  );
};

export default TracesBarListChart;