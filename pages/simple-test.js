/**
 * Simple test page to isolate issues
 */

import Head from 'next/head';
import SimpleAltitudeForm from '../components/SimpleAltitudeForm';

export default function SimpleTest() {
  return (
    <>
      <Head>
        <title>Simple Altitude Test</title>
      </Head>

      <main>
        <SimpleAltitudeForm />
      </main>
    </>
  );
} 