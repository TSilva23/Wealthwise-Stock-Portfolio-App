import React from 'react';
import { Link } from 'react-router-dom';

function StockList({ stocks }) {
  if (!stocks || stocks.length === 0) {
    return <div>No stocks available.</div>;
  }

  return (
    <div>
      <h1>All Stocks</h1>
      <ul>
        {stocks.map((stock, index) => (
          <li key={stock.symbol || index}>
            <Link to={`/stock/${stock.symbol}`}>
              {stock.symbol} - {stock.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StockList;
