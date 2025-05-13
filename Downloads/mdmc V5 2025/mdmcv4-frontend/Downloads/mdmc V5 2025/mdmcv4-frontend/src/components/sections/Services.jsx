import { useTranslation } from 'react-i18next';
// Assurez-vous que le chemin vers le CSS est correct
import '../../assets/styles/services.css';
import '../../assets/styles/modal.css';

const Services = () => {
  const { t } = useTranslation();

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">{t('services.title')}</h2>

        <div className="services-grid">
          {/* Service Card 1: YouTube */}
          <div className="service-card">
            <div className="service-icon">
              {/* === Chemin CORRIGÉ === */}
              <img src="/assets/images/youtube-icon.svg" alt="YouTube Ads Icon" />
            </div>
            <h3>{t('services.youtube.title')}</h3>
            <p>{t('services.youtube.description')}</p>
          </div>

          {/* Service Card 2: Meta */}
          <div className="service-card">
            <div className="service-icon">
              {/* === Chemin CORRIGÉ === */}
              <img src="/assets/images/meta-icon.svg" alt="Meta Ads Icon" />
            </div>
            <h3>{t('services.meta.title')}</h3>
            <p>{t('services.meta.description')}</p>
          </div>

          {/* Service Card 3: TikTok */}
          <div className="service-card">
            <div className="service-icon">
              {/* === Chemin CORRIGÉ === */}
              <img src="/assets/images/tiktok-icon.svg" alt="TikTok Ads Icon" />
            </div>
            <h3>{t('services.tiktok.title')}</h3>
            <p>{t('services.tiktok.description')}</p>
          </div>

          {/* Service Card 4: Content Strategy */}
          <div className="service-card">
            <div className="service-icon">
              {/* === Chemin CORRIGÉ === */}
              <img src="/assets/images/content-icon.svg" alt="Content Strategy Icon" />
            </div>
            <h3>{t('services.content.title')}</h3>
            <p>{t('services.content.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
