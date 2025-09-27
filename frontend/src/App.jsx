import React from "react";
import {
  BrowserRouter as Router
} from "react-router-dom";
import Navegation from "./navigation/Navigation";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Navegation />
      <Toaster
        toastOptions={{
          duration: 1000,
        }}
      />
    </Router>
  );
}

export default App;