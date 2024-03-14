import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import StockDetails from './Components/Stockdetails';
import StockList from './Components/Stocklist';
import Portfolio from './Components/Portfolio'; // Import the Portfolio component
import AddStockToPortfolio from './Components/Addtoportfolio'; // Import the AddStockToPortfolio component
import Login from './Components/Login';
import Signup from './Components/Signup';


function App() {
  const [stocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = 1; // Mock user ID, replace with actual user ID retrieval logic

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

  const refreshPortfolio = () => {
    // Add logic here if you need to refresh the portfolio list
    // after adding a new stock, for example
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Router>
      <div>
        {/* Example navigation buttons */}
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
          <Link to="/portfolio" style={{ marginRight: '10px' }}>View Portfolio</Link>
          <Link to="/add-stock" style={{ marginRight: '10px' }}>Add Stock to Portfolio</Link>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/signup" style={{ marginRight: '10px' }}>Signup</Link>
        </nav>

        <Routes>
          <Route path="/" element={<StockList stocks={stocks} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/stock/:symbol" element={<StockDetails />} />
          <Route path="/portfolio" element={<Portfolio userId={1} />} />
          <Route path="/add-stock" element={<AddStockToPortfolio userId={1} onStockAdded={() => {}} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
