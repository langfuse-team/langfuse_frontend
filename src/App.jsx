// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// 새로운 폴더 구조에 맞춘 import 경로들
import DashboardListPage from './features/dashboard/pages/DashboardListPage';
import DashboardDetailPage from './features/dashboard/pages/DashboardDetailPage';
import WidgetEditPage from './features/widgets/pages/WidgetEditPage.jsx';
import PlaygroundPage1 from './features/playground1/pages/PlaygroundPage1';
import PlaygroundPage2 from './features/playground2/pages/PlaygroundPage2';

// ✅ 새로 만든 대시보드
import WidgetDashboard from './features/widgets/components/WidgetDashboard';

function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 사이드바 */}
      <nav style={{
        width: '200px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        padding: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>Langfuse</h3>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/dashboards" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/dashboards') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              Dashboard 목록
            </Link>
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            <Link to="/dashboards/sample" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/dashboards/sample') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              Dashboard 상세
            </Link>
          </li>

          <li style={{ marginBottom: '10px' }}>
            <Link to="/widgets" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/widgets') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              Widget 목록
            </Link>
          </li>

          <li style={{ marginBottom: '10px' }}>
            <Link to="/widgets/new" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/widgets/new') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              새 Widget
            </Link>
          </li>

          <li style={{ marginBottom: '10px' }}>
            <Link to="/widgets/sample" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/widgets/sample') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              Widget 편집
            </Link>
          </li>

          <li style={{ marginBottom: '10px' }}>
            <Link to="/playground1" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/playground1') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              Playground 1
            </Link>
          </li>

          <li style={{ marginBottom: '10px' }}>
            <Link to="/playground2" style={{ 
              display: 'block', 
              padding: '8px', 
              backgroundColor: isActive('/playground2') ? '#ddd' : 'white',
              border: '1px solid #ccc',
              textDecoration: 'none',
              color: 'black'
            }}>
              Playground 2
            </Link>
          </li>
        </ul>
      </nav>

      {/* 메인 */}
      <main style={{
        flex: 1,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '20px'
        }}>
          <strong>현재 페이지: {location.pathname}</strong>
        </div>
        
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboards" replace />} />
          <Route path="/dashboards" element={<DashboardListPage />} />
          <Route path="/dashboards/:dashboardId" element={<DashboardDetailPage />} />

          {/* ✅ 여기서 WidgetDashboard로 교체 */}
          <Route path="/widgets" element={<WidgetDashboard />} />
          <Route path="/widgets/:widgetId" element={<WidgetEditPage />} />
          <Route path="/widgets/new" element={<WidgetEditPage />} />

          <Route path="/playground1" element={<PlaygroundPage1 />} />
          <Route path="/playground2" element={<PlaygroundPage2 />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
