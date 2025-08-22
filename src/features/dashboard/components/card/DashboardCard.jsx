import React from 'react';

/**
 * 로딩 스피너 컴포넌트 (Lucide Loader 아이콘 대체)
 */
function LoadingSpinner() {
  return (
    <div style={{
      width: '20px',
      height: '20px',
      border: '2px solid #e5e7eb',
      borderTop: '2px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * 카드 컴포넌트
 */
function Card({ className = '', children, style = {} }) {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * 카드 헤더 컴포넌트
 */
function CardHeader({ className = '', children, style = {} }) {
  return (
    <div 
      style={{
        position: 'relative',
        padding: '24px 24px 0 24px',
        ...style
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * 카드 제목 컴포넌트
 */
function CardTitle({ children, style = {} }) {
  return (
    <h3 style={{
      margin: 0,
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.75rem',
      color: '#111827',
      ...style
    }}>
      {children}
    </h3>
  );
}

/**
 * 카드 설명 컴포넌트
 */
function CardDescription({ children, style = {} }) {
  return (
    <p style={{
      margin: 0,
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.25rem',
      ...style
    }}>
      {children}
    </p>
  );
}

/**
 * 카드 콘텐츠 컴포넌트
 */
function CardContent({ className = '', children, style = {} }) {
  return (
    <div 
      style={{
        padding: '24px',
        paddingTop: '16px',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: '16px',
        ...style
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * 대시보드 카드 컴포넌트
 * @param {Object} props
 * @param {string} props.className - CSS 클래스명
 * @param {React.ReactNode} props.title - 카드 제목
 * @param {React.ReactNode} props.description - 카드 설명
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {React.ReactNode} props.children - 카드 내용
 * @param {React.ReactNode} props.headerChildren - 헤더 추가 내용
 * @param {string} props.cardContentClassName - 콘텐츠 CSS 클래스
 * @param {string} props.headerClassName - 헤더 CSS 클래스
 * @param {React.ReactNode} props.headerRight - 헤더 오른쪽 내용
 */
export function DashboardCard({
  className = '',
  title,
  description,
  isLoading = false,
  children,
  headerChildren,
  cardContentClassName = '',
  headerClassName = '',
  headerRight,
}) {
  return (
    <Card className={className}>
      <CardHeader className={headerClassName}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {headerRight}
        </div>
        
        {headerChildren}
        
        {/* 로딩 스피너 */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '20px',
            top: '20px'
          }}>
            <LoadingSpinner />
          </div>
        )}
      </CardHeader>
      
      <CardContent className={cardContentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}

export default DashboardCard;