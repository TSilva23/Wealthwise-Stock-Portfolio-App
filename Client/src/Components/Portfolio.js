import React from 'react';
import { Link } from 'react-router-dom';


function Portfolio({ stocks }) {
    if (!stocks || stocks.length === 0) {
      return <div>Your portfolio is empty.</div>;
    }
  
    return (
      <div>
        <h1>My Portfolio</h1>
        <ul>
          {stocks.map((stock) => (
            <li key={stock.symbol}>
              <div>
                <span>{stock.symbol} - {stock.name}</span>
                <Link to={`/stock/${stock.symbol}`}>SEE DETAILS</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  export default Portfolio;