// src/pages/WidgetEditPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import widgetAPI from "../services/widgetAPI.js";
import "../css/WidgetEdit.css";

const WidgetEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // 수정 폼 데이터 (초기값은 비워둠)
  const [widgetConfig, setWidgetConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 최초 진입 시 기존 위젯 불러오기
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 1) 리스트에서 navigate 할 때 state로 넘겨받은 경우
        const stateWidget = location.state?.widget;

        // 2) 단건 API가 있다면 사용
        let loaded = stateWidget;
        if (!loaded && widgetAPI?.getWidgetById) {
          const res = await widgetAPI.getWidgetById(id);
          if (res?.success) loaded = res.data;
        }

        // 3) 없다면 null → UI만 표시
        setWidgetConfig(loaded || {});
      } catch (e) {
        console.error(e);
        setError("위젯 정보를 불러오는 중 오류가 발생했습니다.");
        setWidgetConfig({});
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, location.state]);

  // 값 변경 핸들러
  const handleInputChange = (field, value) =>
    setWidgetConfig((prev) => ({ ...prev, [field]: value }));

  // 저장 (업데이트)
  const handleUpdate = async () => {
    try {
      setSaving(true);
      if (!widgetAPI?.updateWidget) {
        alert("updateWidget API가 아직 없습니다.");
        return;
      }
      const res = await widgetAPI.updateWidget(id, widgetConfig);
      if (res?.success) {
        alert("업데이트 완료");
        navigate("/widgets");
      } else {
        throw new Error(res?.error || "업데이트 실패");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/widgets");

  if (loading) {
    return <div className="edit-widget-page">불러오는 중…</div>;
  }

  return (
    <div className="edit-widget-page">
      <div className="page-header">
        <h1>Edit Widget</h1>
        <div className="header-actions">
          <button className="ghost-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Widget"}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="widget-content">
        {/* 왼쪽: 설정 폼 */}
        <div className="widget-configuration">
          <div className="form-group">
            <label>Name</label>
            <input
              className="form-input"
              value={widgetConfig?.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={widgetConfig?.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>View Type</label>
            <input
              className="form-input"
              value={widgetConfig?.view || ""}
              onChange={(e) => handleInputChange("view", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Chart Type</label>
            <input
              className="form-input"
              value={widgetConfig?.chartType || ""}
              onChange={(e) => handleInputChange("chartType", e.target.value)}
            />
          </div>
        </div>

        {/* 오른쪽: 프리뷰 (데이터 없이 이름/설명만 보여줌) */}
        <div className="widget-preview">
          <h2>{widgetConfig?.name || "Widget Name"}</h2>
          <p>{widgetConfig?.description || "Widget Description"}</p>
        </div>
      </div>
    </div>
  );
};

export default WidgetEditPage;
