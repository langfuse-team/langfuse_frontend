// src/services/widgetAPI.js
// Langfuse tRPC API 완전 호환 버전

const API_CONFIG = {
  BASE_URL: "", // 빈 문자열로 설정 (프록시 사용)
  PROJECT_ID:
    import.meta.env.VITE_LANGFUSE_PROJECT_ID || "cmel2hq340006qw07qiudmntk",
};

class WidgetAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.projectId = API_CONFIG.PROJECT_ID;
  }

  // 공통 헤더
  getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * tRPC GET 요청 (배치 형식)
   */
  async callTRPCGet(endpoint, data = null) {
    try {
      const input = {
        json: data,
        meta:
          data && Object.keys(data).some((key) => data[key] === undefined)
            ? {
                values: Object.keys(data)
                  .filter((key) => data[key] === undefined)
                  .reduce((acc, key) => ({ ...acc, [key]: ["undefined"] }), {}),
              }
            : undefined,
      };

      const params = new URLSearchParams({
        input: JSON.stringify(input),
      });

      const response = await fetch(
        `${this.baseURL}/api/trpc/${endpoint}?${params}`,
        {
          method: "GET",
          headers: this.getHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `tRPC GET 오류 (${endpoint}):`,
          response.status,
          errorText
        );
        throw new Error(`API 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result?.result?.data?.json || result?.result?.data || result;
    } catch (error) {
      console.error(`tRPC GET 요청 실패 (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * tRPC POST 요청
   */
  async callTRPCPost(endpoint, data = null) {
    try {
      const body = data ? { json: data } : undefined;

      const response = await fetch(`${this.baseURL}/api/trpc/${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `tRPC POST 오류 (${endpoint}):`,
          response.status,
          errorText
        );
        throw new Error(`API 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result?.result?.data?.json || result?.result?.data || result;
    } catch (error) {
      console.error(`tRPC POST 요청 실패 (${endpoint}):`, error);
      throw error;
    }
  }

  // ============================================
  // Widget CRUD Operations
  // ============================================

  /**
   * 위젯 목록 조회 - dashboardWidgets.all
   */
  async getWidgets(currentPage = 1, itemsPerPage = 50) {
    try {
      console.log("위젯 목록 조회 시작:", { currentPage, itemsPerPage });

      const page = currentPage - 1; // 0-based pagination

      const data = await this.callTRPCGet("dashboardWidgets.all", {
        projectId: this.projectId,
        page,
        limit: itemsPerPage,
        orderBy: { column: "updatedAt", order: "DESC" },
      });

      if (!data) {
        throw new Error("위젯 데이터를 받지 못했습니다");
      }

      console.log("위젯 데이터 수신:", data);
      console.log("첫 번째 위젯 원본 데이터:", data.widgets?.[0]);

      const widgets = (data.widgets || []).map((widget) => {
        console.log("위젯 변환 중:", {
          id: widget.id,
          name: widget.name,
          query: widget.query,
          chartConfig: widget.chartConfig,
          view: widget.view,
        });

        return {
          id: widget.id,
          name: widget.name || "Unnamed Widget",
          description: widget.description || "",
          // query 객체에서 데이터 추출
          viewType: widget.query?.view || widget.view || "traces",
          chartType: this.convertChartTypeToComponent(
            widget.query?.chartConfig?.type ||
              widget.chartConfig?.type ||
              widget.chartType ||
              "LINE_TIME_SERIES"
          ),
          createdAt: widget.createdAt,
          updatedAt: widget.updatedAt,
          // 원본 데이터도 보관 (디버깅용)
          rawData: widget,
        };
      });

      console.log("변환된 위젯 데이터:", widgets);

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
          hasMore: data.hasMore || false,
        },
      };
    } catch (error) {
      console.error("위젯 목록 조회 실패:", error);

      return {
        success: false,
        error: error.message,
        data: [],
        totalItems: 0,
        currentPage: currentPage,
        totalPages: 0,
      };
    }
  }

  /**
   * 위젯 생성 - dashboardWidgets.create
   */
  async createWidget(widgetData) {
    try {
      console.log("위젯 생성 요청:", widgetData);

      // dimensions 변환 (빈 배열이라도 반드시 배열이어야 함)
      const dimensions =
        Array.isArray(widgetData.dimensions) && widgetData.dimensions.length > 0
          ? this.convertDimensionsToAPI(widgetData.dimensions)
          : [];

      // metrics 변환 (반드시 배열이어야 함)
      const metrics =
        Array.isArray(widgetData.metrics) && widgetData.metrics.length > 0
          ? this.convertMetricsToAPI(widgetData.metrics)
          : [{ measure: "count", agg: "count" }]; // agg로 변경!

      // filters 변환 (빈 배열이라도 반드시 배열이어야 함)
      const filters = Array.isArray(widgetData.filters)
        ? widgetData.filters
        : [];

      // view 확실히 설정
      const view = widgetData.view || "traces";

      // chartType 확실히 변환
      const chartType = this.convertChartTypeToAPI(
        widgetData.chartType || "line"
      );

      // Langfuse API 형식에 정확히 맞게 변환
      const payload = {
        projectId: this.projectId,
        dashboardId: widgetData.dashboardId || null,
        name: widgetData.name || "New Widget",
        description: widgetData.description || "",
        view: view, // 최상위 레벨에도 view 추가
        dimensions: dimensions, // 최상위 레벨에도 dimensions 추가
        metrics: metrics, // 최상위 레벨에도 metrics 추가
        filters: filters, // 최상위 레벨에도 filters 추가
        chartType: chartType, // 최상위 레벨에 chartType 추가
        chartConfig: {
          type: chartType,
          ...(chartType === "PIVOT_TABLE"
            ? {
                dimensions: [],
                row_limit: 100,
                defaultSort: null,
              }
            : {}),
        },
        timeDimension: this.isTimeSeriesChart(chartType)
          ? { granularity: "auto" }
          : null,
        fromTimestamp:
          widgetData.dateRange?.from?.toISOString() ||
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        toTimestamp:
          widgetData.dateRange?.to?.toISOString() || new Date().toISOString(),
        orderBy: null,
        position: widgetData.position || {
          x: 0,
          y: 0,
          width: 4,
          height: 3,
        },
      };

      console.log("위젯 생성 페이로드:", JSON.stringify(payload, null, 2));

      const data = await this.callTRPCPost("dashboardWidgets.create", payload);

      if (!data) {
        throw new Error("위젯 생성 응답을 받지 못했습니다");
      }

      console.log("위젯 생성 성공:", data);

      return {
        success: true,
        widget: data,
        data: data,
      };
    } catch (error) {
      console.error("위젯 생성 실패:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 위젯 삭제 - dashboardWidgets.delete
   */
  async deleteWidget(widgetId) {
    try {
      console.log("위젯 삭제 요청:", widgetId);

      const data = await this.callTRPCPost("dashboardWidgets.delete", {
        projectId: this.projectId,
        widgetId: widgetId,
      });

      console.log("위젯 삭제 성공");

      return {
        success: true,
        message: "위젯이 삭제되었습니다.",
      };
    } catch (error) {
      console.error("위젯 삭제 실패:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Dashboard Query Execution
  // ============================================

  /**
   * 대시보드 쿼리 실행 - dashboard.executeQuery
   */
  async executeQuery({
    view = "traces",
    dimensions = [],
    metrics = [{ measure: "count", agg: "count" }], // agg로 변경!
    filters = [],
    fromTimestamp,
    toTimestamp,
    chartType = "LINE_TIME_SERIES",
    timeDimension = null,
  }) {
    try {
      console.log("쿼리 실행:", { view, metrics, chartType });

      const query = {
        projectId: this.projectId,
        query: {
          view,
          dimensions: this.convertDimensionsToAPI(dimensions),
          metrics: this.convertMetricsToAPI(metrics),
          filters,
          timeDimension:
            timeDimension ||
            (this.isTimeSeriesChart(chartType)
              ? { granularity: "auto" }
              : null),
          fromTimestamp:
            fromTimestamp ||
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          toTimestamp: toTimestamp || new Date().toISOString(),
          orderBy: null,
          chartConfig: this.buildChartConfig(chartType),
        },
      };

      console.log("쿼리 실행 페이로드:", JSON.stringify(query, null, 2));

      const data = await this.callTRPCGet("dashboard.executeQuery", query);

      if (!data) {
        throw new Error("쿼리 실행 결과를 받지 못했습니다");
      }

      console.log("쿼리 실행 결과:", data);

      return {
        success: true,
        data: {
          value: data.value || 0,
          chartType: data.chartType,
          chartData: data.chartData || [],
        },
      };
    } catch (error) {
      console.error("쿼리 실행 실패:", error);

      return {
        success: false,
        error: error.message,
        data: {
          value: 0,
          chartData: [],
        },
      };
    }
  }

  /**
   * 미리보기용 메트릭 데이터 조회
   */
  async getMetricsPreview({
    view = "traces",
    from,
    to,
    interval = "day",
    filters = [],
    metric = "count",
    aggregation = "count",
  }) {
    try {
      console.log("메트릭 미리보기:", { view, metric, aggregation });

      const metrics = [
        {
          measure: metric === "count" ? "count" : metric,
          agg: aggregation || "count", // agg로 변경!
        },
      ];

      const result = await this.executeQuery({
        view,
        metrics,
        filters,
        fromTimestamp: from,
        toTimestamp: to,
        chartType: "LINE_TIME_SERIES",
        timeDimension: { granularity: "auto" },
      });

      if (result.success && result.data.chartData) {
        const totalCount =
          result.data.value ||
          result.data.chartData.reduce((sum, p) => sum + (p.y || 0), 0);

        return {
          count: totalCount,
          chartData: result.data.chartData,
        };
      }

      return {
        count: 0,
        chartData: [],
      };
    } catch (error) {
      console.error("메트릭 미리보기 실패:", error);

      return {
        count: 0,
        chartData: [],
      };
    }
  }

  // ============================================
  // Filter Options
  // ============================================

  /**
   * Traces 필터 옵션 조회 - traces.filterOptions
   */
  async getTraceFilterOptions() {
    try {
      console.log("Trace 필터 옵션 조회");

      const data = await this.callTRPCGet("traces.filterOptions", {
        projectId: this.projectId,
      });

      console.log("Trace 필터 옵션:", data);

      return {
        success: true,
        data: data || {},
      };
    } catch (error) {
      console.error("Trace 필터 옵션 조회 실패:", error);

      return {
        success: false,
        error: error.message,
        data: {},
      };
    }
  }

  /**
   * 환경 필터 옵션 조회 - projects.environmentFilterOptions
   */
  async getEnvironmentFilterOptions() {
    try {
      console.log("환경 필터 옵션 조회");

      const data = await this.callTRPCGet("projects.environmentFilterOptions", {
        projectId: this.projectId,
      });

      console.log("환경 필터 옵션:", data);

      return {
        success: true,
        data: data || {},
      };
    } catch (error) {
      console.error("환경 필터 옵션 조회 실패:", error);

      return {
        success: false,
        error: error.message,
        data: {},
      };
    }
  }

  // ============================================
  // Utility Methods - API 형식 변환
  // ============================================

  /**
   * Dimensions 배열을 API 형식으로 변환
   */
  convertDimensionsToAPI(dimensions) {
    if (!Array.isArray(dimensions)) {
      return [];
    }

    return dimensions.map((dim) => {
      if (typeof dim === "string") {
        return { field: dim };
      }
      return { field: dim.field || dim };
    });
  }

  /**
   * Metrics 배열을 API 형식으로 변환
   */
  convertMetricsToAPI(metrics) {
    if (!Array.isArray(metrics)) {
      return [{ measure: "count", agg: "count" }]; // agg로 변경!
    }

    return metrics.map((metric) => ({
      measure: metric.columnId || metric.measure || "count",
      agg: metric.aggregation || metric.agg || "count", // agg로 변경!
    }));
  }

  /**
   * TimeDimension 설정
   */
  getTimeDimension(widgetData) {
    if (this.isTimeSeriesChart(widgetData.chartType)) {
      return { granularity: "auto" };
    }
    return null;
  }

  /**
   * ChartConfig 구성
   */
  getChartConfig(widgetData) {
    const chartType = this.convertChartTypeToAPI(widgetData.chartType);

    const config = {
      type: chartType,
    };

    // PIVOT_TABLE인 경우 추가 설정
    if (chartType === "PIVOT_TABLE") {
      config.dimensions = [];
      config.row_limit = 100;
      config.defaultSort = undefined;
    }

    return config;
  }

  /**
   * ChartConfig 빌드 (쿼리 실행용)
   */
  buildChartConfig(chartType) {
    const config = {
      type: chartType,
    };

    if (chartType === "PIVOT_TABLE") {
      config.dimensions = [];
      config.row_limit = 100;
      config.defaultSort = undefined;
    }

    return config;
  }

  /**
   * 시계열 차트인지 확인
   */
  isTimeSeriesChart(chartType) {
    const timeSeriesTypes = [
      "line",
      "bar",
      "area",
      "LINE_TIME_SERIES",
      "BAR_TIME_SERIES",
      "VERTICAL_BAR",
    ];
    return timeSeriesTypes.includes(chartType);
  }

  /**
   * 컴포넌트 차트 타입 → API 차트 타입
   */
  convertChartTypeToAPI(type) {
    const mapping = {
      line: "LINE_TIME_SERIES",
      "vertical-bar": "VERTICAL_BAR", // VERTICAL_BAR로 수정
      bar: "VERTICAL_BAR", // VERTICAL_BAR로 수정
      area: "LINE_TIME_SERIES",
      number: "NUMBER",
      "horizontal-bar": "HORIZONTAL_BAR",
      histogram: "HISTOGRAM",
      pie: "PIE",
      table: "PIVOT_TABLE",
    };
    return mapping[type] || "NUMBER";
  }

  /**
   * API 차트 타입 → 컴포넌트 차트 타입
   */
  convertChartTypeToComponent(type) {
    const mapping = {
      LINE_TIME_SERIES: "line",
      BAR_TIME_SERIES: "bar",
      VERTICAL_BAR: "bar", // VERTICAL_BAR 추가
      NUMBER: "number",
      HORIZONTAL_BAR: "horizontal-bar",
      HISTOGRAM: "histogram",
      PIE: "pie",
      PIVOT_TABLE: "table",
    };
    return mapping[type] || "line";
  }

  // ============================================
  // Static Data Methods (unchanged)
  // ============================================

  getAvailableViews() {
    return [
      { value: "traces", label: "Traces" },
      { value: "observations", label: "Observations" },
      { value: "scores-numeric", label: "Numeric Scores" },
      { value: "scores-categorical", label: "Categorical Scores" },
    ];
  }

  getAvailableChartTypes() {
    return [
      { value: "line", label: "Line Chart" },
      { value: "bar", label: "Bar Chart" },
      { value: "area", label: "Area Chart" },
      { value: "number", label: "Number" },
      { value: "table", label: "Table" },
    ];
  }

  getAggregationTypes() {
    return [
      { value: "count", label: "Count" },
      { value: "avg", label: "Average" },
      { value: "sum", label: "Sum" },
      { value: "min", label: "Min" },
      { value: "max", label: "Max" },
      { value: "p50", label: "Median (P50)" },
      { value: "p90", label: "P90" },
      { value: "p95", label: "P95" },
      { value: "p99", label: "P99" },
    ];
  }

  validateWidgetConfig(config) {
    const errors = [];
    if (!config.name?.trim()) errors.push("위젯 이름을 입력해주세요.");
    if (!config.view) errors.push("View를 선택해주세요.");
    if (!config.chartType) errors.push("차트 타입을 선택해주세요.");
    if (!config.metrics?.length)
      errors.push("최소 하나의 메트릭을 선택해주세요.");
    return { isValid: errors.length === 0, errors };
  }

  /**
   * 연결 테스트
   */
  async testConnection() {
    try {
      console.log("API 연결 테스트 시작");
      const result = await this.getWidgets(1, 1);
      console.log("API 연결 테스트 결과:", result.success);
      return result.success || false;
    } catch (error) {
      console.error("API 연결 테스트 실패:", error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
const widgetAPI = new WidgetAPI();
export default widgetAPI;
