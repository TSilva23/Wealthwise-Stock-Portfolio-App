import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Assuming you switch to axios for consistency

const StockDetails = () => {
  const [stockData, setStockData] = useState({});
  const [quote, setQuote] = useState({});
  const [error, setError] = useState('');
  const { symbol } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        const stockResponse = await axios.get(`/api/stock/${symbol}`);
        setStockData(stockResponse.data['Weekly Time Series'] || {});

        const quoteResponse = await axios.get(`/api/quote/${symbol}`);
        setQuote(quoteResponse.data['Global Quote'] || {});
      } catch (error) {
        console.error('There was an error fetching the stock data:', error);
        setError('Error fetching data. Please try again later.');
      }
    }
    fetchData();
  }, [symbol]);

  if (error) return <div>Error fetching data: {error}</div>;
  if (!Object.keys(stockData).length || !Object.keys(quote).length) return <div>Loading...</div>;

  const { lastPrice, highPrice, lowPrice, volume, openPrice, previousClose } = quote;

  return (
    <div>
      <h1>{symbol}</h1>
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
