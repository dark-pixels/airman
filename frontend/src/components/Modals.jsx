import { useState, useEffect } from 'react';
import { api } from '../api';
import { getInitials, formatPeriod, Stars, Spinner, formatDate } from '../utils.jsx';

/* ── Rating Input ──────────────────────────────────────────────────── */
function RatingInput({ label, name, value, onChange }) {
  const num = parseInt(value, 10) || 0;
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="rating-input-group">
        <input
          type="number"
          id={`rating-${name}`}
          min={1}
          max={5}
          className="form-input rating-input"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        />
        <div className="rating-preview-stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`star ${i <= num ? 'filled' : ''}`}
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => onChange(name, String(i))}
            >★</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── New EPR Modal ────────────────────────────────────────────────── */
export function NewEPRModal({ person, evaluatorOptions, onClose, onCreated }) {
  const [form, setForm] = useState({
    periodStart: '',
    periodEnd: '',
    overallRating: '3',
    technicalSkillsRating: '3',
    nonTechnicalSkillsRating: '3',
    remarks: '',
    status: 'draft',
    evaluatorId: evaluatorOptions[0]?.id || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createEPR({
        personId: person.id,
        evaluatorId: form.evaluatorId,
        roleType: person.role === 'admin' ? 'instructor' : person.role,
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        overallRating: form.overallRating,
        technicalSkillsRating: form.technicalSkillsRating,
        nonTechnicalSkillsRating: form.nonTechnicalSkillsRating,
        remarks: form.remarks,
        status: form.status,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">✚ New EPR — {person.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">⚠ {error}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Period Start</label>
                <input
                  id="new-period-start"
                  type="date"
                  className="form-input"
                  required
                  value={form.periodStart}
                  onChange={(e) => set('periodStart', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Period End</label>
                <input
                  id="new-period-end"
                  type="date"
                  className="form-input"
                  required
                  value={form.periodEnd}
                  onChange={(e) => set('periodEnd', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Evaluator</label>
                <select
                  id="new-evaluator"
                  className="form-select"
                  value={form.evaluatorId}
                  onChange={(e) => set('evaluatorId', e.target.value)}
                >
                  {evaluatorOptions.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <RatingInput label="Overall Rating (1–5)" name="overallRating" value={form.overallRating} onChange={set} />
              <RatingInput label="Technical Skills (1–5)" name="technicalSkillsRating" value={form.technicalSkillsRating} onChange={set} />
              <RatingInput label="Non-Technical / CRM (1–5)" name="nonTechnicalSkillsRating" value={form.nonTechnicalSkillsRating} onChange={set} />
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="new-status" className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Remarks</label>
                <textarea
                  id="new-remarks"
                  className="form-textarea"
                  placeholder="Enter performance remarks…"
                  value={form.remarks}
                  onChange={(e) => set('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" id="new-epr-submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : '✚ Create EPR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Edit EPR Modal ──────────────────────────────────────────────── */
export function EditEPRModal({ epr, onClose, onSaved }) {
  const [form, setForm] = useState({
    overallRating: String(epr.overall_rating),
    technicalSkillsRating: String(epr.technical_skills_rating),
    nonTechnicalSkillsRating: String(epr.non_technical_skills_rating),
    remarks: epr.remarks || '',
    status: epr.status,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.updateEPR(epr.id, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">✎ Edit EPR — {formatPeriod(epr.period_start, epr.period_end)}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">⚠ {error}</div>}
            <div className="form-grid">
              <RatingInput label="Overall Rating (1–5)" name="overallRating" value={form.overallRating} onChange={set} />
              <RatingInput label="Technical Skills (1–5)" name="technicalSkillsRating" value={form.technicalSkillsRating} onChange={set} />
              <RatingInput label="Non-Technical / CRM (1–5)" name="nonTechnicalSkillsRating" value={form.nonTechnicalSkillsRating} onChange={set} />
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="edit-status" className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Remarks</label>
                <textarea
                  id="edit-remarks"
                  className="form-textarea"
                  value={form.remarks}
                  onChange={(e) => set('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" id="edit-epr-submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── EPR Detail Modal ────────────────────────────────────────────── */
export function EPRDetailModal({ eprId, onClose, onEdited }) {
  const [epr, setEpr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getEPR(eprId);
      setEpr(res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eprId]);

  const handleSaved = () => { load(); onEdited(); };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">📋 EPR Details</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {epr && (
              <button className="btn btn-secondary btn-sm" id="edit-epr-btn" onClick={() => setShowEdit(true)}>✎ Edit</button>
            )}
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          {loading ? (
            <Spinner />
          ) : !epr ? (
            <p className="error-msg">Failed to load EPR detail.</p>
          ) : (
            <>
              {/* Meta */}
              <div className="epr-detail-meta">
                <div className="meta-item">
                  <div className="meta-key">Person</div>
                  <div className="meta-value">{epr.person_name}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-key">Evaluator</div>
                  <div className="meta-value">{epr.evaluator_name}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-key">Period Start</div>
                  <div className="meta-value">{formatDate(epr.period_start)}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-key">Period End</div>
                  <div className="meta-value">{formatDate(epr.period_end)}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-key">Role Type</div>
                  <div className="meta-value" style={{ textTransform: 'capitalize' }}>{epr.role_type}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-key">Status</div>
                  <div className="meta-value">
                    <span className={`badge badge-${epr.status}`}>{epr.status}</span>
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div className="ratings-row">
                <div className="rating-card">
                  <div className="rating-card-label">Overall</div>
                  <div className="rating-card-value">{epr.overall_rating}</div>
                  <Stars value={epr.overall_rating} />
                </div>
                <div className="rating-card">
                  <div className="rating-card-label">Technical</div>
                  <div className="rating-card-value" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {epr.technical_skills_rating}
                  </div>
                  <Stars value={epr.technical_skills_rating} />
                </div>
                <div className="rating-card">
                  <div className="rating-card-label">Non-Technical</div>
                  <div className="rating-card-value" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {epr.non_technical_skills_rating}
                  </div>
                  <Stars value={epr.non_technical_skills_rating} />
                </div>
              </div>

              {/* Remarks */}
              {epr.remarks && (
                <>
                  <div className="card-title" style={{ marginBottom: 8 }}>
                    <span className="card-title-icon">💬</span> Remarks
                  </div>
                  <div className="remarks-block">{epr.remarks}</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {showEdit && epr && (
        <EditEPRModal epr={epr} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}
