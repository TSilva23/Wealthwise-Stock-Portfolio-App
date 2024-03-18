import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from './Usercontext';

function Login() {
  const [NAME, setUsername] = useState('');
  const [PASSWORD_HASH, setPassword] = useState('');
  const { setUserId } = useUser();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://capstoneprojectmcsbt1.ew.r.appspot.com/login', { NAME, PASSWORD_HASH })
      .then(response => {
        alert(response.data.message); // Show login success message
        setUserId(response.data.USER_ID);
        localStorage.setItem('USER_ID', response.data.USER_ID);
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
