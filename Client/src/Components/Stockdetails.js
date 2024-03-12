import React, { useState, useEffect } from 'react';

const StockDetails = ({ match }) => {
  const [stockData, setStockData] = useState(null);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const symbol = match.params.symbol;

  useEffect(() => {
    async function fetchData() {
      try {
        const stockResponse = await fetch(`/api/stock/${symbol}`);
        const stockDetailsJson = await stockResponse.json();
        setStockData(stockDetailsJson['Weekly Time Series']);

        const quoteResponse = await fetch(`/api/quote/${symbol}`);
        const quoteDetailsJson = await quoteResponse.json();
        setQuote(quoteDetailsJson['Global Quote']);
      } catch (error) {
        console.error('There was an error fetching the stock data:', error);
        setError(error);
      }
    }
    fetchData();
  }, [symbol]);

  if (error) return <div>Error fetching data: {error.message}</div>;
  if (!stockData || !quote) return <div>Loading...</div>;

  const { name } = stockData;
  const { lastPrice, highPrice, lowPrice, volume, openPrice, previousClose } = quote;

  return (
    <div>
      <h1>{name} ({symbol})</h1>
      <h2>Trading Details</h2>
      <p><strong>Last Price:</strong> ${lastPrice}</p>
      <p><strong>High:</strong> ${highPrice}</p>
      <p><strong>Low:</strong> ${lowPrice}</p>
      <p><strong>Volume:</strong> {volume}</p>
      <p><strong>Open Price:</strong> ${openPrice}</p>
      <p><strong>Previous Close:</strong> ${previousClose}</p>
    </div>
  );
};

export default StockDetails;
