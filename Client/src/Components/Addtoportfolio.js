import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './Usercontext'; 

// AddStockToPortfolio component to allow users to add a stock to their portfolio

const AddStockToPortfolio = ({ onStockAdded }) => {
  const { userId } = useUser(); // Use the useUser hook to access userId
  const [SYMBOL, setSYMBOL] = useState('');
  const [QUANTITY, setQuantity] = useState('');
  const [ACQUISITION_PRICE, setAcquisitionPrice] = useState('');
  const [ACQUISITION_DATE, setAcquisitionDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to add a stock to your portfolio.');
      return;
    }
    axios.post('/api/portfolio/add', {
      SYMBOL,
      QUANTITY,
      ACQUISITION_PRICE,
      ACQUISITION_DATE
    }, {
      headers: {
        // Assuming you are using sessions for authentication
        'Authorization': `Bearer ${userId}`
      }
    })
    .then(() => {
      onStockAdded();
      setSYMBOL('');
      setQuantity('');
      setAcquisitionPrice('');
      setAcquisitionDate('');
      setError(''); // Clear any existing error
    })
    .catch(error => {
      console.error('Error adding stock to portfolio:', error);
      setError('Failed to add stock to portfolio. Please try again later.');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Stock to Portfolio</h2>
      <input type="text" value={SYMBOL} onChange={e => setSYMBOL(e.target.value)} placeholder="Stock SYMBOL" required />
      <input type="number" value={QUANTITY} onChange={e => setQuantity(e.target.value)} placeholder="Quantity" required />
      <input type="text" value={ACQUISITION_PRICE} onChange={e => setAcquisitionPrice(e.target.value)} placeholder="Acquisition Price" required />
      <input type="date" value={ACQUISITION_DATE} onChange={e => setAcquisitionDate(e.target.value)} placeholder="Acquisition Date" required />
      <button type="submit">Add to Portfolio</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default AddStockToPortfolio;