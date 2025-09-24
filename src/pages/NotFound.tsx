// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.message}>Oups… la page que vous cherchez est introuvable.</p>
      <Link to="/" style={styles.link}>⟵ Retour à l’accueil</Link>
    </div>
  );
};

export default NotFound;

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  title: {
    fontSize: '6rem',
    margin: '0',
  },
  message: {
    fontSize: '1.2rem',
    margin: '1rem 0',
  },
  link: {
    marginTop: '1rem',
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold',
  },
};
