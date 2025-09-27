import React from "react";
import {
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Users from "../pages/Users/Users";
import Students from "../pages/Students/Students";
import Projects from "../pages/Projects/Projects";
import Evaluations from "../pages/Evaluations/Evaluations";
import NavBar from "./Sidebar";

function Navigation() {
  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/students" element={<Students />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/evaluations" element={<Evaluations />} />
        </Routes>
      </div>
    </div>
  );
}

export default Navigation;