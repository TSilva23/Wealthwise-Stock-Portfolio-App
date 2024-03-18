import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './Usercontext';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
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
        setPortfolio(response.data);
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
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Your Portfolio</h1>
      {portfolio.length > 0 ? (
        <ul>
          {portfolio.map((stock, index) => (
            <li key={index}>
              Symbol: {stock.SYMBOL}, Name: {stock.NAME}, Quantity: {stock.QUANTITY}, 
              Acquisition Price: {stock.ACQUISITION_PRICE}, Acquisition Date: {stock.ACQUISITION_DATE}
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
