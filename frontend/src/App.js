import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import ItemPage from './pages/ItemPage';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" index element={<LoginPage />} />
      <Route path="/Items" index element={<ItemPage />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;
