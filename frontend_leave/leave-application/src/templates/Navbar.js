import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import "./Navbar.css";
import { CalendarCheck, FileMinus, ClipboardList } from "lucide-react";

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
      <h2 className="navbar-title"><ClipboardList size={20} className="mr-2" /> Leave Management
      </h2>
    </div>
  );
};

export default Navbar;
