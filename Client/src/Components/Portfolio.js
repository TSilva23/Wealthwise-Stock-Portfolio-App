// Portfolio.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Portfolio = ({ USER_ID }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/portfolio/${USER_ID}`)
      .then(response => {
        setPortfolio(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching portfolio:', error);
        setError('Failed to load portfolio. Please try again later.');
        setLoading(false);
      });
  }, [USER_ID]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Your Portfolio</h1>
      <ul>
        {portfolio.map((stock, index) => (
          <li key={index}>
            Symbol: {stock.symbol}, Name: {stock.name}, Quantity: {stock.quantity}, 
            Acquisition Price: {stock.acquisition_price}, Acquisition Date: {stock.acquisition_date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio;
