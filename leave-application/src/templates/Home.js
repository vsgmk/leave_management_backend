import { Link } from "react-router-dom";
import "./Home.css"; // Import CSS file

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Leave Application</h1>
      <div className="home-buttons">
        <div>
          <Link to="/login?type=student">
            <button className="home-button student-login">Student Login</button>
          </Link>
          <Link to="/login?type=teacher">
            <button className="home-button teacher-login">Teacher Login</button>
          </Link>
        </div>
        <div>
          <Link to="/register?type=student">
            <button className="home-button student-register">Student Register</button>
          </Link>
          <Link to="/register?type=teacher">
            <button className="home-button teacher-register">Teacher Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
