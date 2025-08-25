// src/features/dashboard/components/templates/DashboardTemplates.js
// 대시보드별 위젯 설정 및 템플릿 정의

export const DASHBOARD_TEMPLATES = {
  // Usage Management Dashboard
  'usage-management': {
    name: 'Langfuse Usage Management',
    description: 'Track usage metrics across traces, observations, and scores to manage resource allocation.',
    layout: 'grid',
    widgets: [
      // Row 1: 4 BIG_NUMBER widgets
      { 
        id: 'trace-count', 
        component: 'TotalMetric', 
        title: 'Total Trace Count', 
        description: 'Total count of traces across all environments', 
        span: 3,
        queryType: 'count',
        target: 'traces'
      },
      { 
        id: 'obs-count', 
        component: 'TotalMetric', 
        title: 'Total Observation Count', 
        description: 'Total count of observations across all environments', 
        span: 3,
        queryType: 'count',
        target: 'observations'
      },
      { 
        id: 'score-numeric', 
        component: 'TotalMetric', 
        title: 'Total Score Count (numeric)', 
        description: 'Total count of numeric scores across all environments', 
        span: 3,
        queryType: 'count',
        target: 'scores-numeric'
      },
      { 
        id: 'score-categorical', 
        component: 'TotalMetric', 
        title: 'Total Score Count (categorical)', 
        description: 'Total count of categorical scores across all environments', 
        span: 3,
        queryType: 'count',
        target: 'scores-categorical'
      },
      
      // Row 2: 4 BAR_CHART widgets (time series)
      { 
        id: 'trace-time', 
        component: 'BaseTimeSeriesChart', 
        title: 'Total Trace Count (over time)', 
        description: 'Trend of trace count over time', 
        span: 3,
        queryType: 'timeseries',
        target: 'traces'
      },
      { 
        id: 'obs-time', 
        component: 'BaseTimeSeriesChart', 
        title: 'Total Observation Count (over time)', 
        description: 'Trend of observation count over time', 
        span: 3,
        queryType: 'timeseries',
        target: 'observations'
      },
      { 
        id: 'score-numeric-time', 
        component: 'BaseTimeSeriesChart', 
        title: 'Total Score Count (numeric)', 
        description: 'Trend of numeric score count over time', 
        span: 3,
        queryType: 'timeseries',
        target: 'scores-numeric'
      },
      { 
        id: 'score-categorical-time', 
        component: 'BaseTimeSeriesChart', 
        title: 'Total Score Count (categorical)', 
        description: 'Trend of categorical score count over time', 
        span: 3,
        queryType: 'timeseries',
        target: 'scores-categorical'
      },
      
      // Row 3: 2 STACKED_BAR_CHART widgets
      { 
        id: 'trace-env', 
        component: 'TracesBarListChart', 
        title: 'Total Trace Count (by env)', 
        description: 'Distribution of trace count across different environments', 
        span: 6,
        queryType: 'group-by',
        target: 'traces',
        groupBy: 'environment'
      },
      { 
        id: 'obs-env', 
        component: 'TracesBarListChart', 
        title: 'Total Observation Count (by env)', 
        description: 'Distribution of observation count across different environments', 
        span: 6,
        queryType: 'group-by',
        target: 'observations',
        groupBy: 'environment'
      }
    ]
  },

  // Cost Dashboard  
  'cost-dashboard': {
    name: 'Langfuse Cost Dashboard',
    description: 'Review your LLM costs.',
    layout: 'grid',
    widgets: [
      // Row 1
      { 
        id: 'trace-count', 
        component: 'TotalMetric', 
        title: 'Total Count Traces', 
        description: 'Shows the count of Traces', 
        span: 3,
        queryType: 'count',
        target: 'traces'
      },
      { 
        id: 'obs-count', 
        component: 'TotalMetric', 
        title: 'Total Count Observations', 
        description: 'Shows the count of Observations', 
        span: 3,
        queryType: 'count',
        target: 'observations'
      },
      { 
        id: 'cost-model', 
        component: 'ModelCostTable', 
        title: 'Cost by Model Name', 
        description: 'Total cost broken down by model name', 
        span: 3,
        queryType: 'group-by',
        target: 'observations',
        groupBy: 'model',
        metric: 'cost'
      },
      { 
        id: 'cost-env', 
        component: 'UserChart', 
        title: 'Cost by Environment', 
        description: 'Total cost broken down by trace environment', 
        span: 3,
        queryType: 'group-by',
        target: 'traces',
        groupBy: 'environment',
        metric: 'cost',
        chartType: 'donut'
      },
      
      // Row 2  
      { 
        id: 'total-cost', 
        component: 'BaseTimeSeriesChart', 
        title: 'Total costs', 
        description: 'Total cost across all use cases', 
        span: 4,
        queryType: 'timeseries',
        target: 'observations',
        metric: 'cost'
      },
      { 
        id: 'users-cost', 
        component: 'TracesBarListChart', 
        title: 'Top 20 Users by Cost', 
        description: 'Aggregated model cost (observations.totalCost) by trace.userId', 
        span: 4,
        queryType: 'top-n',
        target: 'traces',
        groupBy: 'userId',
        metric: 'cost',
        limit: 20
      },
      { 
        id: 'trace-cost', 
        component: 'TracesBarListChart', 
        title: 'Top 20 Use Cases (Trace) by Cost', 
        description: 'Aggregated model cost (observations.totalCost) by trace.name', 
        span: 4,
        queryType: 'top-n',
        target: 'traces',
        groupBy: 'name',
        metric: 'cost',
        limit: 20
      },
      
      // Row 3
      { 
        id: 'obs-cost', 
        component: 'TracesBarListChart', 
        title: 'Top 20 Use Cases (Observation) by Cost', 
        description: 'Aggregated model cost (observations.totalCost) by observation.name', 
        span: 4,
        queryType: 'top-n',
        target: 'observations',
        groupBy: 'name',
        metric: 'cost',
        limit: 20
      },
      { 
        id: 'cost-trace-p95', 
        component: 'BaseTimeSeriesChart', 
        title: 'P 95 Cost per Trace', 
        description: '95th percentile of cost for each trace', 
        span: 4,
        queryType: 'percentile-timeseries',
        target: 'traces',
        metric: 'cost',
        percentile: 95
      },
      { 
        id: 'cost-input-p95', 
        component: 'BaseTimeSeriesChart', 
        title: 'P 95 Input Cost per Observation', 
        description: '95th percentile of input cost for each observation (llm call)', 
        span: 4,
        queryType: 'percentile-timeseries',
        target: 'observations',
        metric: 'inputCost',
        percentile: 95
      }
    ]
  },

  // Latency Dashboard
  'latency-dashboard': {
    name: 'Langfuse Latency Dashboard', 
    description: 'Monitor latency metrics across traces and generations for performance optimization.',
    layout: 'grid',
    widgets: [
      // Row 1
      { 
        id: 'latency-use-case', 
        component: 'LatencyChart', 
        title: 'P 95 Latency by Use Case', 
        description: 'P95 latency metrics segmented by trace name', 
        span: 6,
        queryType: 'percentile-group',
        target: 'traces',
        metric: 'latency',
        percentile: 95,
        groupBy: 'name'
      },
      { 
        id: 'latency-level', 
        component: 'LatencyChart', 
        title: 'P 95 Latency by Level (Observations)', 
        description: 'P95 latency metrics for observations segmented by level', 
        span: 6,
        queryType: 'percentile-group',
        target: 'observations',
        metric: 'latency',
        percentile: 95,
        groupBy: 'level'
      },
      
      // Row 2
      { 
        id: 'latency-users', 
        component: 'TracesBarListChart', 
        title: 'Max Latency by User Id (Traces)', 
        description: 'Maximum latency for the top 50 users by trace userId', 
        span: 6,
        queryType: 'max-group',
        target: 'traces',
        metric: 'latency',
        groupBy: 'userId',
        limit: 50
      },
      { 
        id: 'time-first-token', 
        component: 'ModelUsageChart', 
        title: 'Avg Time To First Token by Prompt Name (Observations)', 
        description: 'Average time to first token segmented by prompt name', 
        span: 6,
        queryType: 'avg-group',
        target: 'observations',
        metric: 'timeToFirstToken',
        groupBy: 'promptName'
      },
      
      // Row 3
      { 
        id: 'time-first-token-model', 
        component: 'BaseTimeSeriesChart', 
        title: 'P 95 Time To First Token by Model', 
        description: 'P95 time to first token metrics segmented by model', 
        span: 4,
        queryType: 'percentile-timeseries-group',
        target: 'observations',
        metric: 'timeToFirstToken',
        percentile: 95,
        groupBy: 'model'
      },
      { 
        id: 'latency-model', 
        component: 'BaseTimeSeriesChart', 
        title: 'P 95 Latency by Model', 
        description: 'P95 latency metrics for observations segmented by model', 
        span: 4,
        queryType: 'percentile-timeseries-group',
        target: 'observations',
        metric: 'latency',
        percentile: 95,
        groupBy: 'model'
      },
      { 
        id: 'output-tokens-model', 
        component: 'BaseTimeSeriesChart', 
        title: 'Avg Output Tokens Per Second by Model', 
        description: 'Average output tokens per second segmented by model', 
        span: 4,
        queryType: 'avg-timeseries-group',
        target: 'observations',
        metric: 'tokensPerSecond',
        groupBy: 'model'
      }
    ]
  }
};

