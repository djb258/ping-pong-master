/**
 * Main Application Page
 * 
 * Entry point for the Ping-Pong Prompt application.
 * Now includes both original and altitude-based refinement modes.
 */

import { useState } from 'react';
import Head from 'next/head';
import PingPongForm from '../components/PingPongForm';
import AltitudePingPongForm from '../components/AltitudePingPongForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('altitude'); // Default to altitude mode

  return (
    <>
      <Head>
        <title>Ping-Pong Prompt App</title>
        <meta 
          name="description" 
          content="AI-powered prompt refinement tool with ping-pong interactions and altitude-based logic. Refine your prompts using advanced language models." 
        />
        <meta name="keywords" content="AI, prompt engineering, LLM, refinement, ping-pong, altitude-based" />
        <meta name="author" content="Ping-Pong Prompt App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ping-Pong Prompt App" />
        <meta property="og:description" content="AI-powered prompt refinement tool with ping-pong interactions and altitude-based logic" />
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
        {/* APPROACH Acronym Display */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 20px 0 20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '2.5rem', 
              fontWeight: '700',
              textAlign: 'center'
            }}>
              🚀 APPROACH App
            </h1>
            <p style={{ 
              margin: '0 0 20px 0', 
              fontSize: '1.1rem', 
              textAlign: 'center',
              opacity: '0.9'
            }}>
              Altitude-Based Ping-Pong Prompt Refinement System
            </p>
            
            {/* APPROACH Acronym Display */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '1.3rem',
                textAlign: 'center'
              }}>
                📋 What APPROACH Stands For
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '12px',
                flexWrap: 'wrap',
                fontFamily: 'monospace'
              }}>
                {/* A - Altitude-based */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>A</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Altitude-<br/>based</div>
                </div>
                
                {/* P - Ping- */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>P</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Ping-</div>
                </div>
                
                {/* P - Pong */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>P</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Pong</div>
                </div>
                
                {/* R - Refinement */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>R</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Refinement</div>
                </div>
                
                {/* O - Operating */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>O</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Operating</div>
                </div>
                
                {/* A - Altitude- */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>A</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Altitude-</div>
                </div>
                
                {/* C - Coded */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>C</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Coded</div>
                </div>
                
                {/* H - Handoff */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '15px 8px',
                  borderRadius: '8px',
                  minWidth: '60px'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '10px'
                  }}>H</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    textAlign: 'center',
                    lineHeight: '1.1',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>Handoff</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 20px 0 20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '2px solid #e1e5e9',
            paddingBottom: '10px'
          }}>
            <button
              onClick={() => setActiveTab('altitude')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                background: activeTab === 'altitude' ? '#667eea' : '#f8f9fa',
                color: activeTab === 'altitude' ? 'white' : '#333',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
            >
              🚀 Altitude-Based Refinement
            </button>
            <button
              onClick={() => setActiveTab('original')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                background: activeTab === 'original' ? '#667eea' : '#f8f9fa',
                color: activeTab === 'original' ? 'white' : '#333',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
            >
              🔄 Original Ping-Pong
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'altitude' ? (
          <AltitudePingPongForm />
        ) : (
          <PingPongForm />
        )}
      </main>
    </>
  );
}