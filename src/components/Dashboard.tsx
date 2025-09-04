import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("britamFirstName") || "";

  return (
    <div className="dashboard-container">
      <h1>Good {new Date().getHours() >= 12 ? "Afternoon" : "Morning"}, {firstName}</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate("/training")}>
          <h2>Training Audios</h2>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/change-password")}>
          <h2>Account Management</h2>
        </div>
        <div className="dashboard-card" onClick={() => { localStorage.clear(); navigate("/login"); }}>
          <h2>Logout</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;