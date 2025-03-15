import LeaveForm from "./LeaveForm";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar"
import "./Dashboard.css"; // Import CSS file

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Navbar/>
      <Sidebar />
      <div className="dashboard-box">
        <LeaveForm />
      </div>
    </div>
  );
};

export default Dashboard;
