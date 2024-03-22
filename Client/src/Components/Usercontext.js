import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);
// UserContext to store the user ID and provide it to other components
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem('USER_ID') || null);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
