// NoDataOrLoading.jsx
import React from 'react';

export const NoDataOrLoading = ({ isLoading, hasData, children, loadingText = "로딩중...", noDataText = "데이터가 없습니다." }) => {
  if (isLoading) {
    return (
      <div className="no-data-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{loadingText}</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="no-data-loading">
        <div className="no-data-message">
          <p>{noDataText}</p>
        </div>
      </div>
    );
  }

  return children;
}

export default NoDataOrLoading;