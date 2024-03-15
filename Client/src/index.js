import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserProvider } from './Components/Usercontext'; // Adjust the import path based on where you define UserContext
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <UserProvider>
    <App />
  </UserProvider>,
);
