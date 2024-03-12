import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

require('react-dom');
window.React2 = require('react');
console.log(window.React1 === window.React2);

function AllStocksPage() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/all-stocks')
            .then(response => response.json())
            .then(data => {
                setStocks(data);
                setIsLoading(false);
            })
            .catch(error => {
                setError(error);
                setIsLoading(false);
            });
    }, []);

    if (error) return <div>Error loading stocks: {error.message}</div>;
    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1>All Stocks</h1>
            <ul>
                {stocks.map((stock, index) => (
                    <li key={stock.symbol || index}> {/* Prefer unique ID if available */}
                        <Link to={`/stock/${stock['symbol']}`}>{stock['symbol']} - {stock['name']}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AllStocksPage;
