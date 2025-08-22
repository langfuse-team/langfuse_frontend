// src/pages/NewWidgetPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import widgetAPI from '../services/widgetAPI.js';
import '../css/NewWidget.css';

const NewWidgetPage = () => {
  const navigate = useNavigate();

  const [widgetConfig, setWidgetConfig] = useState({
    name: 'Count (Traces)',
    description: 'Shows the count of Traces',
    view: 'traces',
    chartType: 'line',
    dimensions: [],
    metrics: [{ columnId: 'count', aggregation: 'count' }],
    filters: [],
    chartConfig: {},
  });

  const [previewData, setPreviewData] = useState({ count: 0, chartData: [] });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [error, setError] = useState(null);

  // 뷰에 따른 컬럼
  useEffect(() => {
    const view = widgetConfig.view;
    let columns = [];
    switch (view) {
      case 'traces':
        columns = [
          { id: 'count', name: 'Count', type: 'number' },
          { id: 'duration', name: 'Duration', type: 'number' },
          { id: 'totalCost', name: 'Total Cost', type: 'number' },
          { id: 'tokenCount', name: 'Token Count', type: 'number' },
        ];
        break;
      case 'observations':
        columns = [
          { id: 'count', name: 'Count', type: 'number' },
          { id: 'duration', name: 'Duration', type: 'number' },
          { id: 'cost', name: 'Cost', type: 'number' },
          { id: 'inputTokens', name: 'Input Tokens', type: 'number' },
          { id: 'outputTokens', name: 'Output Tokens', type: 'number' },
        ];
        break;
      case 'scores-numeric':
        columns = [
          { id: 'count', name: 'Count', type: 'number' },
          { id: 'value', name: 'Score Value', type: 'number' },
        ];
        break;
      case 'scores-categorical':
        columns = [
          { id: 'count', name: 'Count', type: 'number' },
          { id: 'value', name: 'Category', type: 'string' },
        ];
        break;
      default:
        columns = [{ id: 'count', name: 'Count', type: 'number' }];
    }
    setAvailableColumns(columns);
  }, [widgetConfig.view]);

  // 폼 변경
  const handleInputChange = (field, value) => {
    setWidgetConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetricChange = (columnId, aggregation) => {
    setWidgetConfig((prev) => ({
      ...prev,
      metrics: [{ columnId, aggregation }],
    }));
  };

  // 필터 편집
  const handleAddFilter = () => {
    setWidgetConfig((prev) => ({
      ...prev,
      filters: [...prev.filters, { column: '', operator: 'is', value: '' }],
    }));
  };

  const handleRemoveFilter = (index) => {
    setWidgetConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }));
  };

  const handleFilterChange = (index, field, value) => {
    setWidgetConfig((prev) => ({
      ...prev,
      filters: prev.filters.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  };

  // 미리보기(실데이터: Metrics API)
  const updatePreviewData = async (config) => {
    try {
      setPreviewLoading(true);

      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 7);

      const metric = config.metrics?.[0]?.columnId || 'count';
      const aggregation = config.metrics?.[0]?.aggregation || 'count';

      const preview = await widgetAPI.getMetricsPreview({
        view: config.view || 'traces',
        metric,
        aggregation,
        from: from.toISOString(),
        to: to.toISOString(),
        interval: 'day',
        filters: config.filters || [],
      });

      setPreviewData(preview);
    } catch (err) {
      console.error('미리보기 업데이트 오류:', err);
      setPreviewData({ count: 0, chartData: [] });
    } finally {
      setPreviewLoading(false);
    }
  };

  // 설정 변경마다 미리보기 업데이트(디바운스 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreviewData(widgetConfig);
    }, 500);
    return () => clearTimeout(timer);
  }, [widgetConfig]);

  // 저장 (임시: 로컬 저장)
  const handleSaveWidget = async () => {
    try {
      setLoading(true);
      setError(null);
      const validation = widgetAPI.validateWidgetConfig(widgetConfig);
      if (!validation.isValid) {
        setError(validation.errors.join('\n'));
        return;
      }
      const result = await widgetAPI.createWidget(widgetConfig);
      if (result?.success) {
        alert('위젯이 저장되었습니다.');
        navigate('/widgets');
      } else {
        throw new Error(result?.error || '위젯 저장 실패');
      }
    } catch (err) {
      console.error('위젯 저장 오류:', err);
      setError(err.message || '위젯 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-widget-page">
      <div className="page-header">
        <h1>New Widget</h1>
        <button className="back-btn" onClick={() => navigate('/widgets')}>
          ← Back to Widgets
        </button>
      </div>

      <div className="widget-content">
        {/* 왼쪽: 설정 폼 */}
        <div className="widget-configuration">
          <div className="config-section">
            <h2>Widget Configuration</h2>

            {/* 기본 정보 */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label>Widget Name</label>
                <input
                  type="text"
                  value={widgetConfig.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter widget name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={widgetConfig.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter widget description"
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>

            {/* 데이터 선택 */}
            <div className="form-section">
              <h3>Data Selection</h3>

              <div className="form-group">
                <label>View</label>
                <select
                  value={widgetConfig.view}
                  onChange={(e) => handleInputChange('view', e.target.value)}
                  className="form-select"
                >
                  {widgetAPI.getAvailableViews().map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Chart Type</label>
                <select
                  value={widgetConfig.chartType}
                  onChange={(e) => handleInputChange('chartType', e.target.value)}
                  className="form-select"
                >
                  {widgetAPI.getAvailableChartTypes().map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Metric</label>
                <div className="metric-selector">
                  <select
                    value={widgetConfig.metrics[0]?.columnId || 'count'}
                    onChange={(e) =>
                      handleMetricChange(e.target.value, widgetConfig.metrics[0]?.aggregation || 'count')
                    }
                    className="form-select metric-column"
                  >
                    {availableColumns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={widgetConfig.metrics[0]?.aggregation || 'count'}
                    onChange={(e) =>
                      handleMetricChange(widgetConfig.metrics[0]?.columnId || 'count', e.target.value)
                    }
                    className="form-select metric-aggregation"
                  >
                    {widgetAPI.getAggregationTypes().map((agg) => (
                      <option key={agg.value} value={agg.value}>
                        {agg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 필터 */}
            <div className="form-section">
              <h3>Filters</h3>

              {widgetConfig.filters.map((filter, index) => (
                <div key={index} className="filter-row">
                  <select
                    value={filter.column}
                    onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                    className="filter-column"
                  >
                    <option value="">Select column</option>
                    {availableColumns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filter.operator}
                    onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                    className="filter-operator"
                  >
                    {[
                      { value: 'is', label: 'is' },
                      { value: 'isNot', label: 'is not' },
                      { value: 'contains', label: 'contains' },
                      { value: 'doesNotContain', label: 'does not contain' },
                      { value: 'startsWith', label: 'starts with' },
                      { value: 'endsWith', label: 'ends with' },
                      { value: 'isEmpty', label: 'is empty' },
                      { value: 'isNotEmpty', label: 'is not empty' },
                      { value: 'greaterThan', label: 'greater than' },
                      { value: 'lessThan', label: 'less than' },
                      { value: 'greaterThanOrEqual', label: '>= ' },
                      { value: 'lessThanOrEqual', label: '<= ' },
                    ].map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="filter-value"
                  />

                  <button onClick={() => handleRemoveFilter(index)} className="remove-filter-btn">
                    ×
                  </button>
                </div>
              ))}

              <button className="add-filter-btn" onClick={handleAddFilter}>
                <span>+</span> Add filter
              </button>
            </div>

            {/* 저장 */}
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => navigate('/widgets')}>
                Cancel
              </button>
              <button className="save-widget-btn" onClick={handleSaveWidget} disabled={loading}>
                {loading ? 'Saving...' : 'Save Widget'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="widget-preview">
          <div className="preview-header">
            <h2>{widgetConfig.name || 'Widget Preview'}</h2>
            <p className="preview-description">
              {widgetConfig.description || 'Preview of your widget configuration'}
            </p>
          </div>

          <div className="preview-content">
            {previewLoading ? (
              <div className="preview-loading">Loading preview...</div>
            ) : (
              <div className="preview-chart">
                {widgetConfig.chartType === 'number' ? (
                  <div className="chart-number">
                    <div className="number-value">{previewData.count}</div>
                    <div className="number-label">
                      {widgetConfig.metrics[0]?.aggregation} of {widgetConfig.metrics[0]?.columnId}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chart-summary">Total: {previewData.count}</div>
                    <div className="chart-container">
                      <div className="simple-chart">
                        {previewData.chartData.map((point, index) => {
                          const max = Math.max(...previewData.chartData.map((p) => p.value), 0);
                          const pct = max > 0 ? (point.value / max) * 100 : 0;
                          return (
                            <div key={index} className="chart-bar-wrapper">
                              <div className="chart-bar" style={{ height: `${pct}%` }}>
                                <span className="bar-value">{point.value}</span>
                              </div>
                              <div className="bar-label">{point.date}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewWidgetPage;
