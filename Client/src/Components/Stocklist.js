import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StockList() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    axios.get('/api/all-stocks', { responseType: 'text' })
      .then(response => {
        const rows = response.data.split('\n');
        const stocks = rows.map(row => {
          const [symbol, name] = row.split(',');
          return { symbol, name };
        });
        setStocks(stocks);
      })
      .catch(error => console.error('There was an error fetching the stock list:', error));
  }, []);

  return (
    <div>
      <h2>All Stocks</h2>
      <ul>
        {stocks.map((stock, index) => (
          <li key={index}>{stock.symbol} - {stock.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default StockList;
