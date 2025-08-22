import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function NewDashboardPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // State for new dashboard
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleCreateDashboard = async () => {
    if (!dashboardName.trim()) {
      alert('Dashboard name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: API 연동 시 실제 API 호출로 교체
      // const response = await createDashboardAPI({
      //   projectId,
      //   name: dashboardName,
      //   description: dashboardDescription,
      // });
      
      // Mock API 응답 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDashboardId = `dashboard-${Date.now()}`;
      
      alert(`Dashboard "${dashboardName}" created successfully!`);
      
      // Navigate to the newly created dashboard
      navigate(`/project/${projectId}/dashboards/${mockDashboardId}`);
      
    } catch (error) {
      alert('Error creating dashboard: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/project/${projectId}/dashboards`);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px',
        marginBottom: '24px',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Create Dashboard
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666',
              fontSize: '0.9rem'
            }}>
              Create a new dashboard for your project
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDashboard}
              disabled={!dashboardName.trim() || isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: (!dashboardName.trim() || isLoading) ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!dashboardName.trim() || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label 
            htmlFor="dashboard-name"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#333'
            }}
          >
            Dashboard Name *
          </label>
          <input
            id="dashboard-name"
            type="text"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="Enter dashboard name"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.875rem',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#007bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(0,123,255,0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ccc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label 
            htmlFor="dashboard-description"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#333'
            }}
          >
            Description
          </label>
          <textarea
            id="dashboard-description"
            value={dashboardDescription}
            onChange={(e) => setDashboardDescription(e.target.value)}
            placeholder="Describe the purpose of this dashboard. Optional, but very helpful."
            rows={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.875rem',
              resize: 'vertical',
              transition: 'border-color 0.2s',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#007bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(0,123,255,0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ccc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#666',
            lineHeight: '1.4'
          }}>
            💡 <strong>Tip:</strong> After creating the dashboard, you can add widgets to visualize your data.
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NewDashboardPage;