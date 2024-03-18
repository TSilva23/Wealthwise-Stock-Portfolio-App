import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { UserProvider } from './Components/Usercontext'; // Make sure the path matches where you place UserContext.js
import StockDetails from './Components/Stockdetails';
import StockList from './Components/Stocklist';
import Portfolio from './Components/Portfolio';
import AddStockToPortfolio from './Components/Addtoportfolio';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Logout from './Components/Logout';

function App() {
  const [stocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('https://capstoneprojectmcsbt1.ew.r.appspot.com/api/all-stocks', { responseType: 'text' })
      .then(response => {
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

        const parsedData = parseCSV(response.data);
        setAllStocks(parsedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load stocks:', error);
        setError('Failed to load stocks. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <UserProvider> {/* Wrap the entire Router with UserProvider */}
      <Router>
        <div>
          {/* Navigation */}
          <nav style={{ marginBottom: '20px' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            <Link to="/portfolio" style={{ marginRight: '10px' }}>View Portfolio</Link>
            <Link to="/add-stock" style={{ marginRight: '10px' }}>Add Stock to Portfolio</Link>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/signup" style={{ marginRight: '10px' }}>Signup</Link>
            <Link to="/logout" style={{ marginRight: '10px' }}>Logout</Link>
          </nav>

          <Routes>
            <Route path="/" element={<StockList stocks={stocks} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/stock/:symbol" element={<StockDetails />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/add-stock" element={<AddStockToPortfolio onStockAdded={() => {}} />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
