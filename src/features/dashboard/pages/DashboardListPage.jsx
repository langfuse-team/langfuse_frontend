import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock 데이터
const mockDashboards = [
  {
    id: '1',
    name: 'My Custom Dashboard',
    description: 'Showcase how to create your own dashboard.',
    owner: 'PROJECT',
    createdAt: '2025-05-21 15:41:13',
    updatedAt: '2025-08-20 09:32:53'
  },
  {
    id: '2',
    name: 'QA Dashboard',
    description: 'They build a pipeline based on the external pipeline article and have started pushing scores to traces.',
    owner: 'PROJECT',
    createdAt: '2025-06-27 03:29:11',
    updatedAt: '2025-08-07 19:17:20'
  },
  {
    id: '3',
    name: 'Langfuse Cost Dashboard (Clone)',
    description: 'Review your LLM costs.',
    owner: 'PROJECT',
    createdAt: '2025-06-26 04:35:55',
    updatedAt: '2025-07-15 08:11:06'
  },
  {
    id: '4',
    name: 'Community Demo',
    description: "Let's see what this thing can do",
    owner: 'PROJECT',
    createdAt: '2025-05-22 02:31:17',
    updatedAt: '2025-05-22 02:31:17'
  },
  {
    id: '5',
    name: 'Langfuse Cost Dashboard',
    description: 'Review your LLM costs.',
    owner: 'LANGFUSE',
    createdAt: '2025-05-21 00:38:32',
    updatedAt: '2025-05-21 01:09:56'
  },
  {
    id: '6',
    name: 'Langfuse Latency Dashboard',
    description: 'Monitor latency metrics across traces and generations for performance optimization.',
    owner: 'LANGFUSE',
    createdAt: '2025-05-20 22:36:15',
    updatedAt: '2025-05-21 00:56:46'
  }
];

// 편집 다이얼로그 컴포넌트 (간단 버전)
function EditDashboardDialog({ 
  open, 
  onClose, 
  dashboard, 
  onSave 
}) {
  const [name, setName] = useState(dashboard?.name || '');
  const [description, setDescription] = useState(dashboard?.description || '');

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert('Dashboard name is required');
      return;
    }
    
    onSave({
      id: dashboard?.id,
      name: name.trim(),
      description: description.trim()
    });
    onClose();
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
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {dashboard?.id ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 액션 드롭다운 컴포넌트
function ActionsDropdown({ dashboard, onEdit, onClone, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    setIsOpen(false);
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
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        ⋮
      </button>
      
      {isOpen && (
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
          {dashboard.owner === 'PROJECT' && (
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
          {dashboard.owner === 'PROJECT' && (
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
  const [dashboards, setDashboards] = useState(mockDashboards);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const [editingDashboard, setEditingDashboard] = useState(null);

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

  const handleSave = (dashboardData) => {
    if (dashboardData.id) {
      // 편집
      setDashboards(prev => 
        prev.map(d => d.id === dashboardData.id 
          ? { ...d, ...dashboardData, updatedAt: new Date().toISOString() }
          : d
        )
      );
      setEditingDashboard(null);
    } 
    
    alert('Dashboard saved successfully!');
  };

  const handleClone = (dashboard) => {
    const clonedDashboard = {
      ...dashboard,
      id: String(Date.now()),
      name: `${dashboard.name} (Clone)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDashboards(prev => [clonedDashboard, ...prev]);
    alert('Dashboard cloned successfully!');
  };

  const handleDelete = (dashboard) => {
    if (confirm(`Are you sure you want to delete "${dashboard.name}"?`)) {
      setDashboards(prev => prev.filter(d => d.id !== dashboard.id));
      alert('Dashboard deleted successfully!');
    }
  };

  return (
    <div>
      {/* 상단 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h1>Dashboards</h1>
        <Link to="/dashboards/new">
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            + New dashboard
          </button>
        </Link>

      </div>

      {/* 테이블 */}
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
                    textDecoration: 'none' 
                  }}
                >
                  {dashboard.name}
                </Link>
              </td>
              <td style={{ padding: '12px', maxWidth: '300px' }}>
                {dashboard.description}
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
                {dashboard.createdAt}
              </td>
              <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                {dashboard.updatedAt}
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