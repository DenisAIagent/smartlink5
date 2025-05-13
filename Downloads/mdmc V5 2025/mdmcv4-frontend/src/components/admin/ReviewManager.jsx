import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin.css';
import '../../assets/styles/review-manager.css';

// Composant pour la gestion des avis clients
const ReviewManager = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([
    {
      id: 1,
      artistName: 'Marie Lambert',
      email: 'marie.lambert@example.com',
      rating: 5,
      comment: 'Une équipe professionnelle qui comprend vraiment les besoins des artistes. Leur campagne TikTok a permis à mon single d'atteindre plus de 500 000 vues !',
      date: '27/04/2025',
      status: 'pending'
    },
    {
      id: 2,
      artistName: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      rating: 5,
      comment: 'Grâce à MDMC, j\'ai pu augmenter ma visibilité de 300% en seulement 2 mois. Leur expertise en YouTube Ads a transformé ma carrière !',
      date: '15/03/2025',
      status: 'approved'
    },
    {
      id: 3,
      artistName: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      rating: 4,
      comment: 'Très bonne expérience avec MDMC. Leur équipe est réactive et les résultats sont au rendez-vous. Je recommande !',
      date: '05/04/2025',
      status: 'approved'
    }
  ]);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  
  // Filtrer les avis en fonction du statut et du terme de recherche
  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter;
    const matchesSearch = review.artistName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Générer un lien d'avis unique
  const generateReviewLink = () => {
    // Dans une version réelle, cela générerait un token unique
    const token = Math.random().toString(36).substring(2, 15);
    const link = `https://qqdboild.manus.space/review?token=${token}`;
    setGeneratedLink(link);
    
    // Afficher une notification
    setNotificationMessage('Lien d\'avis généré avec succès !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  // Copier le lien dans le presse-papier
  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    
    // Afficher une notification
    setNotificationMessage('Lien copié dans le presse-papier !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  // Approuver un avis
  const approveReview = (id) => {
    setReviews(prev => prev.map(review => 
      review.id === id ? { ...review, status: 'approved' } : review
    ));
    
    // Afficher une notification
    setNotificationMessage('Avis approuvé avec succès !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  // Rejeter un avis
  const rejectReview = (id) => {
    setReviews(prev => prev.map(review => 
      review.id === id ? { ...review, status: 'rejected' } : review
    ));
    
    // Afficher une notification
    setNotificationMessage('Avis rejeté !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  // Dépublier un avis
  const unpublishReview = (id) => {
    setReviews(prev => prev.map(review => 
      review.id === id ? { ...review, status: 'pending' } : review
    ));
    
    // Afficher une notification
    setNotificationMessage('Avis dépublié !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  // Supprimer un avis
  const deleteReview = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      setReviews(prev => prev.filter(review => review.id !== id));
      
      // Afficher une notification
      setNotificationMessage('Avis supprimé !');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };
  
  // Commencer à éditer un avis
  const startEditReview = (review) => {
    setEditingReview({ ...review });
  };
  
  // Sauvegarder les modifications d'un avis
  const saveReviewEdit = () => {
    setReviews(prev => prev.map(review => 
      review.id === editingReview.id ? editingReview : review
    ));
    
    // Afficher une notification
    setNotificationMessage('Avis modifié avec succès !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    
    // Fermer l'éditeur
    setEditingReview(null);
  };
  
  // Annuler l'édition d'un avis
  const cancelReviewEdit = () => {
    setEditingReview(null);
  };
  
  // Composant d'édition d'avis
  const ReviewEditor = () => (
    <div className="review-editor">
      <div className="review-editor-overlay" onClick={cancelReviewEdit}></div>
      <div className="review-editor-content">
        <h3>Modifier l'avis</h3>
        <div className="form-group">
          <label>Nom de l'artiste</label>
          <input 
            type="text" 
            value={editingReview.artistName} 
            onChange={(e) => setEditingReview({ ...editingReview, artistName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={editingReview.email} 
            onChange={(e) => setEditingReview({ ...editingReview, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Note</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star}
                className={star <= editingReview.rating ? 'star active' : 'star'}
                onClick={() => setEditingReview({ ...editingReview, rating: star })}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Commentaire</label>
          <textarea 
            value={editingReview.comment} 
            onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
            rows="5"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Statut</label>
          <select 
            value={editingReview.status}
            onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value })}
          >
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
        <div className="editor-actions">
          <button className="cancel-button" onClick={cancelReviewEdit}>Annuler</button>
          <button className="save-button" onClick={saveReviewEdit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="review-manager">
      <h2>Gestion des avis clients</h2>
      
      {/* Notification */}
      {showNotification && (
        <div className="notification">
          <p>{notificationMessage}</p>
        </div>
      )}
      
      {/* Actions et filtres */}
      <div className="review-actions-bar">
        <button className="generate-link-button" onClick={generateReviewLink}>
          Générer un lien d'avis
        </button>
        <div className="review-filters">
          <select 
            className="review-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="review-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Lien généré */}
      {generatedLink && (
        <div className="review-link-generator">
          <h3>Lien d'avis généré</h3>
          <div className="generated-link">
            <input 
              type="text" 
              value={generatedLink} 
              readOnly 
              className="link-input" 
            />
            <button className="copy-button" onClick={copyLink}>Copier</button>
          </div>
          <p className="link-info">Ce lien est valide pendant 7 jours. Partagez-le avec vos clients pour qu'ils puissent laisser un avis.</p>
        </div>
      )}
      
      {/* Liste des avis */}
      <div className="review-list">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <p>Aucun avis ne correspond à votre recherche.</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div className={`review-item ${review.status}`} key={review.id}>
              <div className="review-header">
                <div className="review-info">
                  <h3>{review.artistName}</h3>
                  <p className="review-email">{review.email}</p>
                  <p className="review-date">{review.date}</p>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index} className={index < review.rating ? 'star filled' : 'star'}>★</span>
                    ))}
                  </div>
                </div>
                <div className="review-status">
                  {review.status === 'pending' && 'En attente'}
                  {review.status === 'approved' && 'Approuvé'}
                  {review.status === 'rejected' && 'Rejeté'}
                </div>
              </div>
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
              <div className="review-actions">
                {review.status === 'pending' && (
                  <>
                    <button className="approve-button" onClick={() => approveReview(review.id)}>
                      Approuver
                    </button>
                    <button className="reject-button" onClick={() => rejectReview(review.id)}>
                      Rejeter
                    </button>
                  </>
                )}
                {review.status === 'approved' && (
                  <button className="unpublish-button" onClick={() => unpublishReview(review.id)}>
                    Dépublier
                  </button>
                )}
                {review.status === 'rejected' && (
                  <button className="approve-button" onClick={() => approveReview(review.id)}>
                    Approuver
                  </button>
                )}
                <button className="edit-button" onClick={() => startEditReview(review)}>
                  Modifier
                </button>
                <button className="delete-button" onClick={() => deleteReview(review.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Éditeur d'avis */}
      {editingReview && <ReviewEditor />}
    </div>
  );
};

export default ReviewManager;
