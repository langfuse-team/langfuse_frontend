// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import './App.css'; // CSS 파일 import

// 대시보드 관련 imports
import DashboardListPage from './features/dashboard/pages/DashboardListPage';
import DashboardDetailPage from './features/dashboard/pages/DashboardDetailPage';
import NewDashboardPage from './features/dashboard/pages/NewDashboardPage';

// 위젯 관련 imports
import WidgetEditPage from './features/widgets/pages/WidgetEditPage.jsx';
import WidgetDashboard from './features/widgets/components/WidgetDashboard';
import NewWidgetPage from './features/widgets/pages/NewWidgetPage.jsx'; // 새로 추가

// 플레이그라운드 관련 imports
import PlaygroundPage1 from './features/playground1/pages/PlaygroundPage1';
import PlaygroundPage2 from './features/playground2/pages/PlaygroundPage2';

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* 사이드바 */}
      <nav className="sidebar">
        <h3 className="sidebar-title">Langfuse</h3>
        
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <NavLink 
              to="/dashboards" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard 목록
            </NavLink>
          </li>
          
          <li className="sidebar-nav-item">
            <NavLink 
              to="/dashboards/new" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              새 Dashboard
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/dashboards/sample" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard 상세 (샘플)
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/widgets" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              Widget 목록
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/widgets/new" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              새 Widget
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/playground1" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              Playground 1
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/playground2" 
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              Playground 2
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="main-content">
        <div className="page-indicator">
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
          
          {/* Dashboard 관련 라우트 */}
          <Route path="/dashboards" element={<DashboardListPage />} />
          <Route path="/dashboards/new" element={<NewDashboardPage />} />
          <Route path="/dashboards/:dashboardId" element={<DashboardDetailPage />} />
          
          {/* Widget 관련 라우트 */}
          <Route path="/widgets" element={<WidgetDashboard />} />
          <Route path="/widgets/new" element={<NewWidgetPage />} />
          <Route path="/widgets/:widgetId" element={<WidgetEditPage />} />
          
          {/* Playground 관련 라우트 */}
          <Route path="/playground1" element={<PlaygroundPage1 />} />
          <Route path="/playground2" element={<PlaygroundPage2 />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;