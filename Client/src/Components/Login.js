import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [NAME, setUsername] = useState('');
  const [PASSWORD_HASH, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/login', { NAME, PASSWORD_HASH })
      .then(response => {
        alert(response.data.message); // Show login success message
        navigate('/'); // Redirect to homepage or dashboard after successful login
      })
      .catch(error => {
        alert(error.response.data.message); // Show error message
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Username:</label>
      <input
        type="text"
        value={NAME}
        onChange={(e) => setUsername(e.target.value)}
      />
      <label>Password:</label>
      <input
        type="password"
        value={PASSWORD_HASH}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
