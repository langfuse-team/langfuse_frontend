// src/services/widgetAPI.js
// Langfuse tRPC를 REST API로 변환한 서비스

const API_CONFIG = {
  BASE_URL: '', // 빈 문자열로 설정 (프록시 사용)
  PROJECT_ID: import.meta.env.VITE_LANGFUSE_PROJECT_ID || 'cmel2hq340006qw07qiudmntk',
};

class WidgetAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.projectId = API_CONFIG.PROJECT_ID;
  }

  // 공통 헤더
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * tRPC 엔드포인트를 REST처럼 호출하는 헬퍼
   * tRPC의 복잡한 형식을 숨기고 REST처럼 사용
   */
  async callTRPCAsREST(endpoint, method = 'GET', data = null) {
    try {
      if (method === 'GET') {
        // GET 요청: tRPC 형식으로 변환
        const params = new URLSearchParams({
          batch: '1',
          input: JSON.stringify({
            0: { json: data }
          })
        });
        
        const response = await fetch(
          `${this.baseURL}/api/trpc/${endpoint}?${params}`,
          {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API 오류 (${endpoint}):`, errorText);
          throw new Error(`API 오류: ${response.status}`);
        }

        const result = await response.json();
        // tRPC 응답에서 실제 데이터 추출
        return result[0]?.result?.data?.json || null;
        
      } else {
        // POST 요청
        const response = await fetch(
          `${this.baseURL}/api/trpc/${endpoint}`,
          {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ json: data }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API 오류 (${endpoint}):`, errorText);
          throw new Error(`API 오류: ${response.status}`);
        }

        const result = await response.json();
        // tRPC 응답에서 실제 데이터 추출
        return result?.result?.data?.json || null;
      }
    } catch (error) {
      console.error(`REST API 호출 오류 (${endpoint}):`, error);
      throw error;
    }
  }

  // ============================================
  // REST API 메서드들 (실제 API만 사용, 더미 데이터 없음)
  // ============================================

  /**
   * GET /widgets
   * 위젯 목록 조회
   */
  async getWidgets(currentPage = 1, itemsPerPage = 50) {
    try {
      console.log('위젯 목록 조회 시작:', { currentPage, itemsPerPage });
      
      // tRPC는 0-based pagination
      const page = currentPage - 1;
      
      const data = await this.callTRPCAsREST('dashboardWidgets.all', 'GET', {
        projectId: this.projectId,
        page,
        limit: itemsPerPage,
        orderBy: { column: 'updatedAt', order: 'DESC' }
      });

      if (!data) {
        throw new Error('위젯 데이터를 받지 못했습니다');
      }

      console.log('위젯 데이터 수신:', data);

      // 위젯 데이터 변환
      const widgets = (data.widgets || []).map(widget => ({
        id: widget.id,
        name: widget.name || 'Unnamed Widget',
        description: widget.description || '',
        viewType: widget.query?.view || 'traces',
        chartType: this.convertChartTypeToComponent(widget.query?.chartConfig?.type),
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
      }));

      return {
        success: true,
        data: widgets,
        totalItems: data.totalCount || 0,
        currentPage: currentPage,
        totalPages: Math.ceil((data.totalCount || 0) / itemsPerPage),
        meta: {
          totalItems: data.totalCount || 0,
          currentPage: currentPage,
          totalPages: Math.ceil((data.totalCount || 0) / itemsPerPage),
          hasMore: data.hasMore || false
        }
      };
      
    } catch (error) {
      console.error('위젯 목록 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        data: [],
        totalItems: 0,
        currentPage: currentPage,
        totalPages: 0,
        meta: {
          totalItems: 0,
          currentPage: currentPage,
          totalPages: 0
        }
      };
    }
  }

  /**
   * POST /widgets
   * 위젯 생성
   */
  async createWidget(widgetData) {
    try {
      console.log('위젯 생성 요청:', widgetData);

      // metrics 형식 변환
      const metrics = widgetData.metrics?.map(m => ({
        measure: m.columnId || m.measure || 'count',
        aggregation: m.aggregation || 'count'
      })) || [{ measure: 'count', aggregation: 'count' }];

      // REST → tRPC 형식 변환
      const payload = {
        projectId: this.projectId,
        dashboardId: widgetData.dashboardId || 'default',
        name: widgetData.name,
        description: widgetData.description || '',
        query: {
          view: widgetData.view || 'traces',
          dimensions: widgetData.dimensions || [],
          metrics: metrics,
          filters: widgetData.filters || [],
          timeDimension: widgetData.timeDimension || null,
          chartConfig: {
            type: this.convertChartTypeToAPI(widgetData.chartType)
          }
        },
        position: widgetData.position || {
          x: 0,
          y: 0,
          width: 4,
          height: 3
        }
      };

      const data = await this.callTRPCAsREST('dashboardWidgets.create', 'POST', payload);
      
      if (!data) {
        throw new Error('위젯 생성 응답을 받지 못했습니다');
      }

      console.log('위젯 생성 성공:', data);

      return {
        success: true,
        widget: data,
        data: data
      };
      
    } catch (error) {
      console.error('위젯 생성 실패:', error);
      
      return { 
        success: false,
        error: error.message
      };
    }
  }

  /**
   * DELETE /widgets/:id
   * 위젯 삭제
   */
  async deleteWidget(widgetId) {
    try {
      console.log('위젯 삭제 요청:', widgetId);

      const data = await this.callTRPCAsREST('dashboardWidgets.delete', 'POST', {
        projectId: this.projectId,
        widgetId: widgetId
      });

      console.log('위젯 삭제 성공');

      return {
        success: true,
        message: '위젯이 삭제되었습니다.'
      };
      
    } catch (error) {
      console.error('위젯 삭제 실패:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * PUT /widgets/:id
   * 위젯 수정
   */
  async updateWidget(widgetId, updateData) {
    try {
      console.log('위젯 수정 요청:', { widgetId, updateData });

      const payload = {
        projectId: this.projectId,
        widgetId: widgetId,
        ...updateData
      };

      const data = await this.callTRPCAsREST('dashboardWidgets.update', 'POST', payload);

      if (!data) {
        throw new Error('위젯 수정 응답을 받지 못했습니다');
      }

      console.log('위젯 수정 성공:', data);

      return {
        success: true,
        data: data
      };
      
    } catch (error) {
      console.error('위젯 수정 실패:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * POST /execute-query
   * 대시보드 쿼리 실행 (차트 데이터 조회)
   */
  async executeQuery({
    view = 'traces',
    metrics = [{ measure: 'count', aggregation: 'count' }],
    filters = [],
    fromTimestamp,
    toTimestamp,
    chartType = 'LINE_TIME_SERIES'
  }) {
    try {
      console.log('쿼리 실행:', { view, metrics, chartType });

      const query = {
        projectId: this.projectId,
        query: {
          view,
          dimensions: [],
          metrics,
          filters,
          timeDimension: null,
          fromTimestamp,
          toTimestamp,
          orderBy: null,
          chartConfig: { type: chartType }
        }
      };

      const data = await this.callTRPCAsREST('dashboard.executeQuery', 'GET', query);

      if (!data) {
        throw new Error('쿼리 실행 결과를 받지 못했습니다');
      }

      console.log('쿼리 실행 결과:', data);

      return {
        success: true,
        data: {
          value: data.value || 0,
          chartType: data.chartType,
          chartData: data.chartData || []
        }
      };
      
    } catch (error) {
      console.error('쿼리 실행 실패:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          value: 0,
          chartData: []
        }
      };
    }
  }

  /**
   * GET /metrics-preview
   * 미리보기용 메트릭 데이터 (NewWidgetPage 호환)
   */
  async getMetricsPreview({
    view = 'traces',
    from,
    to,
    interval = 'day',
    filters = [],
    metric = 'count',
    aggregation = 'count'
  }) {
    try {
      console.log('메트릭 미리보기:', { view, metric, aggregation });

      const metrics = [{
        measure: metric === 'count' ? 'count' : metric,
        aggregation: aggregation || 'count'
      }];

      const result = await this.executeQuery({
        view,
        metrics,
        filters,
        fromTimestamp: from,
        toTimestamp: to,
        chartType: 'LINE_TIME_SERIES'
      });

      if (result.success && result.data.chartData) {
        const totalCount = result.data.value || 
          result.data.chartData.reduce((sum, p) => sum + (p.y || 0), 0);
        
        return {
          count: totalCount,
          chartData: result.data.chartData
        };
      }

      // 실패시 빈 데이터 반환 (더미 데이터 없음)
      return {
        count: 0,
        chartData: []
      };
      
    } catch (error) {
      console.error('메트릭 미리보기 실패:', error);
      
      return {
        count: 0,
        chartData: []
      };
    }
  }

  /**
   * GET /filter-options/traces
   * Traces 필터 옵션 조회
   */
  async getTraceFilterOptions() {
    try {
      console.log('Trace 필터 옵션 조회');
      
      const data = await this.callTRPCAsREST('traces.filterOptions', 'GET', {
        projectId: this.projectId
      });

      console.log('Trace 필터 옵션:', data);

      return {
        success: true,
        data: data || {
          name: [],
          userId: [],
          sessionId: [],
          release: [],
          version: [],
          tags: [],
          scores: []
        }
      };
      
    } catch (error) {
      console.error('Trace 필터 옵션 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * GET /filter-options/environment
   * 환경 필터 옵션 조회
   */
  async getEnvironmentFilterOptions() {
    try {
      console.log('환경 필터 옵션 조회');
      
      const data = await this.callTRPCAsREST('projects.environmentFilterOptions', 'GET', {
        projectId: this.projectId
      });

      console.log('환경 필터 옵션:', data);

      return {
        success: true,
        data: data || {
          environments: [],
          tags: [],
          models: [],
          promptNames: []
        }
      };
      
    } catch (error) {
      console.error('환경 필터 옵션 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * GET /dashboards
   * 대시보드 목록 조회
   */
  async getDashboards(page = 0, limit = 100) {
    try {
      console.log('대시보드 목록 조회');
      
      const data = await this.callTRPCAsREST('dashboard.allDashboards', 'GET', {
        projectId: this.projectId,
        page,
        limit,
        orderBy: { column: 'updatedAt', order: 'DESC' }
      });

      console.log('대시보드 목록:', data);

      return {
        success: true,
        data: data?.dashboards || [],
        meta: {
          totalCount: data?.totalCount || 0,
          hasMore: data?.hasMore || false
        }
      };
      
    } catch (error) {
      console.error('대시보드 목록 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // ============================================
  // 유틸리티 메서드들
  // ============================================

  /**
   * 컴포넌트 차트 타입 → API 차트 타입
   */
  convertChartTypeToAPI(type) {
    const mapping = {
      'line': 'LINE_TIME_SERIES',
      'bar': 'BAR_CHART',
      'area': 'LINE_TIME_SERIES',
      'number': 'NUMBER',
      'table': 'TABLE'
    };
    return mapping[type] || 'NUMBER';
  }

  /**
   * API 차트 타입 → 컴포넌트 차트 타입
   */
  convertChartTypeToComponent(type) {
    const mapping = {
      'LINE_TIME_SERIES': 'line',
      'BAR_CHART': 'bar',
      'NUMBER': 'number',
      'TABLE': 'table',
      'PIE_CHART': 'pie'
    };
    return mapping[type] || 'line';
  }

  getAvailableViews() {
    return [
      { value: 'traces', label: 'Traces' },
      { value: 'observations', label: 'Observations' },
      { value: 'scores-numeric', label: 'Numeric Scores' },
      { value: 'scores-categorical', label: 'Categorical Scores' },
    ];
  }

  getAvailableChartTypes() {
    return [
      { value: 'line', label: 'Line Chart' },
      { value: 'bar', label: 'Bar Chart' },
      { value: 'area', label: 'Area Chart' },
      { value: 'number', label: 'Number' },
      { value: 'table', label: 'Table' },
    ];
  }

  getAggregationTypes() {
    return [
      { value: 'count', label: 'Count' },
      { value: 'avg', label: 'Average' },
      { value: 'sum', label: 'Sum' },
      { value: 'min', label: 'Min' },
      { value: 'max', label: 'Max' },
      { value: 'p50', label: 'Median (P50)' },
      { value: 'p90', label: 'P90' },
      { value: 'p95', label: 'P95' },
      { value: 'p99', label: 'P99' },
    ];
  }

  validateWidgetConfig(config) {
    const errors = [];
    if (!config.name?.trim()) errors.push('위젯 이름을 입력해주세요.');
    if (!config.view) errors.push('View를 선택해주세요.');
    if (!config.chartType) errors.push('차트 타입을 선택해주세요.');
    if (!config.metrics?.length) errors.push('최소 하나의 메트릭을 선택해주세요.');
    return { isValid: errors.length === 0, errors };
  }

  /**
   * 연결 테스트
   */
  async testConnection() {
    try {
      console.log('API 연결 테스트 시작');
      const result = await this.getWidgets(1, 1);
      console.log('API 연결 테스트 결과:', result.success);
      return result.success || false;
    } catch (error) {
      console.error('API 연결 테스트 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
const widgetAPI = new WidgetAPI();
export default widgetAPI;