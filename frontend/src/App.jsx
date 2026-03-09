import { PeopleDirectory } from './components/PeopleDirectory.jsx';

function App() {
  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <nav className="topnav">
        <div className="topnav-brand">
          <div className="brand-logo">SN</div>
          <div>
            <span className="brand-name">SKYNET</span>
            <span className="brand-subtitle">EPR · Electronic Performance Records</span>
          </div>
        </div>

      </nav>

      {/* Main Content */}
      <PeopleDirectory />
    </div>
  );
}

export default App;
