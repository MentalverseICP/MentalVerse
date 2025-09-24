import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Waitlist from './components/waitlist/waitlist';

ReactDOM.createRoot(document.getElementById('waitlist-root')!).render(
  <React.StrictMode>
    <Waitlist />
  </React.StrictMode>,
);