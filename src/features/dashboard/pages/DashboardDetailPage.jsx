import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// Mock 데이터들
const mockDashboard = {
  id: '1',
  name: 'My Custom Dashboard',
  description: 'Showcase how to create your own dashboard.',
  owner: 'PROJECT'
};

const mockWidgets = [
  {
    id: 'widget-1',
    name: 'Count (Traces)',
    description: 'Shows the count of Traces',
    chartType: 'BIG_NUMBER',
    data: { value: 349, label: 'Total Traces' }
  },
  {
    id: 'widget-2', 
    name: 'Count (Observations)',
    description: 'Shows the count of Observations',
    chartType: 'BIG_NUMBER',
    data: { value: '2.05K', label: 'Total Observations' }
  },
  {
    id: 'widget-3',
    name: 'Sum Output Tokens Per Second by Prompt',
    description: 'Shows the sum output tokens/s by prompt',
    chartType: 'LINE_TIME_SERIES',
    data: [
      { date: '8/15/25', value1: 1500, value2: 500, value3: 0 },
      { date: '8/18/25', value1: 1800, value2: 600, value3: 0 },
      { date: '8/21/25', value1: 1200, value2: 400, value3: 0 }
    ]
  },
  {
    id: 'widget-4',
    name: 'P 75 Value by Name (Scores Numeric)',
    description: 'Shows the p 75 value of Scores Numeric filtered by Name', 
    chartType: 'LINE_CHART',
    data: [
      { category: '8/15/25', blue: 0.5, yellow: 0.4, red: 0.2 },
      { category: '8/17/25', blue: 0.55, yellow: 0.35, red: 0.22 },
      { category: '8/19/25', blue: 0.45, yellow: 0.45, red: 0.25 },
      { category: '8/21/25', blue: 0.6, yellow: 0.7, red: 0.23 }
    ]
  },
  {
    id: 'widget-5',
    name: 'Sum Total Cost by User Id (Traces)',
    description: 'Shows the sum totalcost of Traces by user id',
    chartType: 'BAR_CHART',
    data: [
      { user: 'u-rzLMsF1', cost: 0.012 },
      { user: 'u-QZqk7MB', cost: 0.008 },
      { user: 'u-Cmt2MsK', cost: 0.006 }
    ]
  },
  {
    id: 'widget-6',
    name: 'P 90 Latency by User Id (Traces)',
    description: 'Shows the p 90 latency of Traces by user id',
    chartType: 'HORIZONTAL_BAR',
    data: [
      { user: 'u-rzLMsF1', latency: 850 },
      { user: 'u-QZqk7MB', latency: 720 },
      { user: 'u-Cmt2MsK', latency: 650 },
      { user: 'u-XvP2R8N', latency: 580 }
    ]
  }
];

// Mock 위젯 배치 정보 (react-grid-layout 형식) - 나중에 구현 예정
// const mockWidgetPlacements = [
//   { id: 'widget-1', x: 0, y: 0, w: 3, h: 3 },
//   { id: 'widget-2', x: 3, y: 0, w: 3, h: 3 },
//   { id: 'widget-3', x: 6, y: 0, w: 6, h: 4 },
//   { id: 'widget-4', x: 0, y: 3, w: 6, h: 4 },
//   { id: 'widget-5', x: 6, y: 4, w: 3, h: 4 },
//   { id: 'widget-6', x: 9, y: 4, w: 3, h: 4 }
// ];

// 간단한 차트 컴포넌트들 (플레이스홀더)
function BigNumberChart({ data }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
        {data.value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
        {data.label}
      </div>
    </div>
  );
}

function LineChart({ data }) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed #ccc',
      borderRadius: '4px',
      background: '#f9f9f9'
    }}>
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div>📈 Line Chart</div>
        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
          {data.length} data points
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed #ccc',
      borderRadius: '4px',
      background: '#f9f9f9'
    }}>
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div>📊 Bar Chart</div>
        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
          {data.length} items
        </div>
      </div>
    </div>
  );
}

