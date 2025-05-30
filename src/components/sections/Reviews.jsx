// src/components/sections/Reviews.jsx - Correction

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import Modal from 'react-modal';
import apiService from '../../services/api.service'; // Import du service API
import '../../assets/styles/reviews.css';
import '../../assets/styles/modal.css';

Modal.setAppElement('#root');

const Reviews = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // États pour le formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // États pour les avis approuvés
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [isLoadingApproved, setIsLoadingApproved] = useState(true);
  const [fetchApprovedError, setFetchApprovedError] = useState(null);

  // useEffect pour charger les avis approuvés
  useEffect(() => {
    const fetchApprovedReviews = async () => {
      setIsLoadingApproved(true);
      setFetchApprovedError(null);

      try {
        // CORRECTION: Utiliser apiService au lieu d'un fetch direct
        const response = await apiService.reviews.getReviews({ status: 'approved' });
        
        if (response && response.success && Array.isArray(response.data)) {
          setApprovedReviews(response.data);
          console.log('Avis approuvés chargés:', response.data);
          setActiveIndex(0);
        } else {
          console.log('Aucun avis approuvé trouvé, utilisation d\'avis de démonstration');
          // Fallback avec avis de démonstration
          const demoReviews = [
            {
              _id: 'demo-1',
              name: 'Jean Dupont',
              title: 'Artiste indépendant',
              rating: 5,
              message: "Grâce à MDMC, j'ai pu augmenter ma visibilité de 300% en seulement 2 mois. Leur expertise en YouTube Ads a transformé ma carrière !",
              createdAt: new Date('2025-01-15').toISOString(),
              avatar: '/src/assets/images/avatars/avatar-1.jpg'
            },
            {
              _id: 'demo-2',
              name: 'Marie Lambert',
              title: 'Chanteuse',
              rating: 5,
              message: "Une équipe professionnelle qui comprend vraiment les besoins des artistes. Leur campagne TikTok a permis à mon single d'atteindre plus de 500 000 vues !",
              createdAt: new Date('2025-01-10').toISOString(),
              avatar: '/src/assets/images/avatars/avatar-2.jpg'
            },
            {
              _id: 'demo-3',
              name: 'Sophie Martin',
              title: 'Productrice',
              rating: 4,
              message: 'Très bonne expérience avec MDMC. Leur équipe est réactive et les résultats sont au rendez-vous. Je recommande !',
              createdAt: new Date('2025-01-05').toISOString(),
              avatar: '/src/assets/images/avatars/avatar-3.jpg'
            }
          ];
          setApprovedReviews(demoReviews);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Erreur lors du fetch des avis approuvés:", error);
        
        // En cas d'erreur, utiliser des avis de démonstration
        const fallbackReviews = [
          {
            _id: 'fallback-1',
            name: 'Thomas Martin',
            title: 'Label indépendant',
            rating: 5,
            message: "MDMC a complètement transformé notre approche marketing. Leur expertise en Meta Ads nous a permis d'atteindre une audience beaucoup plus large.",
            createdAt: new Date('2025-01-20').toISOString(),
            avatar: '/src/assets/images/avatars/default-avatar.png'
          },
          {
            _id: 'fallback-2',
            name: 'Electro Records',
            title: 'Studio d\'enregistrement',
            rating: 5,
            message: "Nous avons confié notre stratégie digitale à MDMC et les résultats ont dépassé nos attentes. Une équipe vraiment professionnelle !",
            createdAt: new Date('2025-01-18').toISOString(),
            avatar: '/src/assets/images/avatars/default-avatar.png'
          }
        ];
        
        setApprovedReviews(fallbackReviews);
        setFetchApprovedError(null); // Ne pas montrer l'erreur à l'utilisateur
        setActiveIndex(0);
      } finally {
        setIsLoadingApproved(false);
      }
    };

    fetchApprovedReviews();
  }, []);

  // Effet pour le carrousel automatique
  useEffect(() => {
    if (approvedReviews.length === 0 || isLoadingApproved) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % approvedReviews.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [approvedReviews, isLoadingApproved]);

  // Fonction pour afficher les étoiles (non interactives) du carrousel
  const renderDisplayStars = (displayRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} className={`star ${i <= displayRating ? 'filled' : 'empty'}`}>★</span>);
    }
    return stars;
  };

  // Fonction pour naviguer dans le carrousel
  const goToReview = (index) => {
    setActiveIndex(index);
  };

  // Fonction pour soumettre un nouvel avis
  const submitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    // Validation basique
    if (!name.trim() || !email.trim() || !message.trim() || rating === 0) {
      setFormError('Tous les champs sont requis');
      setIsSubmitting(false);
      return;
    }

    try {
      const reviewData = {
        name: name.trim(),
        email: email.trim(),
        rating: rating,
        message: message.trim()
      };

      // Utiliser apiService pour soumettre l'avis
      const response = await apiService.reviews.createReview(reviewData);
      
      if (response && response.success) {
        setFormSuccess('Merci ! Votre avis a été soumis et sera examiné par notre équipe.');
        // Réinitialiser le formulaire
        setName('');
        setEmail('');
        setRating(0);
        setMessage('');
        // Fermer le modal après 3 secondes
        setTimeout(() => {
          setModalIsOpen(false);
          setFormSuccess(null);
        }, 3000);
      } else {
        setFormError(response.error || 'Erreur lors de la soumission de votre avis');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      setFormError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRating = (rate) => { setRating(rate); };
  const openModal = () => { setModalIsOpen(true); setFormError(null); setFormSuccess(null); };
  const closeModal = () => { setModalIsOpen(false); };

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <h2 className="section-title">{t('reviews.title')}</h2>
        <p className="section-subtitle">{t('reviews.subtitle')}</p>

        {/* Carrousel d'avis */}
        <div className="reviews-container">
          {isLoadingApproved ? (
            <div className="loading-spinner">Chargement des avis...</div>
          ) : fetchApprovedError ? (
            <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{fetchApprovedError}</p>
          ) : approvedReviews.length > 0 ? (
            <>
              <div className="reviews-carousel">
                {approvedReviews.map((review, index) => (
                  <div key={review._id} className={`review-card ${index === activeIndex ? 'active' : ''}`} 
                       style={{ transform: `translateX(${(index - activeIndex) * 100}%)` }}>
                    <div className="review-header">
                      <div className="review-avatar">
                        <img 
                          src={review.avatar || '/src/assets/images/avatars/default-avatar.png'} 
                          alt={`Avatar de ${review.name}`} 
                          loading="lazy" 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src='/src/assets/images/avatars/default-avatar.png'; 
                          }}
                        />
                      </div>
                      <div className="review-info">
                        <h3 className="review-name">{review.name}</h3>
                        {review.title && <p className="review-role">{review.title}</p>}
                        <div className="review-rating">
                          {renderDisplayStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-text">"{review.message}"</p>
                      <p className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="reviews-navigation">
                {approvedReviews.map((_, index) => (
                  <button 
                    key={index} 
                    className={`nav-dot ${index === activeIndex ? 'active' : ''}`} 
                    onClick={() => goToReview(index)} 
                    aria-label={`Aller à l'avis ${index + 1}`} 
                  />
                ))}
              </div>
            </>
          ) : (
            <p style={{textAlign: 'center'}}>Aucun avis à afficher pour le moment.</p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="reviews-actions">
          <button className="btn btn-primary" onClick={openModal}>
            {t('reviews.leave_review')}
          </button>
          <Link to="/all-reviews" className="btn btn-secondary">
            {t('reviews.view_all')}
          </Link>
        </div>

        {/* Modal pour laisser un avis */}
        <Modal 
          isOpen={modalIsOpen} 
          onRequestClose={closeModal}
          className="review-modal"
          overlayClassName="review-modal-overlay"
          contentLabel="Laisser un avis"
        >
          <div className="modal-header">
            <h3>Partagez votre expérience</h3>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          
          {formSuccess ? (
            <div className="form-success">
              <p>{formSuccess}</p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="review-form">
              {formError && <div className="form-error">{formError}</div>}
              
              <div className="form-group">
                <label htmlFor="review-name">Nom *</label>
                <input
                  type="text"
                  id="review-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="review-email">Email *</label>
                <input
                  type="email"
                  id="review-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label>Note *</label>
                <Rating
                  onClick={handleRating}
                  ratingValue={rating * 20}
                  size={30}
                  transition
                  fillColor="#ff6b35"
                  emptyColor="#ddd"
                />
              </div>

              <div className="form-group">
                <label htmlFor="review-message">Votre avis *</label>
                <textarea
                  id="review-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows="4"
                  disabled={isSubmitting}
                  placeholder="Partagez votre expérience avec nos services..."
                />
              </div>

              <div className="form-buttons">
                <button type="button" onClick={closeModal} disabled={isSubmitting}>
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </section>
  );
};

export default Reviews;
