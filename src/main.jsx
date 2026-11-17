import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextProvider from './components/ContextProvider.jsx';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from "./context/NotificationContext";
import NotificationPanel from "./components/NotificationPanel";

createRoot(document.getElementById('root')).render(
  <ContextProvider>
    <BrowserRouter>
      <NotificationProvider>
     <App />
    <NotificationPanel />
    </NotificationProvider>
    </BrowserRouter>
  </ContextProvider>
)
