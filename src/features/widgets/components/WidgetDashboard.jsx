// src/features/widgets/components/WidgetDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import widgetAPI from "../services/widgetAPI.js";
import "../css/WidgetDashboard.css";

const WidgetDashboard = () => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);

  // 데이터 로드 함수
  const loadWidgets = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await widgetAPI.getWidgets(currentPage, itemsPerPage);

      setWidgets(result.data);
      setTotalPages(result.totalPages);

      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 및 페이지 변경 시 데이터 로드
  useEffect(() => {
    loadWidgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 페이지당 아이템 수 변경
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // 새 위젯 생성
  const handleNewWidget = () => {
    navigate("/widgets/new");
  };

  // 행/이름 클릭 → 편집으로 이동
  const handleRowClick = (widget) => {
    const id = widget.id || widget.widgetId;
    if (!id) return;
    navigate(`/widgets/${id}/edit`, { state: { widget } });
  };

  // 탭 이동
  const goDashboards = () => navigate("/dashboards");
  const goWidgets = () => navigate("/widgets");

  // 삭제 확인 모달 열기
  const handleDeleteClick = (widget) => {
    setWidgetToDelete(widget);
    setShowDeleteConfirm(true);
  };

  // 위젯 삭제
  const handleDeleteWidget = async () => {
    if (!widgetToDelete) return;

    try {
      const result = await widgetAPI.deleteWidget(widgetToDelete.id);
      if (result.success) {
        await loadWidgets();
        setShowDeleteConfirm(false);
        setWidgetToDelete(null);
      } else {
        alert("위젯 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("위젯 삭제 중 오류가 발생했습니다.");
    }
  };

  // 삭제 취소
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setWidgetToDelete(null);
  };

  if (loading) {
    return (
      <div className="widget-dashboard">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="widget-dashboard">
      {/* 헤더 */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Widgets</h1>
          <div className="info-icon">?</div>
        </div>
        <button className="new-widget-btn" onClick={handleNewWidget}>
          + New widget
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <div className="tab-border">
          {/* ✅ 클릭 시 라우팅 */}
          <button className="tab-btn" onClick={goDashboards}>
            Dashboards
          </button>
          <button className="tab-btn active" onClick={goWidgets}>
            Widgets
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 테이블 */}
      <div className="table-container">
        <table className="widget-table">
          <thead className="table-header">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>View Type</th>
              <th>Chart Type</th>
              <th>Created At</th>
              <th className="sortable-header">Updated At ↓</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {widgets.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  No results.
                </td>
              </tr>
            ) : (
              widgets.map((widget, index) => (
                <tr key={widget.id || index} className="table-row">
                  <td className="table-cell">
                    {/* ✅ 이름 클릭 → 편집 이동 */}
                    <button
                      className="link-like"
                      onClick={() => handleRowClick(widget)}
                      title="Edit widget"
                    >
                      {widget.name || widget.id || "-"}
                    </button>
                  </td>
                  <td className="table-cell">{widget.description || "-"}</td>
                  <td className="table-cell">
                    {widget.viewType || widget.view || "-"}
                  </td>
                  <td className="table-cell">{widget.chartType || "-"}</td>
                  <td className="table-cell">{formatDate(widget.createdAt)}</td>
                  <td className="table-cell">{formatDate(widget.updatedAt)}</td>
                  <td className="table-cell">
                    {/* ✅ 연필 아이콘으로도 편집 이동 */}
                    <button
                      className="action-btn"
                      onClick={() => handleRowClick(widget)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(widget)}
                      title="위젯 삭제"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="pagination-container">
        <div className="rows-per-page">
          <span>Rows per page</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="rows-select"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="pagination-info">
            Page {currentPage} of {totalPages || 1}
          </span>

          <div className="pagination-buttons">
            <button
              className="page-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              ≪
            </button>
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              ›
            </button>
            <button
              className="page-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              ≫
            </button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>위젯 삭제 확인</h3>
            <p>
              정말로 "{widgetToDelete?.name || widgetToDelete?.id}" 위젯을
              삭제하시겠습니까?
            </p>
            <p className="warning-text">이 작업은 되돌릴 수 없습니다.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                취소
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleDeleteWidget}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetDashboard;
