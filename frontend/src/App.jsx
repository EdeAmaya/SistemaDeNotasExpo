import React from "react";
import {
  BrowserRouter as Router
} from "react-router-dom";
import Navigation from "./navigation/Navigation";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
      </Router>
      <Toaster
        toastOptions={{
          duration: 1000,
        }}
      />
    </AuthProvider>
  );
}

export default App;