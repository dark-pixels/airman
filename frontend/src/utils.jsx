// Utility helpers

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatPeriod(start, end) {
  if (!start || !end) return '—';
  const s = new Date(start);
  const e = new Date(end);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sY = s.getFullYear();
  const eY = e.getFullYear();
  const sM = months[s.getMonth()];
  const eM = months[e.getMonth()];
  if (sY === eY) return `${sM} – ${eM} ${eY}`;
  return `${sM} ${sY} – ${eM} ${eY}`;
}

export function avatarClass(role) {
  if (role === 'student') return 'avatar-student';
  if (role === 'instructor') return 'avatar-instructor';
  return 'avatar-admin';
}

export function badgeClass(role) {
  return `badge badge-${role}`;
}

export function Stars({ value }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star ${i <= value ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Loading…</span>
    </div>
  );
}
