import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { MyListProvider } from './context/MyListContext';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { DownloadsProvider } from './context/DownloadsContext';
import { PremiumProvider } from './context/PremiumContext';
import { AdProvider } from './context/AdContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <PremiumProvider>
            <MyListProvider>
              <DownloadsProvider>
                <AdProvider>
                  <PlayerProvider>
                    <App />
                  </PlayerProvider>
                </AdProvider>
              </DownloadsProvider>
            </MyListProvider>
          </PremiumProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);