import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false); // State to manage loading status
    
    const handleLogout = () => {
        setIsLoading(true); // Begin loading
        axios.post('/logout')
            .then(response => {
                alert(response.data.message); // Show logout success message
                navigate('/login'); // Redirect to login page after successful logout
            })
            .catch(error => {
                alert(error.response?.data?.message || 'An error occurred'); // Show error message, handling potential undefined errors
            })
            .finally(() => setIsLoading(false)); // End loading regardless of outcome
    };
    
    return (
        <button onClick={handleLogout} disabled={isLoading} style={{ cursor: isLoading ? 'not-allowed' : 'pointer', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
            {isLoading ? 'Logging Out...' : 'Logout'}
        </button>
    );
}

export default Logout;
