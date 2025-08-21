// widgetAPI.js
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/public',
  PUBLIC_KEY: 'pk-lf-7dd75dec-5710-4b49-a386-f0040c855eac',
  SECRET_KEY: 'sk-lf-f37e4449-4ae5-49ec-8eac-f4ebbd6b6ffe', // 전체 Secret Key를 여기에 입력하세요
  PROJECT_ID: 'your-project-id-here' // 프로젝트 ID가 별도로 있다면 입력
};

class WidgetAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.publicKey = API_CONFIG.PUBLIC_KEY;
    this.secretKey = API_CONFIG.SECRET_KEY;
    this.projectId = API_CONFIG.PROJECT_ID;
  }

  // 공통 헤더 설정 (Basic Auth 또는 Bearer Token 방식)
  getHeaders() {
    // Langfuse는 보통 Basic Auth를 사용합니다
    const credentials = btoa(`${this.publicKey}:${this.secretKey}`);
    
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }

  // 트레이스 목록 가져오기 (위젯 대신)
  async getWidgets(page = 1, limit = 50) {
    try {
      // Langfuse API의 실제 엔드포인트 사용
      const response = await fetch(`${this.baseURL}/traces?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Langfuse traces 데이터를 위젯 형태로 변환
      const formattedData = (data.data || []).map(trace => ({
        id: trace.id,
        name: trace.name || `Trace ${trace.id.slice(0, 8)}`,
        description: trace.metadata?.description || `Trace from ${trace.timestamp}`,
        viewType: 'Trace',
        chartType: trace.metadata?.chartType || 'Timeline',
        createdAt: trace.timestamp,
        updatedAt: trace.timestamp,
        userId: trace.userId,
        sessionId: trace.sessionId
      }));

      return {
        success: true,
        data: formattedData,
        meta: data.meta || {},
        totalItems: data.meta?.totalItems || 0,
        currentPage: page,
        totalPages: Math.ceil((data.meta?.totalItems || 0) / limit)
      };
    } catch (error) {
      console.error('트레이스 목록 가져오기 오류:', error);
      
      // 개발용 더미 데이터 반환
      return {
        success: false,
        error: error.message,
        data: [
          {
            id: 'trace-1',
            name: 'Chat Completion Trace',
            description: 'OpenAI GPT-4 chat completion trace',
            viewType: 'Trace',
            chartType: 'Timeline',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'trace-2', 
            name: 'Function Call Trace',
            description: 'Function calling with tools',
            viewType: 'Trace',
            chartType: 'Flow',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'trace-3',
            name: 'Multi-step Agent',
            description: 'Agent workflow with multiple steps',
            viewType: 'Session',
            chartType: 'Graph',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        meta: {
          totalItems: 3,
          currentPage: page,
          totalPages: 1
        },
        totalItems: 3,
        currentPage: page,
        totalPages: 1
      };
    }
  }

  // 세션 목록 가져오기
  async getSessions(page = 1, limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/sessions?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`세션 목록 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('세션 목록 오류:', error);
      throw error;
    }
  }

  // 관찰 데이터 가져오기
  async getObservations(page = 1, limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/observations?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`관찰 데이터 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('관찰 데이터 오류:', error);
      throw error;
    }
  }

  // 트레이스 생성
  async createTrace(traceData) {
    try {
      const response = await fetch(`${this.baseURL}/traces`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(traceData)
      });

      if (!response.ok) {
        throw new Error(`트레이스 생성 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('트레이스 생성 오류:', error);
      throw error;
    }
  }

  // 트레이스 수정
  async updateTrace(traceId, traceData) {
    try {
      const response = await fetch(`${this.baseURL}/traces/${traceId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(traceData)
      });

      if (!response.ok) {
        throw new Error(`트레이스 수정 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('트레이스 수정 오류:', error);
      throw error;
    }
  }

  // 특정 트레이스 가져오기
  async getTrace(traceId) {
    try {
      const response = await fetch(`${this.baseURL}/traces/${traceId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`트레이스 조회 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('트레이스 조회 오류:', error);
      throw error;
    }
  }

  // API 연결 테스트
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/traces?limit=1`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('API 연결 테스트 오류:', error);
      return false;
    }
  }

  // 점수 데이터 가져오기
  async getScores(page = 1, limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/scores?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`점수 데이터 오류: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('점수 데이터 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const widgetAPI = new WidgetAPI();

export default widgetAPI;