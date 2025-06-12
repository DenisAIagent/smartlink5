import React from 'react';
import { LatestPosts } from '../components/LatestPosts';
import '../styles/Home.css';

export const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>MDMC Music Ads</h1>
        <p>Votre partenaire pour la promotion musicale</p>
      </section>
      
      <section className="latest-articles">
        <LatestPosts />
      </section>
    </div>
  );
}; 