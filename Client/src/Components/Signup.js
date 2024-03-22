import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

// Signup component to allow users to create an account
function Signup() {
  const [NAME, setName] = useState('');
  const [EMAIL, setEmail] = useState('');
  const [PASSWORD_HASH, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://capstoneprojectmcsbt1.ew.r.appspot.com/signup', { NAME, PASSWORD_HASH, EMAIL })
      .then(response => {
        alert(response.data.message); // Show signup success message
        navigate('https://capstoneprojectmcsbt1.ew.r.appspot.com/login'); // Redirect to login page after successful signup
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
        onChange={(e) => setName(e.target.value)}
      />
      <label>Email:</label>
      <input
        type="email"
        value={EMAIL}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>Password:</label>
      <input
        type="password"
        value={PASSWORD_HASH}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
