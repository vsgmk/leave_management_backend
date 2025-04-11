import LeaveForm from "./LeaveForm";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer"; // Import Footer
import "./Dashboard.css"; // Import CSS file

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper"> {/* Flex container for sidebar + main */}
      <Sidebar />

      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-main">
          <LeaveForm />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
