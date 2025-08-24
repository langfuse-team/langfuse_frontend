import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardAPI, { utils } from '../services/dashboardAPI';

// 편집 다이얼로그 컴포넌트 (간단 버전)
function EditDashboardDialog({ 
  open, 
  onClose, 
  dashboard, 
  onSave 
}) {
  const [name, setName] = useState(dashboard?.name || '');
  const [description, setDescription] = useState(dashboard?.description || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name || '');
      setDescription(dashboard.description || '');
    }
  }, [dashboard]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Dashboard name is required');
      return;
    }
    
    setLoading(true);
    try {
      const result = dashboard?.id 
        ? await onSave('update', dashboard.id, name, description)
        : await onSave('create', null, name, description);
        
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Failed to save dashboard');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90vw'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {dashboard?.id ? 'Edit Dashboard' : 'Create Dashboard'}
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Dashboard Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Dashboard"
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this dashboard. Optional, but very helpful."
            rows={4}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : (dashboard?.id ? 'Save Changes' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// 액션 드롭다운 컴포넌트
function ActionsDropdown({ dashboard, onEdit, onClone, onDelete, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    setIsOpen(false);
    if (disabled) return;
    
    switch (action) {
      case 'edit':
        onEdit(dashboard);
        break;
      case 'clone':
        onClone(dashboard);
        break;
      case 'delete':
        onDelete(dashboard);
        break;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '4px 8px',
          opacity: disabled ? 0.5 : 1
        }}
      >
        ⋮
      </button>
      
      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 100,
          minWidth: '120px'
        }}>
          {utils.isDashboardEditable(dashboard) && (
            <button
              onClick={() => handleAction('edit')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'white',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              ✏️ Edit
            </button>
          )}
          <button
            onClick={() => handleAction('clone')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              backgroundColor: 'white',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            📋 Clone
          </button>
          {utils.isDashboardEditable(dashboard) && (
            <button
              onClick={() => handleAction('delete')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'red'
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// 메인 DashboardTable 컴포넌트
function DashboardTable() {
  const [dashboards, setDashboards] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 데이터 로딩
  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('대시보드 목록 로딩 시작...');
      const result = await dashboardAPI.getAllDashboards();
      
      if (result.success && Array.isArray(result.data)) {
        console.log('대시보드 데이터 수신:', result.data.length, '개');
        setDashboards(result.data);
      } else {
        console.warn('데이터 형식 오류:', result);
        setDashboards([]);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('대시보드 로딩 실패:', err);
      setError(`Failed to load dashboards: ${err.message}`);
      setDashboards([]);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 함수
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 데이터
  const sortedDashboards = [...dashboards].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }
    return 0;
  });

  // 액션 핸들러들
  const handleEdit = (dashboard) => {
    setEditingDashboard(dashboard);
  };

  const handleSave = async (action, dashboardId, name, description) => {
    try {
      let result;
      
      if (action === 'create') {
        console.log('새 대시보드 생성:', { name, description });
        result = await dashboardAPI.createDashboard(name, description);
        
        if (result) {
          console.log('대시보드 생성 성공:', result);
          await loadDashboards(); // 목록 새로고침
          return { success: true };
        }
      } else if (action === 'update') {
        console.log('대시보드 수정:', { dashboardId, name, description });
        result = await dashboardAPI.updateDashboard(dashboardId, name, description);
        
        if (result) {
          console.log('대시보드 수정 성공:', result);
          await loadDashboards(); // 목록 새로고침
          return { success: true };
        }
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('대시보드 저장 실패:', error);
      return { success: false, error: error.message };
    }
  };

  const handleClone = async (dashboard) => {
    try {
      console.log('대시보드 복제:', dashboard.id);
      const result = await dashboardAPI.cloneDashboard(dashboard.id);
      
      if (result) {
        console.log('대시보드 복제 성공:', result);
        alert('Dashboard cloned successfully!');
        await loadDashboards(); // 목록 새로고침
      }
    } catch (error) {
      console.error('대시보드 복제 실패:', error);
      alert(`Failed to clone dashboard: ${error.message}`);
    }
  };

  const handleDelete = async (dashboard) => {
    if (!confirm(`Are you sure you want to delete "${dashboard.name}"?`)) {
      return;
    }
    
    try {
      console.log('대시보드 삭제:', dashboard.id);
      const result = await dashboardAPI.deleteDashboard(dashboard.id);
      
      if (result) {
        console.log('대시보드 삭제 성공');
        alert('Dashboard deleted successfully!');
        await loadDashboards(); // 목록 새로고침
      }
    } catch (error) {
      console.error('대시보드 삭제 실패:', error);
      alert(`Failed to delete dashboard: ${error.message}`);
    }
  };

  const handleCreateNew = () => {
    setEditingDashboard({}); // 빈 객체로 생성 모드
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading dashboards...</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Connecting to Langfuse API...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          ❌ {error}
        </div>
        <button
          onClick={loadDashboards}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          재시도
        </button>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
          💡 Langfuse 서버 (localhost:3000)가 실행 중인지 확인하세요
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 상단 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <div>
          <h1>Dashboards</h1>
          <div style={{ fontSize: '14px', color: '#666' }}>
            📊 총 {dashboards.length}개 대시보드 | 🔌 Langfuse API 연동됨
          </div>
        </div>
        
        <div>
          <button
            onClick={loadDashboards}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 새로고침
          </button>
          
          <button
            onClick={handleCreateNew}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + New dashboard
          </button>
        </div>
      </div>

      {/* 테이블 */}
      {dashboards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          📋 아직 생성된 대시보드가 없습니다.
          <br />
          <br />
          <button
            onClick={handleCreateNew}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            첫 번째 대시보드 생성하기
          </button>
        </div>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #eee'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th 
                onClick={() => handleSort('name')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px',
                borderBottom: '1px solid #eee'
              }}>
                Description
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px',
                borderBottom: '1px solid #eee'
              }}>
                Owner
              </th>
              <th 
                onClick={() => handleSort('createdAt')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Created At {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('updatedAt')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Updated At {sortConfig.key === 'updatedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px',
                borderBottom: '1px solid #eee'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDashboards.map(dashboard => (
              <tr key={dashboard.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  <Link 
                    to={`/dashboards/${dashboard.id}`}
                    style={{ 
                      color: '#007bff', 
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    {dashboard.name}
                  </Link>
                </td>
                <td style={{ padding: '12px', maxWidth: '300px' }}>
                  {dashboard.description || <em style={{ color: '#999' }}>No description</em>}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {dashboard.owner === 'LANGFUSE' ? (
                      <>🪢 Langfuse</>
                    ) : (
                      <>👤 Project</>
                    )}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {utils.formatDate(dashboard.createdAt)}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {utils.formatDate(dashboard.updatedAt)}
                </td>
                <td style={{ padding: '12px' }}>
                  <ActionsDropdown
                    dashboard={dashboard}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 편집 다이얼로그 */}
      <EditDashboardDialog
        open={!!editingDashboard}
        onClose={() => setEditingDashboard(null)}
        dashboard={editingDashboard}
        onSave={handleSave}
      />
    </div>
  );
}

export default DashboardTable;