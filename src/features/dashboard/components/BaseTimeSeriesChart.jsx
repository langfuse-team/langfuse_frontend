import React, { useMemo } from 'react';
import { 
  LineChart, 
  AreaChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { getColorsForCategories } from '../utils/getColorsForCategories';
import { compactNumberFormatter } from '../../../utils/numbers';
import { dashboardDateRangeAggregationSettings } from '../../../utils/date-range-utils';
import { Tooltip } from './Tooltip';

/**
 * 시계열 차트 데이터 포인트 타입 (JSDoc으로 대체)
 * @typedef {Object} TimeSeriesChartDataPoint
 * @property {number} ts - 타임스탬프
 * @property {Array<{label: string, value?: number}>} values - 값들
 */

/**
 * 기본 시계열 차트 컴포넌트
 * @param {Object} props
 * @param {string} props.className - CSS 클래스명
 * @param {string} props.agg - 집계 옵션
 * @param {TimeSeriesChartDataPoint[]} props.data - 차트 데이터
 * @param {boolean} props.showLegend - 범례 표시 여부
 * @param {boolean} props.connectNulls - null 값 연결 여부
 * @param {function} props.valueFormatter - 값 포맷터 함수
 * @param {string} props.chartType - 차트 타입 ("line" | "area")
 */
export function BaseTimeSeriesChart(props) {
  const {
    className = '',
    agg,
    data = [],
    showLegend = true,
    connectNulls = false,
    valueFormatter = compactNumberFormatter,
    chartType = 'line'
  } = props;

  // 모든 라벨 추출
  const labels = new Set(
    data.flatMap((d) => d.values.map((v) => v.label))
  );

  /**
   * 데이터 배열을 Recharts 형식으로 변환
   */
  function transformArray(array) {
    return array.map((item) => {
      const outputObject = {
        timestamp: convertDate(item.ts, agg),
      };

      item.values.forEach((valueObject) => {
        outputObject[valueObject.label] = valueObject.value;
      });

      return outputObject;
    });
  }

  /**
   * 타임스탬프를 날짜 문자열로 변환
   */
  const convertDate = (date, agg) => {
    const aggSettings = dashboardDateRangeAggregationSettings[agg];
    if (!aggSettings) return new Date(date).toLocaleDateString("en-US");
    
    const showMinutes = ["minute", "hour"].includes(aggSettings.date_trunc);

    if (showMinutes) {
      return new Date(date).toLocaleTimeString("en-US", {
        year: "2-digit",
        month: "numeric", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(date).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
    });
  };

  // 색상 배열 생성
  const colors = getColorsForCategories(Array.from(labels));
  
  // 색상 매핑 객체 생성
  const colorMap = {};
  Array.from(labels).forEach((label, index) => {
    colorMap[label] = getColorCode(colors[index] || 'blue');
  });

  /**
   * 색상 이름을 실제 컬러 코드로 변환
   */
  function getColorCode(colorName) {
    const colorCodeMap = {
      'indigo': '#6366f1',
      'cyan': '#06b6d4',
      'zinc': '#71717a', 
      'purple': '#a855f7',
      'yellow': '#eab308',
      'red': '#ef4444',
      'lime': '#84cc16',
      'pink': '#ec4899',
      'emerald': '#10b981',
      'teal': '#14b8a6',
      'fuchsia': '#d946ef',
      'sky': '#0ea5e9',
      'blue': '#3b82f6',
      'orange': '#f97316',
      'violet': '#8b5cf6',
      'rose': '#f43f5e',
      'green': '#22c55e',
      'amber': '#f59e0b',
      'slate': '#64748b',
      'gray': '#6b7280',
      'neutral': '#737373',
      'stone': '#78716c'
    };
    return colorCodeMap[colorName] || '#6b7280';
  }

  // 동적 최대값 계산 (10% 버퍼 추가)
  const dynamicMaxValue = useMemo(() => {
    if (data.length === 0) return undefined;

    const maxValue = Math.max(
      ...data.flatMap((point) => point.values.map((v) => v.value || 0))
    );

    if (maxValue <= 0) return undefined;

    // 10% 버퍼 추가
    const bufferedValue = maxValue * 1.1;

    // 자릿수 기반 반올림
    const magnitude = Math.floor(Math.log10(bufferedValue));
    const roundTo = Math.max(1, Math.pow(10, magnitude) / 5);

    return Math.ceil(bufferedValue / roundTo) * roundTo;
  }, [data]);

  // 변환된 데이터
  const chartData = transformArray(data);

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    
    return (
      <Tooltip
        active={active}
        payload={payload}
        label={label}
        formatter={valueFormatter}
      />
    );
  };

  // 차트 공통 props
  const commonProps = {
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  return (
    <div 
      style={{ marginTop: '16px' }}
      className={className}
    >
      {chartData.length === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'area' ? (
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={valueFormatter}
                domain={[0, dynamicMaxValue || 'auto']}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              
              {Array.from(labels).map((label) => (
                <Area
                  key={label}
                  type="monotone"
                  dataKey={label}
                  stackId="1"
                  stroke={colorMap[label]}
                  fill={colorMap[label]}
                  fillOpacity={0.6}
                  connectNulls={connectNulls}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={valueFormatter}
                domain={[0, dynamicMaxValue || 'auto']}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              
              {Array.from(labels).map((label) => (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
                  stroke={colorMap[label]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={connectNulls}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BaseTimeSeriesChart;