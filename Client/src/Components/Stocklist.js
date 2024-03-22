import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './Usercontext';

function StockList({ stocks }) {
  const { userId } = useUser(); // Retrieve the current user's ID from context
  const addToPortfolio = (symbol) => {
    // Connecting to the endpoint to fetch the current stock price and date
    axios.get(`https://capstoneprojectmcsbt1.ew.r.appspot.com/api/quote/${symbol}`)
      .then(response => {
        const currentPrice = response.data['Global Quote']['05. price'];
        const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Add the stock to the portfolio
        axios.post('https://capstoneprojectmcsbt1.ew.r.appspot.com/api/portfolio/add', {
          USER_ID: userId, // Use the dynamically obtained user ID
          SYMBOL: symbol,
          QUANTITY: 1,
          ACQUISITION_PRICE: currentPrice,
          ACQUISITION_DATE: currentDate
        })
        .then(() => alert(`${symbol} added to your portfolio.`))
        .catch(error => alert('Error adding stock to portfolio.'));
      })
      .catch(error => {
        console.error('Error fetching current stock price:', error);
        alert('Failed to fetch current stock price. Please try again later.');
      });
  };
  if (!stocks || stocks.length === 0) {
    return <div>No stocks available.</div>;
  }

  return (
    <div>
      <h1>All Stocks</h1>
      <ul>
        {stocks.map((stock, index) => (
          <li key={stock.symbol || index}>
            <Link to={`https://capstoneprojectmcsbt1.ew.r.appspot.com/stock/${stock.symbol}`} style={{ marginRight: '10px' }}>
              {stock.symbol} - {stock.name}
            </Link>
            <button onClick={() => addToPortfolio(stock.symbol)}>Add to Portfolio</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StockList;
