import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "User");
    }
  }, []);

  return (
    <div className="navbar">
      <h1 className="navbar-title">Welcome</h1>
      <User className="navbar-icon" />
    </div>
  );
};

export default Navbar;
