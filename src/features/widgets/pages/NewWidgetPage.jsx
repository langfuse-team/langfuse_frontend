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
    metrics: [{ columnId: 'count', aggregation: 'count' }], // columnId를 확실히 설정
    filters: [],
    chartConfig: {},
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
      preset: '7 days'
    }
  });

  const [previewData, setPreviewData] = useState({ count: 4, chartData: [] });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);

  // Available views
  const getAvailableViews = () => {
    return [
      { value: 'traces', label: 'Traces' },
      { value: 'observations', label: 'Observations' },
      { value: 'scores-numeric', label: 'Scores Numeric' },
      { value: 'scores-categorical', label: 'Scores Categorical' }
    ];
  };
  const getMetricsForView = (view) => {
    switch (view) {
      case 'traces':
        return [
          { value: 'count', label: 'Count' },
          { value: 'latency', label: 'Latency' },
          { value: 'observations_count', label: 'Observations Count' },
          { value: 'scores_count', label: 'Scores Count' },
          { value: 'total_cost', label: 'Total Cost' },
          { value: 'total_tokens', label: 'Total Tokens' }
        ];
      case 'observations':
        return [
          { value: 'count', label: 'Count' },
          { value: 'duration', label: 'Duration' },
          { value: 'cost', label: 'Cost' },
          { value: 'input_tokens', label: 'Input Tokens' },
          { value: 'output_tokens', label: 'Output Tokens' }
        ];
      default:
        return [{ value: 'count', label: 'Count' }];
    }
  };

  // Available dimensions for breakdown
  const getDimensionsForView = (view) => {
    return [
      { value: 'environment', label: 'Environment' },
      { value: 'id', label: 'Id' },
      { value: 'name', label: 'Name' },
      { value: 'release', label: 'Release' },
      { value: 'session_id', label: 'Session Id' },
      { value: 'tags', label: 'Tags' },
      { value: 'timestamp_month', label: 'Timestamp Month' },
      { value: 'user_id', label: 'User Id' },
      { value: 'version', label: 'Version' }
    ];
  };

  // Chart types
  const chartTypes = [
    { 
      category: 'Time Series', 
      options: [
        { value: 'line', label: 'Line Chart', icon: '📈' },
        { value: 'vertical-bar', label: 'Vertical Bar Chart', icon: '📊' }
      ]
    },
    { 
      category: 'Total Value', 
      options: [
        { value: 'number', label: 'Big Number', icon: '#' },
        { value: 'horizontal-bar', label: 'Horizontal Bar Chart', icon: '📊' },
        { value: 'vertical-bar-total', label: 'Vertical Bar Chart', icon: '📊' },
        { value: 'histogram', label: 'Histogram', icon: '📊' },
        { value: 'pie', label: 'Pie Chart', icon: '🥧' },
        { value: 'table', label: 'Pivot Table', icon: '📋' }
      ]
    }
  ];

  // Get current chart type display
  const getCurrentChartType = () => {
    for (const category of chartTypes) {
      const found = category.options.find(option => option.value === widgetConfig.chartType);
      if (found) return found;
    }
    return { value: 'line', label: 'Line Chart', icon: '📈' };
  };

  // Date range presets
  const datePresets = [
    { value: '5min', label: '5 min' },
    { value: '30min', label: '30 min' },
    { value: '1hour', label: '1 hour' },
    { value: '3hours', label: '3 hours' },
    { value: '24hours', label: '24 hours' },
    { value: '7days', label: '7 days' },
    { value: '1month', label: '1 month' },
    { value: '3months', label: '3 months' },
    { value: '1year', label: '1 year' }
  ];

  // Initialize available columns based on view
  useEffect(() => {
    setAvailableColumns(getMetricsForView(widgetConfig.view));
    
    // View가 변경될 때 metric을 해당 view의 첫 번째 옵션으로 리셋
    const availableMetrics = getMetricsForView(widgetConfig.view);
    const currentMetricValue = widgetConfig.metrics[0]?.columnId;
    
    // 현재 선택된 metric이 새로운 view에서 사용할 수 없다면 기본값으로 변경
    if (!availableMetrics.some(metric => metric.value === currentMetricValue)) {
      setWidgetConfig(prev => ({
        ...prev,
        metrics: [{ columnId: availableMetrics[0]?.value || 'count', aggregation: 'count' }]
      }));
    }
  }, [widgetConfig.view]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setWidgetConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Handle metric changes
  const handleMetricChange = (field, value) => {
    setWidgetConfig((prev) => ({
      ...prev,
      metrics: [{ ...prev.metrics[0], [field]: value }]
    }));
  };

  // Handle dimension changes
  const handleDimensionChange = (value) => {
    setWidgetConfig((prev) => ({
      ...prev,
      dimensions: value === 'none' ? [] : [value]
    }));
  };

  // Handle filter management
  const handleAddFilter = () => {
    setWidgetConfig((prev) => ({
      ...prev,
      filters: [...prev.filters, { column: '', operator: 'is', value: '' }]
    }));
  };

  const handleRemoveFilter = (index) => {
    setWidgetConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const handleFilterChange = (index, field, value) => {
    setWidgetConfig((prev) => ({
      ...prev,
      filters: prev.filters.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    }));
  };

  // Handle date range changes
  const handleDatePresetChange = (preset) => {
    const now = new Date();
    let from = new Date();
    
    switch (preset) {
      case '5min':
        from = new Date(now.getTime() - 5 * 60 * 1000);
        break;
      case '30min':
        from = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        from = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '3hours':
        from = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        break;
      case '24hours':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    setWidgetConfig(prev => ({
      ...prev,
      dateRange: { from, to: now, preset }
    }));
    setShowPresetDropdown(false);
  };

  // Mock preview data update
  const updatePreviewData = async (config) => {
    setPreviewLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const mockData = {
        count: Math.floor(Math.random() * 10) + 1,
        chartData: Array.from({ length: 7 }, (_, i) => ({
          x: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
          y: Math.floor(Math.random() * 5)
        }))
      };
      setPreviewData(mockData);
      setPreviewLoading(false);
    }, 300);
  };

  // Update preview when config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreviewData(widgetConfig);
    }, 500);
    return () => clearTimeout(timer);
  }, [widgetConfig]);

  // Save widget
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
        <div className="breadcrumb">
          <span className="breadcrumb-item">jiwon</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">my-project-v1</span>
        </div>
        <h1>New Widget</h1>
        <div className="header-info">
          <span className="info-icon">ⓘ</span>
        </div>
      </div>

      <div className="widget-content">
        {/* Configuration Panel */}
        <div className="widget-configuration">
          <div className="config-header">
            <h2>Widget Configuration</h2>
            <p>Configure your widget by selecting data and visualization options</p>
          </div>

          {/* Data Selection */}
          <div className="config-section">
            <div className="section-header">
              <h3>Data Selection</h3>
              <button className="collapse-btn">▲</button>
            </div>

            <div className="form-group">
              <label>View</label>
              <div className="view-dropdown">
                <button
                  type="button"
                  className="form-select view-dropdown-btn"
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                >
                  <span>{getAvailableViews().find(v => v.value === widgetConfig.view)?.label || 'Traces'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showViewDropdown && (
                  <div className="view-dropdown-menu">
                    {getAvailableViews().map(view => (
                      <div
                        key={view.value}
                        className={`view-option ${widgetConfig.view === view.value ? 'selected' : ''}`}
                        onClick={() => {
                          handleInputChange('view', view.value);
                          setShowViewDropdown(false);
                        }}
                      >
                        {widgetConfig.view === view.value && <span className="check">✓</span>}
                        <span className="option-label">{view.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Metric</label>
              <div className="metric-dropdown">
                <button
                  type="button"
                  className="form-select metric-dropdown-btn"
                  onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                >
                  <span>
                    {getMetricsForView(widgetConfig.view).find(m => m.value === (widgetConfig.metrics[0]?.columnId || 'count'))?.label || 'Count'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showMetricDropdown && (
                  <div className="metric-dropdown-menu">
                    {getMetricsForView(widgetConfig.view).map(metric => (
                      <div
                        key={metric.value}
                        className={`metric-option ${(widgetConfig.metrics[0]?.columnId || 'count') === metric.value ? 'selected' : ''}`}
                        onClick={() => {
                          handleMetricChange('columnId', metric.value);
                          setShowMetricDropdown(false);
                        }}
                      >
                        {(widgetConfig.metrics[0]?.columnId || 'count') === metric.value && <span className="check">✓</span>}
                        <span className="option-label">{metric.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="config-section">
            <div className="section-header">
              <h3>Filters</h3>
              <button className="collapse-btn">▲</button>
            </div>

            {widgetConfig.filters.map((filter, index) => (
              <div key={index} className="filter-row">
                <span className="filter-label">Where</span>
                <select
                  className="form-select filter-column"
                  value={filter.column}
                  onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                >
                  <option value="">Column</option>
                  {getDimensionsForView(widgetConfig.view).map(dim => (
                    <option key={dim.value} value={dim.value}>{dim.label}</option>
                  ))}
                </select>
                <select
                  className="form-select filter-operator"
                  value={filter.operator}
                  onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                >
                  <option value="is">is</option>
                  <option value="isNot">is not</option>
                  <option value="contains">contains</option>
                </select>
                <input
                  type="text"
                  className="form-input filter-value"
                  value={filter.value}
                  onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                  placeholder="Value"
                />
                <button 
                  className="remove-filter-btn"
                  onClick={() => handleRemoveFilter(index)}
                >
                  ×
                </button>
              </div>
            ))}

            <button className="add-filter-btn" onClick={handleAddFilter}>
              + Add filter
            </button>
          </div>

          {/* Breakdown Dimension */}
          <div className="config-section">
            <div className="section-header">
              <h3>Breakdown Dimension (Optional)</h3>
              <button className="collapse-btn">▲</button>
            </div>

            <div className="form-group">
              <select
                className="form-select"
                value={widgetConfig.dimensions[0] || 'none'}
                onChange={(e) => handleDimensionChange(e.target.value)}
              >
                <option value="none">None</option>
                {getDimensionsForView(widgetConfig.view).map(dim => (
                  <option key={dim.value} value={dim.value}>{dim.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Visualization */}
          <div className="config-section">
            <div className="section-header">
              <h3>Visualization</h3>
              <button className="collapse-btn">▲</button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-input"
                value={widgetConfig.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={widgetConfig.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Chart Type</label>
              <div className="chart-type-dropdown">
                <button 
                  type="button"
                  className="form-select chart-type-btn"
                  onClick={() => setShowChartTypeDropdown(!showChartTypeDropdown)}
                >
                  <span className="chart-type-icon">{getCurrentChartType().icon}</span>
                  <span>{getCurrentChartType().label}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showChartTypeDropdown && (
                  <div className="chart-type-menu">
                    {chartTypes.map(category => (
                      <div key={category.category} className="chart-category">
                        <div className="category-header">{category.category}</div>
                        {category.options.map(option => (
                          <div 
                            key={option.value}
                            className={`chart-option ${widgetConfig.chartType === option.value ? 'selected' : ''}`}
                            onClick={() => {
                              handleInputChange('chartType', option.value);
                              setShowChartTypeDropdown(false);
                            }}
                          >
                            {widgetConfig.chartType === option.value && <span className="check">✓</span>}
                            <span className="option-icon">{option.icon}</span>
                            <span className="option-label">{option.label}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Date Range</label>
              <div className="date-range-container">
                <div className="date-range-input">
                  📅 Aug 18, 25 : 15:54 - Aug 25, 25 : 15:54
                </div>
                <div className="preset-dropdown">
                  <button 
                    className="preset-btn"
                    onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                  >
                    Past 7... ▼
                  </button>
                  {showPresetDropdown && (
                    <div className="preset-menu">
                      {datePresets.map(preset => (
                        <div 
                          key={preset.value}
                          className={`preset-item ${widgetConfig.dateRange.preset === preset.label ? 'selected' : ''}`}
                          onClick={() => handleDatePresetChange(preset.value)}
                        >
                          {preset.value === '7days' && <span className="check">✓</span>}
                          {preset.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="save-section">
            <button 
              className="save-widget-btn"
              onClick={handleSaveWidget}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Widget'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Preview Panel */}
        <div className="widget-preview">
          <div className="preview-header">
            <h2>{widgetConfig.name}</h2>
            <p>{widgetConfig.description}</p>
          </div>

          <div className="preview-content">
            {previewLoading ? (
              <div className="preview-loading">Loading preview...</div>
            ) : (
              <div className="preview-chart">
                <div className="chart-value">{previewData.count}</div>
                <div className="chart-timeline">
                  {previewData.chartData.map((point, index) => (
                    <div key={index} className="timeline-point">
                      <div className="point-value">{point.y}</div>
                      <div className="point-date">
                        {new Date(point.x).toLocaleDateString('en-US', { 
                          month: 'numeric', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Tooltip */}
                <div className="chart-tooltip">
                  <div className="tooltip-content">
                    <div className="tooltip-date">8/18/25, 09:00 AM</div>
                    <div className="tooltip-value">Count : 0</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewWidgetPage;