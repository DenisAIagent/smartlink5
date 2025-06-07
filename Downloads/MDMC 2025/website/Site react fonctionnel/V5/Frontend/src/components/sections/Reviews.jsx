import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import Modal from 'react-modal';
import '../../assets/styles/reviews.css';
import '../../assets/styles/modal.css';

Modal.setAppElement('#root'); // Adapte si besoin

const Reviews = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // --- États pour le formulaire (inchangés) ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // --- NOUVEAUX États pour les avis approuvés ---
  const [approvedReviews, setApprovedReviews] = useState([]); // Pour stocker les avis de l'API
  const [isLoadingApproved, setIsLoadingApproved] = useState(true); // Indicateur de chargement spécifique
  const [fetchApprovedError, setFetchApprovedError] = useState(null); // Erreur spécifique

  // --- useEffect pour charger les avis APPROUVÉS depuis l'API ---
  useEffect(() => {
    const fetchApprovedReviews = async () => {
      setIsLoadingApproved(true);
      setFetchApprovedError(null);
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        console.error("Erreur: VITE_API_URL non définie.");
        setFetchApprovedError("Erreur de configuration API.");
        setIsLoadingApproved(false);
        return;
      }

      try {
        console.log(`Appel API pour avis approuvés: ${apiUrl}/reviews?status=approved`);
        // Appelle l'API pour récupérer les avis avec le statut 'approved'
        const response = await fetch(`${apiUrl}/reviews?status=approved`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erreur HTTP ${response.status} lors de la récupération des avis approuvés: ${errorText}`);
          setFetchApprovedError(`Erreur ${response.status} serveur.`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Met à jour l'état avec les données reçues
          setApprovedReviews(data.data);
          console.log('Avis approuvés chargés:', data.data);
          // Réinitialise l'index du carrousel si de nouvelles données arrivent
          setActiveIndex(0);
        } else {
          console.error('La réponse de l\'API (avis approuvés) n\'a pas le format attendu:', data);
          setFetchApprovedError("Format de réponse API invalide.");
        }

      } catch (error) {
        console.error("Erreur lors du fetch des avis approuvés:", error);
        if (!fetchApprovedError) {
          setFetchApprovedError("Impossible de charger les avis approuvés.");
        }
      } finally {
        setIsLoadingApproved(false); // Arrête l'indicateur de chargement
      }
    };

    fetchApprovedReviews(); // Appelle la fonction au montage

  }, []); // Tableau vide pour exécution unique au montage

  // --- Effet pour le carrousel (maintenant basé sur approvedReviews) ---
  useEffect(() => {
    // Ne démarre l'intervalle que si on a des avis et qu'ils ne sont pas en cours de chargement
    if (approvedReviews.length === 0 || isLoadingApproved) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % approvedReviews.length);
    }, 8000); // Change toutes les 8 secondes

    // Nettoyage de l'intervalle
    return () => clearInterval(interval);
  }, [approvedReviews, isLoadingApproved]); // Se ré-exécute si les avis ou l'état de chargement changent

  // Fonction pour afficher les étoiles (non interactives) du carrousel (inchangée)
  const renderDisplayStars = (displayRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} className={`star ${i <= displayRating ? 'filled' : 'empty'}`}>★</span>);
    }
    return stars;
  };

  // Fonction pour naviguer dans le carrousel (inchangée)
  const goToReview = (index) => {
    setActiveIndex(index);
  };

  // --- Fonctions pour le formulaire (inchangées) ---
  const handleRating = (rate) => { setRating(rate); };
  const submitReview = async (e) => { /* ... (logique de soumission inchangée) ... */ };
  const openModal = () => { setModalIsOpen(true); setFormError(null); setFormSuccess(null); };
  const closeModal = () => { setModalIsOpen(false); };

  // --- Rendu JSX ---
  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <h2 className="section-title">{t('reviews.title')}</h2>
        <p className="section-subtitle">{t('reviews.subtitle')}</p>

        {/* --- Carrousel d'avis (maintenant basé sur l'API) --- */}
        <div className="reviews-container">
          {/* Affichage conditionnel pendant le chargement ou en cas d'erreur */}
          {isLoadingApproved ? (
            <div className="loading-spinner">{t('admin.loading')}</div> // Réutilise la clé de chargement
          ) : fetchApprovedError ? (
            <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{fetchApprovedError}</p>
          ) : approvedReviews.length > 0 ? (
            <>
              <div className="reviews-carousel">
                {/* Boucle sur les avis APPROUVÉS récupérés */}
                {approvedReviews.map((review, index) => (
                  <div key={review._id} className={`review-card ${index === activeIndex ? 'active' : ''}`} style={{ transform: `translateX(${(index - activeIndex) * 100}%)` }}>
                     <div className="review-header">
                       <div className="review-avatar">
                         {/* Utiliser une image par défaut si l'avatar n'est pas défini */}
                         <img src={review.avatar || '/src/assets/images/avatars/default-avatar.png'} alt={`Avatar de ${review.name}`} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src='/src/assets/images/avatars/default-avatar.png'; }}/>
                       </div>
                       <div className="review-info">
                         <h3 className="review-name">{review.name}</h3>
                         {/* Afficher le titre/rôle s'il existe dans le modèle */}
                         {review.title && <p className="review-role">{review.title}</p>}
                         <div className="review-rating">
                           {renderDisplayStars(review.rating)}
                         </div>
                       </div>
                     </div>
                     <div className="review-content">
                       <p className="review-text">"{review.message}"</p>
                       {/* Formater la date de création */}
                       <p className="review-date">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
                     </div>
                  </div>
                ))}
              </div>
              {/* Navigation basée sur le nombre d'avis approuvés */}
              <div className="reviews-navigation">
                {approvedReviews.map((_, index) => (
                  <button key={index} className={`nav-dot ${index === activeIndex ? 'active' : ''}`} onClick={() => goToReview(index)} aria-label={`${t('reviews.go_to_review')} ${index + 1}`} />
                ))}
              </div>
            </>
          ) : (
            // Message si aucun avis approuvé n'est trouvé
            <p style={{textAlign: 'center'}}>{t('reviews.no_reviews')}</p>
          )}
        </div>
        {/* --- Fin Carrousel --- */}


        {/* Boutons d'action (inchangés) */}
        <div className="reviews-actions">
          <button className="btn btn-primary" onClick={openModal}>{t('reviews.leave_review')}</button>
          <Link to="/all-reviews" className="btn btn-secondary">{t('reviews.view_all')}</Link>
        </div>

        {/* Modale (inchangée) */}
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} /* ... autres props ... */ >
          {/* ... contenu de la modale ... */}
        </Modal>

      </div>
    </section>
  );
};

export default Reviews;
