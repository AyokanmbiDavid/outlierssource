import axios from 'axios';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';

export const all_provider = createContext();
    
const ContextProvider = ({children}) => {
  return (
    <all_provider.Provider value={{
    }}>
      {children}
    </all_provider.Provider>
  );
};

export default ContextProvider;
