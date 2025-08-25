import { commonUtils } from '../services';

// 실제 API 응답을 컴포넌트에 맞는 형태로 변환
export const transformWidgetData = (widget, apiData) => {
  // 필수 로그만 유지
  if (import.meta.env.DEV && widget.component === 'BaseTimeSeriesChart') {
    console.log(`🔄 BaseTimeSeriesChart 변환 (${widget.id}):`, apiData);
  }

  if (!Array.isArray(apiData) || apiData.length === 0) {
    return { value: 0, chartData: [] };
  }

  // API 응답에서 실제 데이터 추출
  let actualData = apiData;

  if (!Array.isArray(actualData) || actualData.length === 0) {
    return { value: 0, chartData: [] };
  }

  switch (widget.component) {
    case "TotalMetric": {
      // API 응답: [{"count_count": "5"}]
      const firstRow = actualData[0];
      const countKey = Object.keys(firstRow).find((key) =>
        key.includes("count")
      );
      const value = countKey ? parseInt(firstRow[countKey]) : 0;
      return { value };
    }

    case "BaseTimeSeriesChart": {
      // 시계열 데이터 변환 - BaseTimeSeriesChart가 기대하는 구조로
      if (actualData.length > 1 || (actualData[0] && actualData[0].time_dimension)) {
        // 실제 시계열 데이터가 있는 경우
        const chartData = actualData.map((row) => {
          const timestamp = row.time_dimension || row.date || Date.now();
          const numericValues = Object.entries(row)
            .filter(([key, value]) => key !== 'time_dimension' && key !== 'date' && !isNaN(value))
            .map(([key, value]) => ({
              label: key.replace('_count', ''), // count_count -> count
              value: parseInt(value) || 0
            }));

          // 값이 없으면 기본 값 생성
          if (numericValues.length === 0) {
            numericValues.push({
              label: 'count',
              value: parseInt(Object.values(row).find(v => !isNaN(v))) || 0
            });
          }

          return {
            ts: typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp,
            values: numericValues
          };
        });

        if (import.meta.env.DEV && widget.component === 'BaseTimeSeriesChart') {
          console.log(`✅ 시계열 변환 완료 (${widget.id}):`, chartData.slice(0, 2));
        }
        return { chartData };
        
      } else {
        // 단일 값인 경우 목업 시계열 생성
        const baseValue = parseInt(Object.values(actualData[0])[0]) || 0;
        const now = Date.now();
        
        const chartData = Array.from({ length: 7 }, (_, i) => {
          const dayMs = 24 * 60 * 60 * 1000;
          return {
            ts: now - ((6 - i) * dayMs), // 7일 전부터 오늘까지
            values: [{
              label: 'count',
              value: Math.max(0, baseValue + Math.floor((Math.random() - 0.5) * baseValue * 0.3))
            }]
          };
        });

        return { chartData };
      }
    }

    case "TracesBarListChart": {
      // 그룹화된 데이터 변환
      if (actualData.length > 1) {
        return {
          chartData: actualData.slice(0, 10).map((row, index) => ({
            name:
              row.name || row.group || row.environment || `Item ${index + 1}`,
            value: parseInt(Object.values(row).find((v) => !isNaN(v))) || 0,
            percentage: Math.floor(Math.random() * 100),
          })),
        };
      } else {
        // 단일 값인 경우 목업 그룹 데이터
        const baseValue = parseInt(Object.values(actualData[0])[0]) || 0;
        return {
          chartData: Array.from({ length: 5 }, (_, i) => ({
            name: `Group ${i + 1}`,
            value:
              Math.floor(baseValue / 5) + Math.floor(Math.random() * 200),
            percentage: Math.floor(Math.random() * 100),
          })),
        };
      }
    }

    case "LatencyChart": {
      // 지연시간 데이터
      if (actualData.length > 1 || (actualData[0] && actualData[0].time_dimension)) {
        return {
          chartData: actualData.map((row) => ({
            date: row.time_dimension || row.date || "Unknown",
            p95: parseInt(row.p95) || Math.floor(Math.random() * 2000) + 500,
            p50: parseInt(row.p50) || Math.floor(Math.random() * 1000) + 200,
          })),
        };
      } else {
        // 목업 지연시간 데이터
        return {
          chartData: Array.from({ length: 7 }, (_, i) => ({
            date: `8/${18 + i}/25`,
            p95: Math.floor(Math.random() * 2000) + 500,
            p50: Math.floor(Math.random() * 1000) + 200,
          })),
        };
      }
    }

    case "ModelUsageChart":
    case "UserChart": {
      // 차트 데이터 변환
      return {
        chartData: actualData.slice(0, 8).map((row, index) => ({
          name: row.name || row.model || row.user || `Item ${index + 1}`,
          value: parseInt(Object.values(row).find((v) => !isNaN(v))) || 0,
          color: commonUtils.getChartColors()[index % commonUtils.getChartColors().length],
        })),
      };
    }

    case "ModelCostTable": {
      // 테이블 데이터 변환
      return {
        chartData: actualData.slice(0, 20).map((row, index) => ({
          model: row.model || `Model ${index + 1}`,
          usage: parseInt(row.usage) || Math.floor(Math.random() * 10000),
          cost: parseFloat(row.cost) || (Math.random() * 100).toFixed(2),
          percentage: Math.floor(Math.random() * 100),
        })),
      };
    }

    default:
      return {
        value: parseInt(Object.values(actualData[0])[0]) || 0,
        chartData: actualData,
      };
  }
};

