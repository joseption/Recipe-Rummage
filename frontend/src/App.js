import React, { useEffect, useState } from 'react';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => {
      var info = JSON.parse(localStorage.getItem('user_data'));
      return info && !!info.id;
    }
  );

  return (
    <BrowserRouter>
    <Routes>
    <Route
          path="/"
          element={isAuthenticated
            ? <Navigate to="/profile" replace />
            : <Navigate to="/login" replace />
          }
        />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;
