import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