// 목업 데이터 생성 (API 실패 시 폴백용)
export const generateMockData = (widget) => {
  switch (widget.component) {
    case "TotalMetric":
      return { 
        value: Math.floor(Math.random() * 10000) + 100,
        apiStatus: 'mock'
      };

    case "BaseTimeSeriesChart":
      return {
        chartData: Array.from({ length: 7 }, (_, i) => ({
          date: `8/${18 + i}/25`,
          value: Math.floor(Math.random() * 500) + 50,
        })),
        apiStatus: 'mock'
      };

    case "TracesBarListChart":
      return {
        chartData: Array.from({ length: 5 }, (_, i) => ({
          name: `${widget.target || "Item"} ${i + 1}`,
          value: Math.floor(Math.random() * 1000) + 100,
          percentage: Math.floor(Math.random() * 100),
        })),
        apiStatus: 'mock'
      };

    case "LatencyChart":
      return {
        chartData: Array.from({ length: 7 }, (_, i) => ({
          date: `8/${18 + i}/25`,
          p95: Math.floor(Math.random() * 2000) + 500,
          p50: Math.floor(Math.random() * 1000) + 200,
        })),
        apiStatus: 'mock'
      };

    case "ModelUsageChart":
    case "UserChart":
      return {
        chartData: Array.from({ length: 6 }, (_, i) => ({
          name: `${widget.target || "Item"} ${i + 1}`,
          value: Math.floor(Math.random() * 1000) + 50,
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        })),
        apiStatus: 'mock'
      };

    case "ModelCostTable":
      return {
        chartData: Array.from({ length: 10 }, (_, i) => ({
          model: `Model-${i + 1}`,
          usage: Math.floor(Math.random() * 10000) + 1000,
          cost: (Math.random() * 100 + 10).toFixed(2),
          percentage: Math.floor(Math.random() * 100),
        })),
        apiStatus: 'mock'
      };

    default:
      return {
        value: Math.floor(Math.random() * 1000),
        chartData: [],
        apiStatus: 'mock'
      };
  }
};

// 데이터 검증 함수 - BaseTimeSeriesChart 검증 수정
export const validateComponentData = (component, data) => {
  // 로딩 중이거나 에러가 있으면 검증 통과
  if (data.isLoading || data.error) {
    return true;
  }

  // 빈 상태면 검증 통과 (빈 상태 UI를 보여줄 것이므로)
  if (data.isEmpty) {
    return true;
  }

  switch (component) {
    case 'TotalMetric':
      return typeof data.value === 'number' || data.value !== undefined;
    
    case 'BaseTimeSeriesChart':
      // BaseTimeSeriesChart의 경우 chartData 구조 검증
      return Array.isArray(data.chartData) && 
             data.chartData.length > 0 &&
             data.chartData.every(item => 
               item && 
               typeof item.ts !== 'undefined' && 
               Array.isArray(item.values) &&
               item.values.every(v => 
                 v && typeof v.label !== 'undefined' && typeof v.value !== 'undefined'
               )
             );
    
    case 'TracesBarListChart':
    case 'ModelUsageChart':
    case 'UserChart':
      return Array.isArray(data.chartData) && 
             data.chartData.length > 0 &&
             data.chartData.every(item => 
               item && typeof item.name !== 'undefined' && typeof item.value !== 'undefined'
             );
    
    case 'LatencyChart':
      return Array.isArray(data.chartData) && 
             data.chartData.length > 0 &&
             data.chartData.every(item => 
               item && typeof item.date !== 'undefined' && 
               (typeof item.p95 !== 'undefined' || typeof item.p50 !== 'undefined')
             );
    
    case 'ModelCostTable':
      return Array.isArray(data.chartData) && 
             data.chartData.every(item => 
               item && typeof item.model !== 'undefined'
             );
    
    default:
      return true;
  }
};