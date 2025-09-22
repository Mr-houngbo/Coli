import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Coli - Plateforme d'envoi de colis</title>
        <meta name="description" content="Coli - La plateforme qui connecte expéditeurs et voyageurs pour des livraisons rapides et économiques" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
