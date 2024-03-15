import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        axios.post('/logout')
        .then(response => {
            alert(response.data.message); // Show logout success message
            navigate('/login'); // Redirect to login page after successful logout
        })
        .catch(error => {
            alert(error.response.data.message); // Show error message
        });
    };
    
    return (
        <button onClick={handleLogout}>Logout</button>
    );
    
}


export default Logout;