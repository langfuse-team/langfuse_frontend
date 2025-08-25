import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// 새로운 API 구조 사용
import { dashboardAPI, widgetAPI, utils, commonUtils } from "../services";

// 분리된 컴포넌트들 import
import DashboardCard from "../components/cards/DashboardCard";
import {
  DASHBOARD_TEMPLATES,
  getTemplateKey,
} from "../components/templates/DashboardTemplates";

// 기존 차트 컴포넌트들 import
import TotalMetric from "../components/TotalMetric";
import BaseTimeSeriesChart from "../components/BaseTimeSeriesChart";
import LatencyChart from "../components/LatencyChart";
import TracesBarListChart from "../components/TracesBarListChart";
import ModelUsageChart from "../components/ModelUsageChart";
import UserChart from "../components/UserChart";
import ModelCostTable from "../components/ModelCostTable";

// 실제 API를 적용할 컴포넌트 목록 (단계적 적용)
const REAL_API_COMPONENTS = ["TotalMetric"]; // 먼저 TotalMetric만 실제 API 적용

// 컴포넌트 매핑 (템플릿에서 사용)
const COMPONENT_MAP = {
  TotalMetric,
  BaseTimeSeriesChart,
  LatencyChart,
  TracesBarListChart,
  ModelUsageChart,
  UserChart,
  ModelCostTable,
};

