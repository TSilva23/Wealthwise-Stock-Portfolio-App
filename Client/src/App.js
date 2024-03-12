import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StockList from './Components/Stocklist';
import StockDetails from './Components/Stockdetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/api/all-stocks" element={<StockList />} />
        <Route path="/stock/:symbol" element={<StockDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
