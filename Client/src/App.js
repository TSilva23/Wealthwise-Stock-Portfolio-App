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
    console.log("CSV Input Preview:", text.substring(0, 500));
    
    
    const lines = text.split('\n').filter(line => line);
    if (lines.length < 2) {
      throw new Error("CSV is empty or missing headers.");
    }
    const headers = lines.shift().split(',').map(header => header.trim());
    return lines.map(line => {
      const data = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(value => 
        value[0] === '"' && value[value.length - 1] === '"' ? value.slice(1, -1) : value
      );
      if (data.length !== headers.length) {
        throw new Error("Row length doesn't match headers.");
      }
      return headers.reduce((obj, nextKey, index) => {
        obj[nextKey] = data[index];
        return obj;
      }, {});
    });
  }

  useEffect(() => {
    axios.get('/api/all-stocks', { responseType: 'text' })
      .then(response => {
        console.log(response)
        try {
          const parsedData = parseCSV(response.data);
          setStocks(parsedData);
        } catch (parseError) {
          setError('Failed to parse stock data. Please try again later.');
        }
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
