import { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : {
      host: 'localhost',
      port: '8000',
      baseUrl: 'http://localhost:8000'
    };
  });

  const updateConfig = (host, port) => {
    const newConfig = {
      host,
      port,
      baseUrl: `http://${host}:${port}`
    };
    setConfig(newConfig);
    localStorage.setItem('apiConfig', JSON.stringify(newConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
