import React, { useState, useEffect } from "react";
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import API from "../../api/api";
import { getAdminCss } from './adminCss';

function VerifyInternships() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  async function fetchInternships() {
    try {
      const response = await API.get("/reports/internships");
      setInternships(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load internships");
    }
  }

  async function verifyInternship(internship) {
    setLoading(prev => ({ ...prev, [internship.internship_id]: true }));

    try {
      const response = await API.post(`/internships/${internship.internship_id}/ai-review`);

      const data = response.data;

      if (data.error) {
        setResults(prev => ({
          ...prev,
          [internship.internship_id]: {
            risk_score: 0,
            status: "ERROR",
            reasons: [data.raw || data.error],
            recommendation: "AI service is currently unavailable. Please retry shortly.",
          },
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [internship.internship_id]: {
            risk_score: data.risk_score ?? 0,
            status: data.status || "UNKNOWN",
            reasons: data.reasons || [],
            recommendation: data.recommendation || "No recommendation provided.",
            is_high_risk: Boolean(data.is_high_risk),
            warning: data.warning || "",
            risk_threshold: data.risk_threshold,
            internship_status: data.internship_status,
            admin_decision: data.admin_decision,
          },
        }));
        setNotice({
          type: data.is_high_risk ? "warning" : "success",
          message: data.is_high_risk
            ? `AI review complete. Risk score: ${data.risk_score ?? 0}/100. High risk detected; Admin decision is required.`
            : `AI review complete. Risk score: ${data.risk_score ?? 0}/100. No high-risk warning was detected.`,
        });
        fetchInternships();
      }

    } catch (error) {
      console.error(error);

      setResults(prev => ({
        ...prev,
        [internship.internship_id]: {
          risk_score: 0,
          status: "ERROR",
          reasons: ["Cannot connect to backend or AI server."],
          recommendation: "Please check backend console.",
        },
      }));
    } finally {
      setLoading(prev => ({
        ...prev,
        [internship.internship_id]: false
      }));
    }
  }

  async function approveInternship(internshipId) {
    try {
      await API.put(`/internships/${internshipId}/admin-approve`);
      setNotice({ type: "success", message: "Internship approved and available to students." });
      fetchInternships();
    } catch {
      setNotice({ type: "error", message: "Failed to approve internship." });
    }
  }

  async function rejectInternship(internshipId) {
    try {
      await API.put(`/internships/${internshipId}/admin-reject`, {
        reason: "Rejected by Admin due to high AI risk score.",
      });
      setNotice({ type: "warning", message: "Internship rejected by Admin and closed." });
      fetchInternships();
    } catch {
      setNotice({ type: "error", message: "Failed to reject internship." });
    }
  }

  const getStatusColor = (status) => {
    if (status === "SAFE") return "#48bb78";
    if (status === "SUSPICIOUS") return "#f6ad55";
    if (status === "FAKE" || status === "SCAM" || status === "ERROR") return "#fc8181";
    return t.textMuted;
  };

  const getStatusBg = (status) => {
    if (status === "SAFE") return "rgba(72,187,120,0.08)";
    if (status === "SUSPICIOUS") return "rgba(246,173,85,0.08)";
    if (status === "FAKE" || status === "SCAM" || status === "ERROR") return "rgba(252,129,129,0.08)";
    return t.bgCard;
  };

  const isUnclearNeutralRisk = (score, status) =>
    Number(score) === 50 && String(status || "").toUpperCase() === "UNKNOWN";

  const listingStatusLabel = (status) => ({
    pending: "Pending",
    open: "Open",
    closed: "Closed",
    rejected: "Closed",
  }[status] || status || "Pending");

  return (
    <>
      <style>{getAdminCss(isDark)}</style>

      <style>{`
        .verify-card {
          background: ${t.bgCard};
          border: 1px solid ${t.border};
          border-radius: 16px;
          padding: 28px;
          backdrop-filter: blur(8px);
          margin-bottom: 20px;
        }

        .verify-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .verify-title {
          font-size: 20px;
          font-weight: 700;
          color: ${t.textPrimary};
        }

        .verify-company {
          background: ${t.accentMuted};
          border: 1px solid ${t.border};
          color: ${t.accentLight};
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }

        .verify-details {
          color: ${t.textSecondary};
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .verify-details strong {
          color: ${t.textPrimary};
        }

        .verify-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 10px;
          background: ${t.accent};
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 10px;
        }

        .verify-btn:hover {
          opacity: 0.9;
        }

        .verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .result-panel {
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          border-left: 4px solid;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .result-status {
          color: white;
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
        }

        .result-score {
          font-size: 14px;
          color: ${t.textSecondary};
        }

        .result-reasons li {
          margin-bottom: 6px;
          color: ${t.textMuted};
        }

        .error-box {
          background: rgba(252,129,129,0.1);
          border: 1px solid rgba(252,129,129,0.2);
          color: #fc8181;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .notice-box {
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 24px;
          border: 1px solid;
        }
        .notice-box.success { background: rgba(72,187,120,0.1); border-color: rgba(72,187,120,0.25); color: #48bb78; }
        .notice-box.warning { background: rgba(246,173,85,0.12); border-color: rgba(246,173,85,0.3); color: #f6ad55; }
        .notice-box.error { background: rgba(252,129,129,0.1); border-color: rgba(252,129,129,0.25); color: #fc8181; }
        .risk-warning {
          margin: 12px 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(246,173,85,0.14);
          border: 1px solid rgba(246,173,85,0.32);
          color: #f6ad55;
          font-weight: 700;
        }
        .risk-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(99,179,237,0.24);
          background: rgba(99,179,237,0.1);
          color: ${t.accentLight};
        }
        .risk-chip.high {
          border-color: rgba(246,173,85,0.35);
          background: rgba(246,173,85,0.12);
          color: #f6ad55;
        }
        .risk-chip.safe {
          border-color: rgba(72,187,120,0.35);
          background: rgba(72,187,120,0.12);
          color: #48bb78;
        }
        .manual-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
        .approve-btn { background: rgba(72,187,120,0.12); border: 1px solid rgba(72,187,120,0.35); color: #48bb78; }
        .reject-btn { background: rgba(252,129,129,0.12); border: 1px solid rgba(252,129,129,0.35); color: #fc8181; }
      `}</style>

      <div className="admin-page">
        <div className="admin-bg" />
        <div className="admin-grid" />

        <AdminNavbar />

        <div className="admin-layout ie-content">
          <AdminSidebar activeId="verify-internships" />

          <main className="admin-main">

            <div className="ie-animate">
              <h1 className="dash-greeting">
                🤖 AI Internship <span>Verification</span>
              </h1>

              <p className="dash-sub">
                Uses AI to detect fake or scam internship listings
              </p>
            </div>

            {error && <div className="error-box">{error}</div>}
            {notice && <div className={`notice-box ${notice.type}`}>{notice.message}</div>}

            {internships.map((internship) => (
              <div key={internship.internship_id} className="verify-card ie-animate-2">
                <div className="verify-card-header">
                  <h2 className="verify-title">{internship.title}</h2>
                  <span className="verify-company">{internship.company_name || "Company"}</span>
                  {(() => {
                    const result = results[internship.internship_id];
                    const riskScore = result?.risk_score ?? internship.ai_risk_score;
                    const riskStatus = result?.status ?? internship.ai_risk_status;
                    const isHighRisk = result?.is_high_risk ?? internship.ai_risk_warning;
                    if (riskScore === null || riskScore === undefined || isUnclearNeutralRisk(riskScore, riskStatus)) return null;
                    return (
                      <span className={`risk-chip ${isHighRisk ? "high" : "safe"}`}>
                        Risk Score: {riskScore}/100
                      </span>
                    );
                  })()}
                </div>

                <div className="verify-details">
                  <p><strong>📍 Location:</strong> {internship.location}</p>
                  <p><strong>💼 Type:</strong> {internship.type}</p>
                  <p><strong>🎓 Field:</strong> {internship.field_of_study}</p>
                  <p><strong>📝 Description:</strong> {internship.description}</p>
                  <p><strong>⚙️ Skills:</strong> {internship.required_skills}</p>
                  <p><strong>📅 Deadline:</strong> {internship.deadline}</p>
                  <p><strong>📌 Status:</strong> {listingStatusLabel(internship.status)}</p>
                </div>

                {(internship.ai_risk_score !== null && internship.ai_risk_score !== undefined && !isUnclearNeutralRisk(internship.ai_risk_score, internship.ai_risk_status)) && (
                  <div className="risk-warning">
                    AI Risk: {internship.ai_risk_score}/100 {internship.ai_risk_warning ? "- High risk warning" : "- Advisory only"}
                  </div>
                )}
                {internship.admin_rejection_reason && (
                  <div className="risk-warning">
                    {internship.admin_rejection_reason}
                  </div>
                )}

                <button
                  className="verify-btn"
                  onClick={() => verifyInternship(internship)}
                  disabled={loading[internship.internship_id]}
                >
                  {loading[internship.internship_id] ? "⏳ Verifying..." : "🤖 Verify with AI"}
                </button>

                {results[internship.internship_id] && (
                  <div
                    className="result-panel"
                    style={{
                      borderLeftColor: getStatusColor(results[internship.internship_id].status),
                      backgroundColor: getStatusBg(results[internship.internship_id].status),
                    }}
                  >
                    <div className="result-header">
                      <span
                        className="result-status"
                        style={{
                          backgroundColor: getStatusColor(results[internship.internship_id].status),
                        }}
                      >
                        {results[internship.internship_id].status}
                      </span>

                      <span className="result-score">
                        Risk Score:
                        <strong
                          style={{
                            marginLeft: "6px",
                            color: getStatusColor(results[internship.internship_id].status),
                          }}
                        >
                          {results[internship.internship_id].risk_score}/100
                        </strong>
                      </span>
                    </div>

                    <p>💡 {results[internship.internship_id].recommendation}</p>

                    {results[internship.internship_id].is_high_risk && (
                      <div className="risk-warning">
                        This internship has a high risk score and is not able to be published.
                      </div>
                    )}

                    <ul className="result-reasons">
                      {results[internship.internship_id].reasons?.map((reason, index) => (
                        <li key={index}>⚠️ {reason}</li>
                      ))}
                    </ul>

                    {internship.status === "pending" ? (
                      <div className="manual-actions">
                        <button className="verify-btn approve-btn" onClick={() => approveInternship(internship.internship_id)}>
                          Approve Internship
                        </button>
                        <button className="verify-btn reject-btn" onClick={() => rejectInternship(internship.internship_id)}>
                          Reject Internship
                        </button>
                      </div>
                    ) : (
                      <div className="risk-warning">
                        Final status: {listingStatusLabel(internship.status)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

          </main>
        </div>
      </div>
    </>
  );
}

export default VerifyInternships;
