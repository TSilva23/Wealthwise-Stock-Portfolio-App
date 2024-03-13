import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import StockDetails from './Components/Stockdetails';
import StockList from './Components/Stocklist';
import LoginForm from './Components/Loginform';

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
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.token) {
        // Save the token locally (localStorage/sessionStorage)
        localStorage.setItem('token', data.token);
        // Redirect or change the component state as logged in
      } else {
        // Handle login error (e.g., show an error message)
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  useEffect(() => {
    axios.get('/api/all-stocks', { responseType: 'text' })
      .then(response => {
        try {
          const parsedData = parseCSV(response.data);
          setAllStocks(parsedData);
        } catch (parseError) {
          setError('Failed to parse stock data. Please try again later.');
        }
        setLoading(false);
      })
      .catch(() => {
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
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
}

export default App;
