import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { getInitials, formatPeriod, Stars, Spinner, avatarClass } from '../utils.jsx';
import { NewEPRModal, EPRDetailModal } from './Modals.jsx';

/* ── Performance Snapshot ────────────────────────────────────────── */
function PerformanceSnapshot({ personId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSummary(personId)
      .then((res) => setSummary(res))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [personId]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!summary || summary.eprCount === 0) return null;

  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">📊</span>
        Performance Snapshot
        <span className="count-pill">{summary.eprCount} EPRs</span>
      </div>
      <div className="snapshot-grid">
        <div className="snapshot-metric">
          <div className="metric-value">{summary.averageOverallRating ?? '—'}</div>
          <div className="metric-label">Avg Overall</div>
        </div>
        <div className="snapshot-metric">
          <div className="metric-value --tech">{summary.averageTechnicalRating ?? '—'}</div>
          <div className="metric-label">Avg Technical</div>
        </div>
        <div className="snapshot-metric">
          <div className="metric-value --nontech">{summary.averageNonTechnicalRating ?? '—'}</div>
          <div className="metric-label">Avg Non-Tech</div>
        </div>
      </div>
      {summary.lastThreePeriods.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: 8 }}>
            <span className="card-title-icon">📈</span> Recent Trend
          </div>
          <div className="trend-list">
            {summary.lastThreePeriods.map((p, i) => (
              <div className="trend-item" key={i}>
                <span className="trend-label">{p.periodLabel}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stars value={p.overallRating} />
                  <span className="trend-rating">{p.overallRating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── EPR List ────────────────────────────────────────────────────── */
function EPRList({ person, evaluatorOptions, refreshKey }) {
  const [eprs, setEprs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEprId, setSelectedEprId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [listKey, setListKey] = useState(0);

  const reload = () => setListKey((k) => k + 1);

  useEffect(() => {
    setLoading(true);
    api.getEPRs(person.id)
      .then((res) => setEprs(res.data))
      .catch(() => setEprs([]))
      .finally(() => setLoading(false));
  }, [person.id, listKey, refreshKey]);

  return (
    <>
      <div className="card">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>
            <span className="card-title-icon">📋</span>
            Performance Records
            <span className="count-pill">{eprs.length}</span>
          </div>
          <button
            id="new-epr-btn"
            className="btn btn-primary btn-sm"
            onClick={() => setShowNew(true)}
          >
            ✚ New EPR
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          {loading ? (
            <Spinner />
          ) : eprs.length === 0 ? (
            <p className="no-eprs">No EPR records yet. Click "New EPR" to create one.</p>
          ) : (
            <div className="epr-list">
              {eprs.map((epr) => (
                <div
                  key={epr.id}
                  className="epr-item"
                  id={`epr-item-${epr.id}`}
                  onClick={() => setSelectedEprId(epr.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="epr-period">
                      {formatPeriod(epr.period_start, epr.period_end)}
                    </div>
                    <div className="epr-evaluator">
                      By {epr.evaluator_name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Stars value={epr.overall_rating} />
                    <span className="epr-rating">{epr.overall_rating}/5</span>
                    <span className={`badge badge-${epr.status}`}>{epr.status}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <NewEPRModal
          person={person}
          evaluatorOptions={evaluatorOptions}
          onClose={() => setShowNew(false)}
          onCreated={reload}
        />
      )}

      {selectedEprId && (
        <EPRDetailModal
          eprId={selectedEprId}
          onClose={() => setSelectedEprId(null)}
          onEdited={reload}
        />
      )}
    </>
  );
}

/* ── Person Detail (Right Pane) ────────────────────────────────── */
export function PersonDetail({ person, allUsers }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const evaluatorOptions = allUsers.filter(
    (u) => (u.role === 'instructor' || u.role === 'admin') && u.id !== person.id
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="right-panel-inner">
      {/* Header */}
      <div className="person-detail-header">
        <div className={`detail-avatar ${avatarClass(person.role)}`}>
          {getInitials(person.name)}
        </div>
        <div className="detail-info">
          <div className="detail-name">{person.name}</div>
          <div className="detail-email">{person.email}</div>
          <div className="detail-badges">
            <span className={`badge badge-${person.role}`}>{person.role}</span>
            {person.enrollment_status && (
              <span className={`badge badge-${person.enrollment_status}`}>
                {person.enrollment_status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Course info (student) */}
      {person.role === 'student' && person.course_name && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title"><span className="card-title-icon">✈</span> Current Course</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {person.course_name}
          </div>
          {person.enrollment_status && (
            <div style={{ marginTop: 6 }}>
              <span className={`badge badge-${person.enrollment_status}`}>{person.enrollment_status}</span>
            </div>
          )}
        </div>
      )}

      {/* Instructor EPR count */}
      {person.role === 'instructor' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title"><span className="card-title-icon">📝</span> Evaluations Written</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {person.total_eprs_written}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>EPR records authored</div>
        </div>
      )}

      {/* Performance Snapshot */}
      <PerformanceSnapshot personId={person.id} key={refreshKey} />

      <div className="divider" />

      {/* EPR List */}
      <EPRList
        person={person}
        evaluatorOptions={evaluatorOptions}
        refreshKey={refreshKey}
      />
    </div>
  );
}
