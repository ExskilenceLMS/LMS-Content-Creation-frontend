import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
    <AppRoutes />
</Router>

  );
}

export default App;
