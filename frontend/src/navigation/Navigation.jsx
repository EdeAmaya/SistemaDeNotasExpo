import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";

function Navigation() {
  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/activities" element={<Activities />} />
        </Routes>
      </div>
    </div>
  );
}

export default Navigation;