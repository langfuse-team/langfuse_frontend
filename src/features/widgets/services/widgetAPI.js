// src/services/widgetAPI.js
// Langfuse Public API 연동 (환경변수 사용) — Open API만 사용
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_LANGFUSE_BASE_URL || '/api/public',
  PUBLIC_KEY: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  SECRET_KEY: import.meta.env.VITE_LANGFUSE_SECRET_KEY,
  PROJECT_ID: import.meta.env.VITE_LANGFUSE_PROJECT_ID,
};

class WidgetAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.publicKey = API_CONFIG.PUBLIC_KEY;
    this.secretKey = API_CONFIG.SECRET_KEY;
    this.projectId = API_CONFIG.PROJECT_ID;
  }

  // 공통 헤더 (Basic Auth + project 보강)
  getHeaders() {
    const credentials = btoa(`${this.publicKey}:${this.secretKey}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-langfuse-project-id': this.projectId,
    };
  }

  /**
   * 미리보기용 시계열(실데이터): Open API의 /traces 만 이용해서
   * from~to 사이를 일(day) 단위로 버킷팅하여 count 시계열을 만든다.
   * (내부/가변 엔드포인트인 /metrics*, /metrics/timeseries 는 전혀 사용하지 않음)
   */
  async getPreviewTimeseriesFromTraces({
    from, // ISO string
    to,   // ISO string
    interval = 'day', // 현재 day만 사용
    filters = [],     // [{column, operator, value}] — 서버가 무시할 수도 있어, 클라에서 범위 필터링도 수행
  } = {}) {
    const headers = this.getHeaders();

    const start = new Date(from);
    const end   = new Date(to);

    const keyOf   = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
    const labelOf = (d) => d.toISOString().slice(5, 10); //   MM-DD

    // 기간의 day 버킷 초기화
    const days = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const buckets = new Map(days.map(dt => [keyOf(dt), 0]));

    // traces 페이지네이션 수집
    let page = 1;
    const limit = 100;
    const MAX_PAGES = 10;

    const inRange = (ts) => {
      const t = new Date(ts).getTime();
      return t >= start.getTime() && t <= end.getTime();
    };

    for (let i = 0; i < MAX_PAGES; i++) {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      // 서버가 필터를 지원한다면 전달(무시될 수도 있음)
      if (filters && filters.length) qs.set('filters', JSON.stringify(filters));

      const res = await fetch(`${this.baseURL}/traces?${qs}`, { method: 'GET', headers });
      if (!res.ok) break;

      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];

      for (const t of rows) {
        const ts = t.timestamp || t.startTime || t.createdAt || t.start_time || t.started_at;
        if (!ts || !inRange(ts)) continue;
        const k = keyOf(new Date(ts));
        buckets.set(k, (buckets.get(k) || 0) + 1); // count
      }

      const totalPages = json?.meta?.totalPages || 1;
      if (page >= totalPages) break;
      page += 1;
    }

    const chartData = days.map(dt => ({ date: labelOf(dt), value: buckets.get(keyOf(dt)) || 0 }));
    const count = chartData.reduce((s, p) => s + p.value, 0);
    return { count, chartData };
  }

  // 위젯 목록 가져오기 - 트레이스 데이터를 위젯처럼 변환 (Open API /traces)
  async getWidgets(page = 1, limit = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseURL}/traces?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        let errText = `API 오류: ${response.status} - ${response.statusText}`;
        try {
          const text = await response.text();
          if (text) {
            try {
              const j = JSON.parse(text);
              errText += `\n${j.message || text}`;
            } catch {
              errText += `\n${text}`;
            }
          }
        } catch {}
        throw new Error(errText);
      }

      const data = await response.json();

      // 로컬 위젯(생성 API가 없어서 임시 저장)
      const localWidgets = JSON.parse(localStorage.getItem('lf_custom_widgets') || '[]');

      // 트레이스를 위젯형으로 맵핑
      const traceWidgets = (data.data || []).map((trace) => {
        const created =
          trace.timestamp ||
          trace.startTime ||
          trace.createdAt ||
          trace.start_time ||
          trace.started_at;
        const updated =
          trace.updatedAt ||
          trace.endTime ||
          trace.timestamp ||
          created;

        return {
          id: trace.id,
          name: trace.name || `Trace ${String(trace.id).slice(0, 8)}`,
          description: created ? `Trace from ${new Date(created).toLocaleString()}` : 'Trace',
          viewType: 'traces',
          chartType: 'line',
          createdAt: created,
          updatedAt: updated,
        };
      });

      const widgets = [...localWidgets, ...traceWidgets];

      return {
        success: true,
        data: widgets,
        meta: data.meta || {},
        totalItems: data.meta?.totalItems || 0,
        currentPage: data.meta?.page || page,
        totalPages:
          data.meta?.totalPages || Math.ceil((data.meta?.totalItems || 0) / limit),
      };
    } catch (error) {
      console.error('위젯 목록 가져오기 오류:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        meta: { totalItems: 0, currentPage: page, totalPages: 0 },
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      };
    }
  }

  // 위젯 "저장" - 퍼블릭 REST에 위젯 생성 API가 없으므로 임시로 로컬 저장
  async createWidget(widgetData) {
    try {
      const KEY = 'lf_custom_widgets';
      const current = JSON.parse(localStorage.getItem(KEY) || '[]');
      const now = new Date().toISOString();
      const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      const saved = {
        id,
        name: widgetData.name || 'New Widget',
        description: widgetData.description || '',
        viewType: widgetData.view || 'traces',
        chartType: widgetData.chartType || 'line',
        createdAt: now,
        updatedAt: now,
        _local: true,
      };

      localStorage.setItem(KEY, JSON.stringify([saved, ...current]));
      return { success: true, widget: saved };
    } catch (e) {
      console.error('로컬 위젯 저장 오류:', e);
      return { success: false, error: e.message };
    }
  }

  // 삭제: 로컬 위젯 → localStorage 제거, 그 외 → 트레이스 삭제(Open API)
  async deleteWidget(widgetId) {
    try {
      if (String(widgetId).startsWith('local-')) {
        const KEY = 'lf_custom_widgets';
        const current = JSON.parse(localStorage.getItem(KEY) || '[]');
        const next = current.filter((w) => w.id !== widgetId);
        localStorage.setItem(KEY, JSON.stringify(next));
        return { success: true, message: '로컬 위젯이 삭제되었습니다.' };
      }

      const resp = await fetch(`${this.baseURL}/traces/${widgetId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (resp.status === 204 || resp.ok) {
        return { success: true, message: '트레이스(위젯)가 삭제되었습니다.' };
      }

      let errMsg = `삭제 실패: ${resp.status}`;
      try {
        const hasBody = resp.headers.get('content-length') !== '0';
        if (hasBody) {
          const j = await resp.json();
          if (j?.message) errMsg = j.message;
        }
      } catch {}
      return { success: false, error: errMsg };
    } catch (e) {
      console.error('삭제 오류:', e);
      return { success: false, error: e.message };
    }
  }

  // 기타 Open API 보조 조회
  async getTraces(page = 1, limit = 50, filters = []) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (filters.length > 0) params.append('filters', JSON.stringify(filters));

      const response = await fetch(`${this.baseURL}/traces?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error(`트레이스 조회 오류: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('트레이스 조회 오류:', error);
      throw error;
    }
  }

  async getSessions(page = 1, limit = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseURL}/sessions?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error(`세션 조회 오류: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('세션 조회 오류:', error);
      throw error;
    }
  }

  async getObservations(page = 1, limit = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseURL}/observations?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error(`관찰 데이터 조회 오류: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('관찰 데이터 조회 오류:', error);
      throw error;
    }
  }

  async getScores(page = 1, limit = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseURL}/scores?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error(`점수 데이터 조회 오류: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('점수 데이터 조회 오류:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('API 연결 테스트 오류:', error);
      return false;
    }
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
      { value: 'p50', label: 'Median (P50)'},
      { value: 'p90', label: 'P90' },
      { value: 'p95', label: 'P95' },
      { value: 'p99', label: 'P99' },
    ];
  }

  validateWidgetConfig(config) {
    const errors = [];
    if (!config.name || config.name.trim() === '') errors.push('위젯 이름을 입력해주세요.');
    if (!config.view) errors.push('View를 선택해주세요.');
    if (!config.chartType) errors.push('차트 타입을 선택해주세요.');
    if (!config.metrics || config.metrics.length === 0) errors.push('최소 하나의 메트릭을 선택해주세요.');
    return { isValid: errors.length === 0, errors };
  }
}

// 싱글톤 인스턴스
const widgetAPI = new WidgetAPI();
export default widgetAPI;