// 위젯 컴포넌트
function MockWidget({ widget, onEdit, onDelete, canEdit }) {
  const renderChart = () => {
    switch (widget.chartType) {
      case 'BIG_NUMBER':
        return <BigNumberChart data={widget.data} />;
      case 'LINE_TIME_SERIES':
      case 'LINE_CHART':
        return <LineChart data={widget.data} />;
      case 'BAR_CHART':
      case 'HORIZONTAL_BAR':
        return <BarChart data={widget.data} />;
      default:
        return (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            📊 {widget.chartType}
          </div>
        );
    }
  };

  return (
    <div style={{
      height: '100%',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: 'white',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {widget.name}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.875rem',
            color: '#666',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {widget.description}
          </p>
        </div>

        {/* 액션 버튼들 */}
        {canEdit && (
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            <button
              onClick={() => onEdit(widget)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#666'
              }}
              title="Edit widget"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(widget)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#999'
              }}
              title="Delete widget"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 차트 영역 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {renderChart()}
      </div>
    </div>
  );
}

// 위젯 선택 다이얼로그
function SelectWidgetDialog({ open, onClose, onSelectWidget }) {
  const [selectedWidget, setSelectedWidget] = useState(null);

  const availableWidgets = [
    { id: 'new-1', name: 'User Activity', description: 'Track user interactions', chartType: 'LINE_CHART' },
    { id: 'new-2', name: 'Error Rate', description: 'Monitor system errors', chartType: 'BAR_CHART' },
    { id: 'new-3', name: 'Response Time', description: 'Average response time', chartType: 'BIG_NUMBER' }
  ];

  if (!open) return null;

  const handleAddWidget = () => {
    if (selectedWidget) {
      onSelectWidget(selectedWidget);
      onClose();
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
        padding: '24px',
        borderRadius: '8px',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Select widget to add</h2>
        
        {availableWidgets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No widgets found. Create a new widget to get started.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Chart Type</th>
              </tr>
            </thead>
            <tbody>
              {availableWidgets.map(widget => (
                <tr 
                  key={widget.id}
                  onClick={() => setSelectedWidget(widget)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedWidget?.id === widget.id ? '#f0f0f0' : 'transparent',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <td style={{ padding: '12px 8px', fontWeight: '500' }}>{widget.name}</td>
                  <td style={{ padding: '12px 8px' }}>{widget.description}</td>
                  <td style={{ padding: '12px 8px' }}>{widget.chartType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '24px'
        }}>
          <button
            onClick={() => alert('Navigate to Create New Widget')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ➕ Create New Widget
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
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
              onClick={handleAddWidget}
              disabled={!selectedWidget}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedWidget ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedWidget ? 'pointer' : 'not-allowed'
              }}
            >
              Add Selected Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 Dashboard 상세 페이지
function DashboardDetailPage() {
  const { dashboardId } = useParams();
  const [widgets, setWidgets] = useState(mockWidgets);
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Past 7 days');

  const canEdit = true; // Mock 권한

  const handleAddWidget = () => {
    setIsWidgetDialogOpen(true);
  };

  const handleSelectWidget = (newWidget) => {
    const widget = {
      id: `widget-${Date.now()}`,
      name: newWidget.name,
      description: newWidget.description,
      chartType: newWidget.chartType,
      data: { value: 'New Data', label: 'Sample' },
      dashboardId: dashboardId // dashboardId 활용
    };
    setWidgets(prev => [...prev, widget]);
    alert(`Widget added to dashboard ${dashboardId}!`);
  };

  const handleEditWidget = (widget) => {
    alert(`Edit widget: ${widget.name} (Dashboard: ${dashboardId})`);
  };

  const handleDeleteWidget = (widget) => {
    if (confirm(`Delete widget "${widget.name}" from dashboard ${dashboardId}?`)) {
      setWidgets(prev => prev.filter(w => w.id !== widget.id));
      alert('Widget deleted successfully!');
    }
  };

  const handleCloneDashboard = () => {
    alert(`Dashboard ${dashboardId} cloned successfully!`);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>
            {mockDashboard.name} (ID: {dashboardId})
            {mockDashboard.owner === 'LANGFUSE' ? ' (Langfuse Maintained)' : ''}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            {mockDashboard.description}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <button
              onClick={handleAddWidget}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ➕ Add Widget
            </button>
          )}
          <button
            onClick={handleCloneDashboard}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📋 Clone
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          <option>Past 7 days</option>
          <option>Past 30 days</option>
          <option>Past 90 days</option>
        </select>
        
        <button
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Filters
        </button>
      </div>

      {/* 위젯 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        minHeight: '400px'
      }}>
        {widgets.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            color: '#666'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No widgets yet</h3>
            <p style={{ margin: '0 0 16px 0', textAlign: 'center' }}>
              Add widgets to visualize your data
            </p>
            <button
              onClick={handleAddWidget}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Your First Widget
            </button>
          </div>
        ) : (
          widgets.map(widget => (
            <div key={widget.id} style={{ minHeight: '200px' }}>
              <MockWidget
                widget={widget}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
                canEdit={canEdit}
              />
            </div>
          ))
        )}
      </div>

      {/* 위젯 선택 다이얼로그 */}
      <SelectWidgetDialog
        open={isWidgetDialogOpen}
        onClose={() => setIsWidgetDialogOpen(false)}
        onSelectWidget={handleSelectWidget}
      />
    </div>
  );
}

export default DashboardDetailPage;