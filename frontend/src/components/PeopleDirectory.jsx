import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { getInitials, avatarClass, Spinner } from '../utils.jsx';
import { PersonDetail } from './PersonDetail.jsx';

export function PeopleDirectory() {
  const [tab, setTab] = useState('student');
  const [search, setSearch] = useState('');
  const [people, setPeople] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Load all users (for evaluator dropdown)
  useEffect(() => {
    api.getPeople().then((res) => setAllUsers(res.data)).catch(() => {});
  }, []);

  const loadPeople = useCallback(() => {
    setLoading(true);
    const params = { role: tab };
    if (search.trim()) params.search = search.trim();
    api.getPeople(params)
      .then((res) => setPeople(res.data))
      .catch(() => setPeople([]))
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => {
    const timer = setTimeout(loadPeople, 250);
    return () => clearTimeout(timer);
  }, [loadPeople]);

  // Reset selection on tab change
  useEffect(() => { setSelected(null); }, [tab]);

  return (
    <div className="main-area">
      {/* ── Left Pane ── */}
      <div className="left-panel">
        <div className="panel-header">
          <div className="panel-title">Directory</div>
          <div className="tab-toggle">
            <button
              id="tab-students"
              className={`tab-btn ${tab === 'student' ? 'active' : ''}`}
              onClick={() => setTab('student')}
            >
              ✈ Students
            </button>
            <button
              id="tab-instructors"
              className={`tab-btn ${tab === 'instructor' ? 'active' : ''}`}
              onClick={() => setTab('instructor')}
            >
              🎓 Instructors
            </button>
          </div>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="people-search"
              type="text"
              className="search-input"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="people-list">
          {loading ? (
            <Spinner />
          ) : people.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No results found</div>
            </div>
          ) : (
            people.map((person) => (
              <div
                key={person.id}
                id={`person-${person.id}`}
                className={`person-item ${selected?.id === person.id ? 'selected' : ''}`}
                onClick={() => setSelected(person)}
              >
                <div className={`person-avatar ${avatarClass(person.role)}`}>
                  {getInitials(person.name)}
                </div>
                <div className="person-info">
                  <div className="person-name">{person.name}</div>
                  {person.role === 'student' ? (
                    <div className="person-meta">
                      {person.course_name || 'No course'} · {person.enrollment_status || '—'}
                    </div>
                  ) : (
                    <div className="person-meta">
                      {person.total_eprs_written} EPRs written
                    </div>
                  )}
                </div>
                <span className={`badge badge-${person.role === 'student' ? (person.enrollment_status || 'active') : 'instructor'}`}>
                  {person.role === 'student' ? (person.enrollment_status || '—') : 'Instr.'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right Pane ── */}
      <div className="right-panel">
        {selected ? (
          <PersonDetail person={selected} allUsers={allUsers} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <div className="empty-title">Select a person</div>
            <div className="empty-subtitle">Choose from the directory to view their profile and EPRs</div>
          </div>
        )}
      </div>
    </div>
  );
}