// DashboardWidget 컴포넌트 수정 버전
function DashboardWidget({ widget, widgetData, dateRange }) {
  const Component = COMPONENT_MAP[widget.component];
  const data = widgetData[widget.id] || { isLoading: true };

  if (!Component) {
    return (
      <DashboardCard
        title={widget.title}
        description={widget.description}
        isLoading={false}
      >
        <div
          style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            border: "1px dashed #ccc",
            borderRadius: "4px",
          }}
        >
          <div className="text-center">
            <div>⚠️ Component not found</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              {widget.component}
            </div>
          </div>
        </div>
      </DashboardCard>
    );
  }

  // API 상태에 따른 표시
  const getStatusIndicator = () => {
    const useRealAPI = REAL_API_COMPONENTS.includes(widget.component);
    
    if (import.meta.env.DEV) {
      if (useRealAPI) {
        if (data.apiStatus === 'success') return '🟢 Real API';
        if (data.apiStatus === 'failed') return '🔴 API Failed';
        return '🟡 API Loading';
      } else {
        if (data.isEmpty) return '⚪ Empty';
        if (data.apiStatus === 'mock') return '🔵 Mock Data';
        return '⚪ Pending';
      }
    }
    return null;
  };

  // 데이터 검증 함수 개선
  const validateComponentData = (component, data) => {
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
        return Array.isArray(data.chartData) && 
               data.chartData.length > 0 &&
               data.chartData.every(item => 
                 item && typeof item.date !== 'undefined' && typeof item.value !== 'undefined'
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

   // 컴포넌트에 전달할 데이터 준비
   const getComponentData = () => {
    if (data.error) return null;
    if (data.isEmpty) return null;
    if (data.isLoading) return null;

    switch (widget.component) {
      case 'TotalMetric':
        return data.value !== undefined ? data.value : 0;
      
      case 'BaseTimeSeriesChart':
      case 'TracesBarListChart':
      case 'ModelUsageChart':
      case 'UserChart':
      case 'LatencyChart':
      case 'ModelCostTable':
        return Array.isArray(data.chartData) ? data.chartData : [];
      
      default:
        return data.chartData || data.value || data;
    }
  };

  const componentData = getComponentData();
  const isDataValid = validateComponentData(widget.component, data);

  return (
    <DashboardCard
      title={widget.title}
      description={widget.description}
      isLoading={data.isLoading}
      headerRight={getStatusIndicator()}
    >
      {data.error ? (
        <div
          style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "red",
            flexDirection: "column",
          }}
        >
          <div>❌ Error</div>
          <div
            style={{ fontSize: "12px", marginTop: "4px", textAlign: "center" }}
          >
            {data.error}
          </div>
        </div>
      ) : data.isEmpty ? (
        <div
          style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📊</div>
          <div>No data available</div>
          <div style={{ fontSize: "12px", marginTop: "4px" }}>
            API integration pending
          </div>
        </div>
      ) : !isDataValid ? (
        <div
          style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ff6b35",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⚠️</div>
          <div>Invalid data format</div>
          <div style={{ fontSize: "12px", marginTop: "4px", textAlign: "center" }}>
            Component: {widget.component}
            <br />
            Expected format mismatch
          </div>
        </div>
      ) : data.isLoading ? (
        <div
          style={{
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}
        >
          <div>⏳ Loading...</div>
        </div>
      ) : (
        <Component
          data={componentData}
          isLoading={data.isLoading}
          dateRange={dateRange}
          title={widget.title}
          config={data.config}
        />
      )}
    </DashboardCard>
  );
}
// 메인 DashboardDetailPage 컴포넌트
function DashboardDetailPage() {
  const { dashboardId } = useParams();

  // 상태 관리
  const [dashboard, setDashboard] = useState(null);
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("Past 7 days");

  // 개선된 헬퍼 함수들
  const getDateRangeDays = (range) => {
    const daysMap = {
      "Past 7 days": 7,
      "Past 30 days": 30,
      "Past 90 days": 90,
      "Past year": 365,
    };
    return daysMap[range] || 7;
  };

  const getAggregationType = (queryType) => {
    switch (queryType) {
      case "count":
        return "count";
      case "timeseries":
        return "count";
      case "group-by":
        return "sum";
      case "percentile-timeseries":
        return "p95";
      case "avg-group":
        return "avg";
      case "max-group":
        return "max";
      default:
        return "count";
    }
  };

  const getChartConfigType = (component) => {
    switch (component) {
      case "TotalMetric":
        return "NUMBER";
      case "BaseTimeSeriesChart":
        return "BAR_TIME_SERIES";
      case "TracesBarListChart":
        return "BAR_CHART";
      case "LatencyChart":
        return "LINE_TIME_SERIES";
      case "ModelUsageChart":
        return "BAR_CHART";
      case "UserChart":
        return "PIE_CHART";
      default:
        return "NUMBER";
    }
  };

  // 실제 API 응답을 컴포넌트에 맞는 형태로 변환
  const transformWidgetData = (widget, apiData) => {
    console.log(`데이터 변환 (${widget.id}):`, apiData);

    if (!Array.isArray(apiData) || apiData.length === 0) {
      return { value: 0, chartData: [] };
    }

    switch (widget.component) {
      case "TotalMetric": {
        // API 응답: [{"count_count": "369"}]
        const firstRow = apiData[0];
        const countKey = Object.keys(firstRow).find((key) =>
          key.includes("count")
        );
        const value = countKey ? parseInt(firstRow[countKey]) : 0;
        return { value };
      }

      case "BaseTimeSeriesChart": {
        // 시계열 데이터 변환
        if (apiData.length > 1 || (apiData[0] && apiData[0].time_dimension)) {
          // 실제 시계열 데이터가 있는 경우
          return {
            chartData: apiData.map((row) => ({
              date: row.time_dimension || row.date || "Unknown",
              value: parseInt(Object.values(row).find((v) => !isNaN(v))) || 0,
            })),
          };
        } else {
          // 단일 값인 경우 목업 시계열 생성
          const baseValue = parseInt(Object.values(apiData[0])[0]) || 0;
          return {
            chartData: Array.from({ length: 7 }, (_, i) => ({
              date: `8/${18 + i}/25`,
              value: Math.max(
                0,
                baseValue + Math.floor((Math.random() - 0.5) * baseValue * 0.3)
              ),
            })),
          };
        }
      }

      case "TracesBarListChart": {
        // 그룹화된 데이터 변환
        if (apiData.length > 1) {
          return {
            chartData: apiData.slice(0, 10).map((row, index) => ({
              name:
                row.name || row.group || row.environment || `Item ${index + 1}`,
              value: parseInt(Object.values(row).find((v) => !isNaN(v))) || 0,
              percentage: Math.floor(Math.random() * 100),
            })),
          };
        } else {
          // 단일 값인 경우 목업 그룹 데이터
          const baseValue = parseInt(Object.values(apiData[0])[0]) || 0;
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
        if (apiData.length > 1 || (apiData[0] && apiData[0].time_dimension)) {
          return {
            chartData: apiData.map((row) => ({
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
          chartData: apiData.slice(0, 8).map((row, index) => ({
            name: row.name || row.model || row.user || `Item ${index + 1}`,
            value: parseInt(Object.values(row).find((v) => !isNaN(v))) || 0,
            color:
              commonUtils.getChartColors()[
                index % commonUtils.getChartColors().length
              ],
          })),
        };
      }

      case "ModelCostTable": {
        // 테이블 데이터 변환
        return {
          chartData: apiData.slice(0, 20).map((row, index) => ({
            model: row.model || `Model ${index + 1}`,
            usage: parseInt(row.usage) || Math.floor(Math.random() * 10000),
            cost: parseFloat(row.cost) || (Math.random() * 100).toFixed(2),
            percentage: Math.floor(Math.random() * 100),
          })),
        };
      }

      default:
        return {
          value: parseInt(Object.values(apiData[0])[0]) || 0,
          chartData: apiData,
        };
    }
  };

  // 목업 데이터 생성 (API 실패 시 폴백용) - 개선된 버전
  const generateMockData = (widget) => {
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

  // 위젯 데이터 로딩 함수 수정
  const loadWidgetData = async (widgets, filters = {}) => {
    console.log(
      "위젯 데이터 로딩 시작 (선택적 API 적용):",
      widgets.length,
      "개"
    );

    const { fromTimestamp, toTimestamp } = commonUtils.getDateRange(
      getDateRangeDays(filters.dateRange || "Past 7 days")
    );

    // 모든 위젯을 로딩 상태로 초기화
    const initialWidgetData = {};
    widgets.forEach((widget) => {
      initialWidgetData[widget.id] = { isLoading: true };
    });
    setWidgetData(initialWidgetData);

    // 각 위젯의 데이터를 순차적으로 로딩
    for (const widget of widgets) {
      try {
        console.log(`위젯 처리: ${widget.id} (${widget.component})`);

        // 실제 API를 적용할 컴포넌트인지 확인
        const useRealAPI = REAL_API_COMPONENTS.includes(widget.component);

        if (useRealAPI) {
          console.log(`실제 API 사용: ${widget.id}`);

          // 위젯 설정을 widgetAPI에 맞는 형태로 구성
          const widgetConfig = {
            id: widget.id,
            name: widget.title,
            view: widget.target || "traces",
            chartType: getChartConfigType(widget.component),
            dimensions: widget.groupBy ? [{ field: widget.groupBy }] : [],
            metrics: [
              {
                measure: widget.metric || "count",
                aggregation: getAggregationType(widget.queryType),
              },
            ],
            filters: [],
            chartConfig: {
              type: getChartConfigType(widget.component),
              row_limit: widget.limit || 100,
            },
          };

          try {
            const result = await widgetAPI.executeWidgetQuery(
              widgetConfig,
              fromTimestamp,
              toTimestamp
            );

            if (result.success && result.data) {
              console.log(`실제 API 데이터 수신 (${widget.id}):`, result.data);

              const transformedData = transformWidgetData(widget, result.data);

              setWidgetData((prev) => ({
                ...prev,
                [widget.id]: {
                  ...transformedData,
                  isLoading: false,
                  isMockData: false,
                  apiStatus: "success",
                },
              }));
            } else {
              throw new Error(result.error || "No data received");
            }
          } catch (apiError) {
            console.error(`실제 API 호출 실패 (${widget.id}):`, apiError);

            // API 실패 시에도 목업 데이터로 폴백
            const mockData = generateMockData(widget);
            setWidgetData((prev) => ({
              ...prev,
              [widget.id]: {
                ...mockData,
                isLoading: false,
                isMockData: true,
                apiStatus: "failed",
                error: apiError.message,
              },
            }));
          }
        } else {
          // 아직 실제 API를 적용하지 않는 컴포넌트들
          console.log(`목업 데이터 사용: ${widget.id}`);

          // 컴포넌트 타입에 따라 다른 처리
          if (widget.component === "ModelCostTable") {
            // 테이블은 빈 상태로
            setWidgetData((prev) => ({
              ...prev,
              [widget.id]: {
                chartData: [],
                isLoading: false,
                isEmpty: true,
                apiStatus: "pending",
              },
            }));
          } else {
            // 다른 차트들은 목업 데이터
            const mockData = generateMockData(widget);
            setWidgetData((prev) => ({
              ...prev,
              [widget.id]: {
                ...mockData,
                isLoading: false,
                isMockData: true,
                apiStatus: "mock",
              },
            }));
          }
        }

        // 로딩 간격 (UX 개선)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (widgetError) {
        console.error(`위젯 데이터 로딩 실패 (${widget.id}):`, widgetError);
        setWidgetData((prev) => ({
          ...prev,
          [widget.id]: {
            isLoading: false,
            error: widgetError.message,
            apiStatus: "error",
          },
        }));
      }
    }

    console.log("모든 위젯 데이터 로딩 완료");
  };

  // 데이터 로딩
  useEffect(() => {
    loadDashboardData();
  }, [dashboardId]);

  // 날짜 범위 변경 시 위젯 데이터 다시 로딩
  useEffect(() => {
    if (dashboard && !loading) {
      const templateKey = getTemplateKey(dashboard, dashboardId);
      if (templateKey && DASHBOARD_TEMPLATES[templateKey]) {
        console.log("날짜 범위 변경으로 위젯 데이터 갱신:", dateRange);
        loadWidgetData(DASHBOARD_TEMPLATES[templateKey].widgets, { dateRange });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("대시보드 로딩:", dashboardId);

      // 1. 대시보드 기본 정보 로딩
      const dashboardResult = await dashboardAPI.getDashboard(dashboardId);

      if (dashboardResult.success) {
        setDashboard(dashboardResult.data);
        console.log("대시보드 정보:", dashboardResult.data);

        // 2. 템플릿 확인 및 위젯 데이터 로딩
        const templateKey = getTemplateKey(dashboardResult.data, dashboardId);
        if (templateKey && DASHBOARD_TEMPLATES[templateKey]) {
          console.log("템플릿 매칭:", templateKey);
          const template = DASHBOARD_TEMPLATES[templateKey];
          console.log(`위젯 ${template.widgets.length}개 로딩 시작`);

          await loadWidgetData(template.widgets, { dateRange });
        } else {
          console.log("사용자 생성 대시보드 - 위젯팀 연동 필요");
        }
      } else {
        throw new Error(dashboardResult.error || "Dashboard not found");
      }
    } catch (err) {
      console.error("대시보드 로딩 실패:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneDashboard = async () => {
    try {
      const result = await dashboardAPI.cloneDashboard(dashboardId);
      if (result.success) {
        alert("대시보드가 복제되었습니다!");
      } else {
        alert(`복제 실패: ${result.error}`);
      }
    } catch (cloneError) {
      alert(`복제 실패: ${cloneError.message}`);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
        }}
      >
        <div style={{ marginBottom: "16px" }}>⏳ Loading dashboard...</div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Dashboard ID: {dashboardId}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
        }}
      >
        <div style={{ color: "red", marginBottom: "16px" }}>❌ {error}</div>
        <div style={{ marginBottom: "16px" }}>
          <Link
            to="/dashboards"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            ← Back to Dashboards
          </Link>
        </div>
        <button
          onClick={loadDashboardData}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
        }}
      >
        <div style={{ marginBottom: "16px" }}>📋 Dashboard not found</div>
        <Link
          to="/dashboards"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          ← Back to Dashboards
        </Link>
      </div>
    );
  }

  // 템플릿 정보 가져오기
  const templateKey = getTemplateKey(dashboard, dashboardId);
  const template = templateKey ? DASHBOARD_TEMPLATES[templateKey] : null;

  const canEdit = utils.isDashboardEditable(dashboard);

  return (
    <div style={{ padding: "20px" }}>
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "8px" }}>
            <Link
              to="/dashboards"
              style={{
                color: "#666",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              ← Dashboards
            </Link>
          </div>
          <h1 style={{ margin: 0 }}>
            {template?.name || dashboard.name}
            {dashboard.owner === "LANGFUSE" && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginLeft: "12px",
                  fontWeight: "normal",
                }}
              >
                (Langfuse Maintained)
              </span>
            )}
          </h1>
          {(template?.description || dashboard.description) && (
            <p style={{ margin: "4px 0 0 0", color: "#666" }}>
              {template?.description || dashboard.description}
            </p>
          )}
          <div
            style={{
              fontSize: "12px",
              color: "#999",
              marginTop: "8px",
            }}
          >
            {template && `📊 ${template.widgets.length} widgets`} | Created:{" "}
            {utils.formatDate(dashboard.createdAt)} | Updated:{" "}
            {utils.formatDate(dashboard.updatedAt)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleCloneDashboard}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            📋 Clone
          </button>
        </div>
      </div>
      {/* 필터 */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "white",
            minWidth: "120px",
          }}
        >
          <option>Past 7 days</option>
          <option>Past 30 days</option>
          <option>Past 90 days</option>
          <option>Past year</option>
        </select>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            fontSize: "14px",
            color: "#666",
          }}
        >
          📅 {dateRange}
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Filters ▼
        </button>
      </div>
      {/* 위젯 그리드 */}
      {template ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "16px",
            minHeight: "400px",
          }}
        >
          {template.widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                gridColumn: `span ${widget.span}`,
                minHeight: "200px",
              }}
            >
              <DashboardWidget
                widget={widget}
                widgetData={widgetData}
                dateRange={dateRange}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            color: "#666",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📊</div>
          <h3 style={{ margin: "0 0 8px 0" }}>사용자 생성 대시보드</h3>
          <p style={{ margin: "0 0 16px 0", textAlign: "center" }}>
            위젯팀과 협업하여 동적 위젯 시스템 연동 필요
          </p>
          {canEdit && (
            <button
              onClick={() => alert("위젯팀 협업 후 구현 예정")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              위젯 관리
            </button>
          )}
        </div>
      )}
      // 개발 정보 표시도 수정 (기존 코드의 맨 아래 부분)
      {import.meta.env.DEV && (
        <div
          style={{
            marginTop: "40px",
            padding: "16px",
            backgroundColor: "#f0f8ff",
            borderRadius: "4px",
            border: "1px solid #e0f0ff",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#0066cc" }}>
            🔧 단계적 API 연동 진행중
          </h4>
          <div style={{ fontSize: "12px", fontFamily: "monospace" }}>
            ✅ 실제 API 적용: {REAL_API_COMPONENTS.join(", ")}
            <br />
            📊 총 위젯: {Object.keys(widgetData).length}개
            <br />
            🟢 실제 API:{" "}
            {
              Object.values(widgetData).filter((w) => w.apiStatus === "success")
                .length
            }
            개
            <br />
            🔴 API 실패:{" "}
            {
              Object.values(widgetData).filter((w) => w.apiStatus === "failed")
                .length
            }
            개
            <br />
            🔵 목업 데이터:{" "}
            {
              Object.values(widgetData).filter((w) => w.apiStatus === "mock")
                .length
            }
            개
            <br />⚪ 빈 상태:{" "}
            {Object.values(widgetData).filter((w) => w.isEmpty).length}개
            <br />
            <br />
            <strong>다음 단계:</strong>
            <br />
            1. TotalMetric API 연동 확인 후
            <br />
            2. REAL_API_COMPONENTS에 다른 컴포넌트들 추가
            <br />
            3. 예: ['TotalMetric', 'BaseTimeSeriesChart']
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDetailPage;
