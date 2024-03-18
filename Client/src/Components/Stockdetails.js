import React, { useState, useEffect } from 'react';
import { useUser } from './Usercontext'; // Import the hook from your context file

import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Chart } from 'react-chartjs-2';
import "chart.js/auto";
import "chartjs-adapter-date-fns";


const StockDetails = () => {
  const [originalData, setOriginalData] = useState([]);
  const [details, setDetails] = useState({});
  const [latestQuote, setLatestQuote] = useState({});
  const [error, setError] = useState('');
  const { symbol } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch the historical data for the stock
        const response = await axios.get(`https://capstoneprojectmcsbt1.ew.r.appspot.com/api/stock/${symbol}`);
        const weeklyTimeSeries = response.data['Weekly Time Series'];
        const chartData = Object.entries(weeklyTimeSeries).map(([date, data]) => ({
          date,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseFloat(data['5. volume']),
        }));
        setOriginalData(chartData);
        setDetails(chartData[0]); // Assume the latest entry is the first one

        // Fetch the latest quote for the stock
        const quoteResponse = await axios.get(`https://capstoneprojectmcsbt1.ew.r.appspot.com/api/quote/${symbol}`);
        const quoteData = quoteResponse.data['Global Quote'];
        setLatestQuote({
          open: parseFloat(quoteData['02. open']),
          high: parseFloat(quoteData['03. high']),
          low: parseFloat(quoteData['04. low']),
          price: parseFloat(quoteData['05. price']),
          volume: parseFloat(quoteData['06. volume']),
          latestTradingDay: quoteData['07. latest trading day'],
          previousClose: parseFloat(quoteData['08. previous close']),
          change: parseFloat(quoteData['09. change']),
          changePercent: quoteData['10. change percent'],
        });
      } catch (error) {
        console.error('Error fetching details:', error);
        setError('Error fetching data. Please try again later.');
      }
    };

    fetchDetails();
  }, [symbol]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'll',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
  };

  const chartData = {
    labels: originalData.map(data => data.date),
    datasets: [
      {
        label: 'Open',
        data: originalData.map(data => data.open),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Close',
        data: originalData.map(data => data.close),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  if (error) return <div>Error fetching data: {error}</div>;
  if (!originalData.length) return <div>Loading...</div>;

  return (
    <div>
      <h1>{symbol}</h1>
      {latestQuote && (
        <div>
          <h2>Latest Quote</h2>
          <p>Open: {latestQuote.open}</p>
          <p>High: {latestQuote.high}</p>
          <p>Low: {latestQuote.low}</p>
          <p>Price: {latestQuote.price}</p>
          <p>Volume: {latestQuote.volume}</p>
          <p>Latest Trading Day: {latestQuote.latestTradingDay}</p>
          <p>Previous Close: {latestQuote.previousClose}</p>
          <p>Change: {latestQuote.change}</p>
          <p>Change Percent: {latestQuote.changePercent}</p>
        </div>
      )}
      <div>
        <h2>Historical Stock Performance</h2>
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StockDetails;
