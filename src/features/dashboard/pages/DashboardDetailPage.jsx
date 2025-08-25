import React from "react";
import { useParams, Link } from "react-router-dom";

// 새로운 Hook과 유틸 사용
import { useDashboardDetail } from "../hooks/useDashboardDetail";
import { validateComponentData } from "../utils/widget-data-transform";
import { getComponentData, getStatusIndicator, isDashboardEditable, formatDate } from "../utils/dashboard-helpers";

// 기존 컴포넌트들 import
import DashboardCard from "../components/cards/DashboardCard";

// 기존 차트 컴포넌트들 import
import TotalMetric from "../components/TotalMetric";
import BaseTimeSeriesChart from "../components/BaseTimeSeriesChart"; // 활성화!
import LatencyChart from "../components/LatencyChart";
import TracesBarListChart from "../components/TracesBarListChart";
import ModelUsageChart from "../components/ModelUsageChart";
import UserChart from "../components/UserChart";
import ModelCostTable from "../components/ModelCostTable";

// 안전한 BaseTimeSeriesChart 래퍼 컴포넌트
function SafeBaseTimeSeriesChart({ data, title, isLoading, dateRange, config }) {
  console.log('SafeBaseTimeSeriesChart 받은 props:', { 
    data, 
    title, 
    isLoading, 
    dataType: Array.isArray(data) ? 'array' : typeof data,
    dataLength: Array.isArray(data) ? data.length : 'N/A'
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <div style={{
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666"
      }}>
        ⏳ Loading chart data...
      </div>
    );
  }

  // 데이터 검증
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#999"
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📈</div>
        <div>No time series data</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Received: {typeof data} {Array.isArray(data) ? `(${data.length} items)` : ''}
        </div>
      </div>
    );
  }

  // 데이터 구조 검증
  const hasValidStructure = data.every(point => 
    point && 
    typeof point.ts !== 'undefined' && 
    Array.isArray(point.values)
  );

  if (!hasValidStructure) {
    return (
      <div style={{
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#ff6b35"
      }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⚠️</div>
        <div>Invalid data structure</div>
        <div style={{ fontSize: "12px", marginTop: "4px", textAlign: "center" }}>
          Expected: {`[{ts, values: [{label, value}]}]`}
          <br />
          Got: {JSON.stringify(data[0], null, 2).substring(0, 100)}...
        </div>
      </div>
    );
  }

  // 정상적인 BaseTimeSeriesChart 렌더링
  try {
    return (
      <BaseTimeSeriesChart
        data={data}
        agg={config?.dateRangeAgg || 'day'}
        showLegend={true}
        connectNulls={false}
        chartType="line"
      />
    );
  } catch (error) {
    console.error('BaseTimeSeriesChart 렌더링 에러:', error);
    return (
      <div style={{
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "red"
      }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>❌</div>
        <div>Chart rendering failed</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          {error.message}
        </div>
      </div>
    );
  }
}

// 컴포넌트 매핑 (템플릿에서 사용)
const COMPONENT_MAP = {
  TotalMetric,
  BaseTimeSeriesChart: SafeBaseTimeSeriesChart, // 안전한 래퍼 사용
  LatencyChart,
  TracesBarListChart,
  ModelUsageChart,
  UserChart,
  ModelCostTable,
};

// DashboardWidget 컴포넌트
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

  const componentData = getComponentData(widget, data);
  const isDataValid = validateComponentData(widget.component, data);

  // 디버깅용 로깅 - BaseTimeSeriesChart만
  if (import.meta.env.DEV && widget.component === 'BaseTimeSeriesChart') {
    console.log(`${widget.component} UI 디버깅 (${widget.id}):`, {
      data,
      componentData,
      isDataValid,
      widgetComponent: widget.component,
      dataStructure: Array.isArray(componentData) ? 
        `Array[${componentData.length}]: ${JSON.stringify(componentData[0], null, 2).substring(0, 200)}...` :
        typeof componentData
    });
  }

  return (
    <DashboardCard
      title={widget.title}
      description={widget.description}
      isLoading={data.isLoading}
      headerRight={getStatusIndicator(widget, data)}
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
      ) : componentData === null ? (
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
          <div>No data to display</div>
        </div>
      ) : (
        <>
          <Component
            {...(widget.component === 'TotalMetric' ? {
              metric: componentData
              // description 제거 - DashboardCard에서 이미 표시중
            } : {
              data: componentData
            })}
            isLoading={data.isLoading}
            dateRange={dateRange}
            title={widget.title}
            config={data.config}
          />
        </>
      )}
    </DashboardCard>
  );
}

// 메인 DashboardDetailPage 컴포넌트
function DashboardDetailPage() {
  const { dashboardId } = useParams();
  
  // 새로운 Hook 사용 - 모든 로직이 여기에 집중됨
  const {
    dashboard,
    widgetData,
    loading,
    error,
    dateRange,
    templateInfo,
    loadingStats,
    setDateRange,
    reload,
    clone
  } = useDashboardDetail(dashboardId);

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
          onClick={reload}
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

  const { template } = templateInfo;
  const canEdit = isDashboardEditable(dashboard);

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
            {formatDate(dashboard.createdAt)} | Updated:{" "}
            {formatDate(dashboard.updatedAt)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={clone}
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

      {/* 개발 정보 표시 - BaseTimeSeriesChart 테스트 정보 추가 */}
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
            🔧 단계적 API 연동 진행중 - BaseTimeSeriesChart 활성화!
          </h4>
          <div style={{ fontSize: "12px", fontFamily: "monospace" }}>
            📊 총 위젯: {loadingStats.total}개
            <br />
            🟢 실제 API: {loadingStats.success}개
            <br />
            🔴 API 실패: {loadingStats.failed}개
            <br />
            🔵 목업 데이터: {loadingStats.mock}개
            <br />
            ⚪ 빈 상태: {loadingStats.empty}개
            <br />
            <br />
            <strong>✅ 활성화된 컴포넌트:</strong>
            <br />
            • TotalMetric (실제 API 연동 완료)
            <br />
            • BaseTimeSeriesChart (새로 활성화, 안전한 래퍼 적용)
            <br />
            <br />
            <strong>🔍 BaseTimeSeriesChart 디버깅:</strong>
            <br />
            • 브라우저 콘솔에서 "BaseTimeSeriesChart" 검색으로 로그 확인
            <br />
            • 데이터 구조 검증: {`[{ts, values: [{label, value}]}]`}
            <br />
            • 에러 발생 시 SafeBaseTimeSeriesChart가 안전하게 처리
            <br />
            <br />
            <strong>API 테스트 방법:</strong>
            <br />
            1. 브라우저 콘솔에서: window.dashboardHook = useDashboardDetail('{dashboardId}')
            <br />
            2. console.log(window.dashboardHook.widgetData)
            <br />
            3. console.log(window.dashboardHook._REAL_API_COMPONENTS)
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDetailPage;