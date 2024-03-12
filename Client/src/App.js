import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import StockDetails from './Components/Stockdetails';
import StockList from './Components/Stocklist';
function App() {
  const [stocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const parseCSV = (csv) => {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',');
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
}
useEffect(() => {
  axios.get('/api/all-stocks', { responseType: 'text' })
    .then(response => {
      console.log(response)
      try {
        const parsedData = parseCSV(response.data);
        setAllStocks(parsedData); // Replace setStocks with setAllStocks
      } catch (parseError) {
        setError('Failed to parse stock data. Please try again later.');
      }
      setLoading(false);
    })
    .catch(() => { // Remove unused err parameter
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
