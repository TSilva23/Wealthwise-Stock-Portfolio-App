import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function StockDetails() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    axios.get(`/api/stock/${symbol}`)
      .then(response => {
        setStockData(response.data);
      })
      .catch(error => console.error('There was an error fetching the stock data:', error));

    axios.get(`/api/quote/${symbol}`)
      .then(response => {
        setQuote(response.data["Global Quote"]);
      })
      .catch(error => console.error('There was an error fetching the stock quote:', error));
  }, [symbol]);

  return (
    <div>
      <h2>Stock Details: {symbol}</h2>
      {stockData && (
        <div>
          <h3>Weekly Time Series</h3>
          {/* Implement the visualization of time series data */}
        </div>
      )}
      {quote && (
        <div>
          <h3>Latest Quote</h3>
          <p>Open: {quote["02. open"]}</p>
          <p>High: {quote["03. high"]}</p>
          <p>Low: {quote["04. low"]}</p>
          <p>Price: {quote["05. price"]}</p>
          <p>Volume: {quote["06. volume"]}</p>
        </div>
      )}
    </div>
  );
}

export default StockDetails;
