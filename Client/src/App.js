import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StockDetails from './Components/Stockdetails';
import AllStocksPage from './Components/Stocklist';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllStocksPage/>} />
        <Route path="/stock/:symbol" element={<StockDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
