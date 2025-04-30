import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // Initialize Locatorjs only in development mode
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Use dynamic import to load Locatorjs only in browser
      import('@locator/runtime').then(({ install }) => {
        install({
          // Default to disabled, can be enabled with Alt+Shift+L
          disabled: true
        });
      }).catch(err => {
        console.log('Locatorjs could not be loaded:', err);
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;