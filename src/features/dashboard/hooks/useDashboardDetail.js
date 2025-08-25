import { useState, useEffect } from 'react';
import { dashboardAPI, widgetAPI, commonUtils } from '../services';
import { getTemplateKey, DASHBOARD_TEMPLATES } from '../components/templates/DashboardTemplates';
import { transformWidgetData, generateMockData } from '../utils/widget-data-transform';
import { getDateRangeDays, getAggregationType, getChartConfigType } from '../utils/dashboard-helpers';

// 실제 API를 적용할 컴포넌트 목록 (단계적 적용)
const REAL_API_COMPONENTS = ["TotalMetric", "BaseTimeSeriesChart"];

export const useDashboardDetail = (dashboardId) => {
  // 상태 관리
  const [dashboard, setDashboard] = useState(null);
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("Past 7 days");

  // 위젯 데이터 로딩 함수
  const loadWidgetData = async (widgets, filters = {}) => {
    if (!widgets || widgets.length === 0) return;

    console.log("위젯 데이터 로딩 시작 (선택적 API 적용):", widgets.length, "개");

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

  // 대시보드 데이터 로딩
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

  // 대시보드 복제
  const handleCloneDashboard = async () => {
    try {
      const result = await dashboardAPI.cloneDashboard(dashboardId);
      if (result.success) {
        alert("대시보드가 복제되었습니다!");
        return result;
      } else {
        alert(`복제 실패: ${result.error}`);
        return result;
      }
    } catch (cloneError) {
      alert(`복제 실패: ${cloneError.message}`);
      return { success: false, error: cloneError.message };
    }
  };

  // 템플릿 정보 계산
  const getTemplateInfo = () => {
    if (!dashboard) return { templateKey: null, template: null };
    
    const templateKey = getTemplateKey(dashboard, dashboardId);
    const template = templateKey ? DASHBOARD_TEMPLATES[templateKey] : null;
    
    return { templateKey, template };
  };

  // 로딩 통계
  const getLoadingStats = () => {
    const total = Object.keys(widgetData).length;
    const success = Object.values(widgetData).filter((w) => w.apiStatus === "success").length;
    const failed = Object.values(widgetData).filter((w) => w.apiStatus === "failed").length;
    const mock = Object.values(widgetData).filter((w) => w.apiStatus === "mock").length;
    const empty = Object.values(widgetData).filter((w) => w.isEmpty).length;

    return { total, success, failed, mock, empty };
  };

  // 초기 데이터 로딩
  useEffect(() => {
    if (dashboardId) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]); // loadDashboardData는 의도적으로 제외 (무한 루프 방지)

  // 날짜 범위 변경 시 위젯 데이터 다시 로딩
  useEffect(() => {
    if (dashboard && !loading) {
      const { template } = getTemplateInfo();
      if (template && template.widgets) {
        console.log("날짜 범위 변경으로 위젯 데이터 갱신:", dateRange);
        loadWidgetData(template.widgets, { dateRange });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]); // dashboard, loading은 의도적으로 제외

  return {
    // 데이터
    dashboard,
    widgetData,
    loading,
    error,
    dateRange,
    
    // 계산된 값들
    templateInfo: getTemplateInfo(),
    loadingStats: getLoadingStats(),
    
    // 액션 함수들
    setDateRange,
    reload: loadDashboardData,
    clone: handleCloneDashboard,
    
    // API 테스트용 (개발 환경에서만)
    ...(import.meta.env.DEV && {
      _loadWidgetData: loadWidgetData,  // 직접 테스트용
      _REAL_API_COMPONENTS: REAL_API_COMPONENTS
    })
  };
};