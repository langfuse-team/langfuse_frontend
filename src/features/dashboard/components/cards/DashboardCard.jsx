// src/features/dashboard/components/card/DashboardCard.jsx
import React from 'react';

/**
 * 재사용 가능한 대시보드 카드 컴포넌트
 * 원본 Langfuse Card UI와 동일한 스타일
 */
function DashboardCard({ 
  title, 
  description, 
  isLoading = false, 
  children, 
  className = "",
  headerRight,
  headerChildren
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col ${className}`}>
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-100 relative">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {headerRight}
        </div>
        
        {/* 추가 헤더 콘텐츠 */}
        {headerChildren}
        
        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="absolute right-5 top-5">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
      
      {/* 콘텐츠 */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}

export default DashboardCard;
export { DashboardCard }; // named export 추가