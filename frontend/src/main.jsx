import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { QuoteProvider } from './context/QuoteContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <QuoteProvider>
          <App />
        </QuoteProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
