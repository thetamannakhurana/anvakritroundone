import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Anvakrit Round One</title>
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        html, body {
          overflow-x: hidden;
          width: 100%;
          font-size: 16px;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        a, button, input, select {
          min-height: 44px;
        }

        input, select, textarea {
          font-size: 16px !important;
        }
      `}</style>
      
      <Component {...pageProps} />
    </SessionProvider>
  );
}
