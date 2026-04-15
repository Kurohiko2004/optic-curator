import React from 'react';
import Header from '../components/layout/Header';
import './IntroductionPage.css';

import imgIntroBanner from '../assets/intro_banner.jpg';
import imgNews1 from '../assets/news_1.jpg';
import imgNews2 from '../assets/news_2.jpg';
import imgNews3 from '../assets/news_3.jpg';
import imgAbout from '../assets/about_img.jpg';

const IntroductionPage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  return (
    <div className="intro-page">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        user={user}
        onLogout={onLogout}
      />

      {/* BANNER */}
      <div className="intro-banner">
        <img
          src={imgIntroBanner}
          alt="Optic AR Banner"
          className="intro-banner-img"
        />
        <div className="intro-banner-overlay">
          <div className="banner-logo">OPTIC</div>
          <h2>AR Eyewear Experience</h2>
          <div className="banner-actions">
            <div className="action-item">
              <span className="icon">📞</span> Contact us<br /><strong>0961 452 578</strong>
            </div>
            <div className="action-item">
              <span className="icon">🌐</span> www.optic-curator.vn
            </div>
          </div>
          <div className="banner-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

      {/* TIN TỨC */}
      <section className="intro-news">
        <h2 className="section-title text-center text-gradient">NEWS</h2>
        <p className="section-subtitle text-center">TOP STORIES OF THE WEEK</p>

        <div className="news-grid">
          {/* Card 1 */}
          <div className="news-card glass-morphism">
            <div className="news-img-container">
              <img src={imgNews1} alt="News 1" />
              <div className="date-badge">
                <span className="day">01</span>
                <span className="month-year">04 / 2026</span>
              </div>
            </div>
            <div className="news-content">
              <h3>Launch of Virtual Try-On: Try glasses at home with 99% accuracy</h3>
              <div className="news-meta">
                <span>💬 12 comments</span>
                <span>👤 Optic Admin</span>
              </div>
              <p>Shopping for eyewear has never been easier. With Optic's AR technology, you can try hundreds of frames on your face directly in the browser using a phone or laptop camera...</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="news-card glass-morphism">
            <div className="news-img-container">
              <img src={imgNews2} alt="News 2" />
              <div className="date-badge">
                <span className="day">20</span>
                <span className="month-year">03 / 2026</span>
              </div>
            </div>
            <div className="news-content">
              <h3>Summer 2026 Collection: Minimal style with a modern edge</h3>
              <div className="news-meta">
                <span>💬 5 comments</span>
                <span>👤 Hoa Lê</span>
              </div>
              <p>Discover Optic's latest sunglasses collection inspired by minimalist lines and refined craftsmanship. These ultra-light titanium frames promise to impress fashion lovers this summer...</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="news-card glass-morphism">
            <div className="news-img-container">
              <img src={imgNews3} alt="News 3" />
              <div className="date-badge">
                <span className="day">08</span>
                <span className="month-year">03 / 2026</span>
              </div>
            </div>
            <div className="news-content">
              <h3>The secret to choosing the perfect frame for every face shape</h3>
              <div className="news-meta">
                <span>💬 24 comments</span>
                <span>👤 Optic Admin</span>
              </div>
              <p>Do you have a round, square, or oval face? How do you pick frames that enhance your best features? Our AI system scans and recommends the most suitable styles automatically...</p>
            </div>
          </div>
        </div>
      </section>

      {/* VỀ CHÚNG TÔI */}
      <section className="intro-about">
        <h2 className="section-title text-center text-gradient">ABOUT US</h2>
        <p className="section-subtitle text-center">WELCOME TO OPTIC CURATOR</p>

        <div className="about-container glass-morphism">
          <div className="about-img-wrapper">
            <img src={imgAbout} alt="Optic Store" />
          </div>
          <div className="about-content">
            <p>Optic Curator is an authorized eyewear retailer and a pioneer in applying augmented reality (AR) to sunglasses and frame shopping in Vietnam.</p>
            <p>Founded in 2020, we continually improve our "Virtual Try-On" feature, allowing customers to try frames in real time via camera. All displayed products are meticulously designed with 3D models accurate to the millimeter, helping measure face angles and eye spacing while recommending the best proportions for you.</p>
            <p>Our mission is to transform traditional online shopping into a beautiful, precise, and fast frame selection experience from home.</p>
            <button className="read-more-btn">READ MORE</button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default IntroductionPage;
