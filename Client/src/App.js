import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import StockDetails from './Components/Stockdetails';
import StockList from './Components/Stocklist';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function parseCSV(text) {
    const lines = text.split('\n').filter(line => line); // Filter out empty lines
    const headers = lines.shift().split(',');
    return lines.map(line => {
      const data = line.split(',');
      return headers.reduce((obj, nextKey, index) => {
        obj[nextKey] = data[index];
        return obj;
      }, {});
    });
  }

  useEffect(() => {
    axios.get('/api/all-stocks', { responseType: 'text' })
      .then(response => {
        const parsedData = parseCSV(response.data);
        setStocks(parsedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load stocks. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<StockList stocks={stocks} />} />
        <Route path="/stock/:symbol" element={<StockDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
