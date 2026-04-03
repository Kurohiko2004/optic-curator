import React from 'react';
import Header from '../components/layout/Header';
import './IntroductionPage.css';

import imgIntroBanner from '../assets/intro_banner.jpg';
import imgNews1 from '../assets/news_1.jpg';
import imgNews2 from '../assets/news_2.jpg';
import imgNews3 from '../assets/news_3.jpg';
import imgAbout from '../assets/about_img.jpg';

const IntroductionPage = ({ onLoginClick, onSignupClick, setCurrentPage }) => {
  return (
    <div className="intro-page">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        setCurrentPage={setCurrentPage}
        activePage="introduction"
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
          <h2>Công Nghệ Thử Kính AR</h2>
          <div className="banner-actions">
            <div className="action-item">
              <span className="icon">📞</span> Tư vấn ngay<br /><strong>0961 452 578</strong>
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
        <h2 className="section-title text-center text-gradient">TIN TỨC</h2>
        <p className="section-subtitle text-center">NỔI BẬT NHẤT TRONG TUẦN</p>

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
              <h3>Ra mắt tính năng Virtual Try-On: Thử kính tại nhà chuẩn xác 99%</h3>
              <div className="news-meta">
                <span>💬 12 bình luận</span>
                <span>👤 Optic Admin</span>
              </div>
              <p>Trải nghiệm mua sắm kính mắt chưa bao giờ dễ dàng đến thế. Với công nghệ AR (Thực tế tăng cường) của Optic, bạn có thể ướm thử hàng trăm mẫu kính lên khuôn mặt ngay trên trình duyệt web chỉ bằng camera điện thoại hoặc laptop...</p>
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
              <h3>Bộ sưu tập Hè 2026: Phong cách Tối giản mang hơi thở Hiện đại</h3>
              <div className="news-meta">
                <span>💬 5 bình luận</span>
                <span>👤 Hoa Lê</span>
              </div>
              <p>Khám phá bộ sưu tập kính mát mới nhất từ Optic lấy cảm hứng từ những đường nét tối giản (Minimalism) và độ hoàn thiện tinh xảo. Các thiết kế gọng Titan siêu nhẹ hứa hẹn làm chao đảo giới mộ điệu thời trang hè năm nay...</p>
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
              <h3>Bí quyết chọn khuôn kính phù hợp với mọi dáng mặt</h3>
              <div className="news-meta">
                <span>💬 24 bình luận</span>
                <span>👤 Optic Admin</span>
              </div>
              <p>Bạn có khuôn mặt tròn, vuông, hay trái xoan? Làm thế nào để chọn một chiếc kính giúp tôn lên các đường nét hoàn hảo của bạn? Hệ thống AI của chúng tôi sẽ quét và tự động đề xuất những mẫu gọng phù hợp nhất...</p>
            </div>
          </div>
        </div>
      </section>

      {/* VỀ CHÚNG TÔI */}
      <section className="intro-about">
        <h2 className="section-title text-center text-gradient">VỀ CHÚNG TÔI</h2>
        <p className="section-subtitle text-center">CHÀO MỪNG BẠN ĐẾN VỚI OPTIC CURATOR</p>

        <div className="about-container glass-morphism">
          <div className="about-img-wrapper">
            <img src={imgAbout} alt="Optic Store" />
          </div>
          <div className="about-content">
            <p>Optic Curator là hệ thống cửa hàng phân phối kính mắt chính hãng, đồng thời là nhà tiên phong ứng dụng công nghệ trực quan Thực tế tăng cường (AR - Augmented Reality) vào trải nghiệm mua sắm kính mát và gọng kính tại Việt Nam.</p>
            <p>Được thành lập vào năm 2020, chúng tôi không ngừng cải tiến tính năng "Virtual Try-On", cho phép khách hàng sử dụng camera để ướm thử kính thời gian thực. Toàn bộ các sản phẩm trưng bày đều được thiết kế tỉ mỉ, có mô hình 3D chuẩn xác đến từng milimet, giúp đo góc mặt, khoảng cách hai mắt đồng thời gợi ý tỷ lệ chuẩn nhất dành cho bạn.</p>
            <p>Sứ mệnh của chúng tôi là thay đổi thói quen mua sắm trực tuyến truyền thống, đem lại quy trình chọn kính Đẹp - Chuẩn xác - Nhanh chóng ngay tại nhà.</p>
            <button className="read-more-btn">ĐỌC THÊM</button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default IntroductionPage;
