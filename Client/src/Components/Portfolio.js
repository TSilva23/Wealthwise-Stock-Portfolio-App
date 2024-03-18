import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './Usercontext';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0); // Initialized to 0 to avoid undefined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId } = useUser();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/portfolio`, {
          headers: {
            'Authorization': `Bearer ${userId}`
          }
        });
        if (response.data && response.data.stocks) {
          setPortfolio(response.data.stocks); // Assuming response structure includes a "stocks" array
          setTotalValue(response.data.total_current_value || 0); // Fallback to 0 if undefined
        } else {
          // Handle unexpected response structure
          console.error('Unexpected response structure:', response);
          setError('Failed to load portfolio. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setError('Failed to load portfolio. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPortfolio();
    } else {
      setError('No user ID found. Please log in.');
      setLoading(false);
    }
  }, [userId]); // Dependency array includes userId to re-fetch if it changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Your Portfolio</h1>
      <h2>Total Value: ${totalValue ? totalValue.toFixed(2) : '0.00'}</h2>
      {portfolio.length > 0 ? (
        <ul>
          {portfolio.map((stock, index) => (
            <li key={index}>
              Symbol: {stock.SYMBOL}, Name: {stock.NAME}, Quantity: {stock.QUANTITY}, 
              Acquisition Price: {stock.ACQUISITION_PRICE}, Acquisition Date: {stock.ACQUISITION_DATE}, 
              Current Price: {stock.CURRENT_PRICE ? stock.CURRENT_PRICE.toFixed(2) : 'N/A'},
              Current Value: {stock.CURRENT_VALUE ? stock.CURRENT_VALUE.toFixed(2) : 'N/A'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Your portfolio is empty.</p>
      )}
    </div>
  );
};

export default Portfolio;
