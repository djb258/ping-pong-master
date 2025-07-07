/**
 * Main Application Page
 * 
 * Entry point for the Ping-Pong Prompt application.
 * Follows Barton Doctrine: simple, focused, and properly structured.
 */

import Head from 'next/head';
import PingPongForm from '../components/PingPongForm';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ping-Pong Prompt App</title>
        <meta 
          name="description" 
          content="AI-powered prompt refinement tool with ping-pong interactions. Refine your prompts using advanced language models." 
        />
        <meta name="keywords" content="AI, prompt engineering, LLM, refinement, ping-pong" />
        <meta name="author" content="Ping-Pong Prompt App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ping-Pong Prompt App" />
        <meta property="og:description" content="AI-powered prompt refinement tool with ping-pong interactions" />
        <meta property="og:site_name" content="Ping-Pong Prompt App" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#667eea" />
        
        {/* Preconnect to potential external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>

      <main>
        <PingPongForm />
      </main>
    </>
  );
} 