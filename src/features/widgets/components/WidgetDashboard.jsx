// WidgetDashboard.jsx
import React, { useState, useEffect } from 'react';
import widgetAPI from '../services/widgetAPI.js';
import '../css/WidgetDashboard.css';

const WidgetDashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);

  // 데이터 로드 함수
  const loadWidgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await widgetAPI.getWidgets(currentPage, itemsPerPage);
      
      setWidgets(result.data);
      setTotalPages(result.totalPages);
    //   setTotalItems(result.totalItems);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 및 페이지 변경 시 데이터 로드
  useEffect(() => {
    loadWidgets();
  }, [currentPage, itemsPerPage]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
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

  // 새 위젯 생성 (임시)
  const handleNewWidget = () => {
    alert('새 위젯 생성 기능은 추후 구현 예정입니다.');
  };

  // 위젯 액션 (임시)
  const handleWidgetAction = (widgetId) => {
    alert(`위젯 ${widgetId}에 대한 액션`);
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
          <button className="tab-btn">Dashboards</button>
          <button className="tab-btn active">Widgets</button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <strong>오류:</strong> {error}
          <br />
          <small>현재 더미 데이터로 표시되고 있습니다.</small>
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
                  <td className="table-cell">{widget.name || widget.id || '-'}</td>
                  <td className="table-cell">{widget.description || '-'}</td>
                  <td className="table-cell">{widget.viewType || '-'}</td>
                  <td className="table-cell">{widget.chartType || '-'}</td>
                  <td className="table-cell">{formatDate(widget.createdAt)}</td>
                  <td className="table-cell">{formatDate(widget.updatedAt)}</td>
                  <td className="table-cell">
                    <button 
                      className="action-btn"
                      onClick={() => handleWidgetAction(widget.id)}
                    >
                      ...
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
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
    </div>
  );
};

export default WidgetDashboard;