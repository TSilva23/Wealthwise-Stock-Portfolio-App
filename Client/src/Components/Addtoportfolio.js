// AddStockToPortfolio.js
import React, { useState } from 'react';
import axios from 'axios';

const AddStockToPortfolio = ({ userId, onStockAdded }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [acquisitionPrice, setAcquisitionPrice] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/portfolio/add', {
      userId,
      symbol,
      quantity: parseInt(quantity, 10),
      acquisitionPrice: parseFloat(acquisitionPrice),
      acquisitionDate
    })
      .then(() => {
        onStockAdded();
        setSymbol('');
        setQuantity('');
        setAcquisitionPrice('');
        setAcquisitionDate('');
      })
      .catch(error => {
        console.error('Error adding stock to portfolio:', error);
        setError('Failed to add stock to portfolio. Please try again later.');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Stock to Portfolio</h2>
      <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Stock Symbol" required />
      <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity" required />
      <input type="text" value={acquisitionPrice} onChange={e => setAcquisitionPrice(e.target.value)} placeholder="Acquisition Price" required />
      <input type="date" value={acquisitionDate} onChange={e => setAcquisitionDate(e.target.value)} placeholder="Acquisition Date" required />
      <button type="submit">Add to Portfolio</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default AddStockToPortfolio;
