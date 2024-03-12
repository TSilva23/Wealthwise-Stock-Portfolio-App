import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StockDetails = () => {
  const [originalData, setOriginalData] = useState([]);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState('');
  const { symbol } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/api/stock/${symbol}`);
        const weeklyTimeSeries = response.data["Weekly Time Series"];
        const chartData = Object.entries(weeklyTimeSeries).map(([date, data]) => ({
          date,
          open: parseFloat(data["1. open"]),
          high: parseFloat(data["2. high"]),
          low: parseFloat(data["3. low"]),
          close: parseFloat(data["4. close"]),
          volume: parseFloat(data["5. volume"]),
        }));
        setOriginalData(chartData);
        setDetails(chartData);
      } catch (error) {
        console.error("Error fetching details:", error);
        setError('Error fetching data. Please try again later.');
      }
    };

    fetchDetails();
  }, [symbol]);

  if (error) return <div>Error fetching data: {error}</div>;
  if (!details.length) return <div>Loading...</div>;

  // Assuming you want to display the last entry in the details array
  const { date, open, high, low, close, volume } = details[details.length - 1] || {};

  return (
    <div>
      <h1>{symbol}</h1>
      <h2>Trading Details</h2>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Open:</strong> ${open}</p>
      <p><strong>High:</strong> ${high}</p>
      <p><strong>Low:</strong> ${low}</p>
      <p><strong>Close:</strong> ${close}</p>
      <p><strong>Volume:</strong> {volume}</p>
    </div>
  );
};

export default StockDetails;