// 대시보드 ID 매핑 (실제 ID → 템플릿 키)
export const DASHBOARD_ID_MAPPING = {
  // TODO: 실제 Langfuse 대시보드 ID로 교체
  'langfuse-usage-management': 'usage-management',
  'langfuse-cost-dashboard': 'cost-dashboard', 
  'langfuse-latency-dashboard': 'latency-dashboard'
};

// 템플릿 키 추출 함수
export function getTemplateKey(dashboardData, dashboardId) {
  // 대시보드 이름으로 매칭
  const name = dashboardData?.name?.toLowerCase() || '';
  
  if (name.includes('usage management')) return 'usage-management';
  if (name.includes('cost dashboard')) return 'cost-dashboard';  
  if (name.includes('latency dashboard')) return 'latency-dashboard';
  
  // ID 기반 매핑도 시도
  return DASHBOARD_ID_MAPPING[dashboardId] || null;
}

// 위젯별 쿼리 생성 함수 (executeQuery 파라미터 생성용)
export function buildWidgetQuery(widget, filters = {}) {
  const { queryType, target, metric = 'count', groupBy, percentile, limit } = widget;
  
  // 기본 쿼리 구조
  const baseQuery = {
    view: target, // 'traces', 'observations', 'scores-numeric' 등
    filters: filters.customFilters || [],
    fromTimestamp: filters.fromTimestamp,
    toTimestamp: filters.toTimestamp
  };
  
  // 쿼리 타입별 설정
  switch (queryType) {
    case 'count':
      return {
        ...baseQuery,
        metrics: [{ measure: 'count', aggregation: 'count' }]
      };
      
    case 'timeseries':
      return {
        ...baseQuery,
        metrics: [{ measure: metric, aggregation: 'count' }],
        timeDimension: { field: 'createdAt', granularity: 'day' }
      };
      
    case 'group-by':
      return {
        ...baseQuery,
        dimensions: [groupBy],
        metrics: [{ measure: metric, aggregation: 'sum' }],
        orderBy: [{ field: metric, direction: 'desc' }],
        limit: limit || 10
      };
      
    case 'percentile-timeseries':
      return {
        ...baseQuery,
        metrics: [{ measure: metric, aggregation: `p${percentile}` }],
        timeDimension: { field: 'createdAt', granularity: 'day' }
      };
      
    case 'top-n':
      return {
        ...baseQuery,
        dimensions: [groupBy],
        metrics: [{ measure: metric, aggregation: 'sum' }],
        orderBy: [{ field: metric, direction: 'desc' }],
        limit: limit || 20
      };
      
    default:
      return baseQuery;
  }
}