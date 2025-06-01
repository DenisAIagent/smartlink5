const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class NotificationService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  // Initialiser Socket.IO avec le serveur HTTP
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Middleware d'authentification pour Socket.IO
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token manquant'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });

    // Gestion des connexions
    this.io.on('connection', (socket) => {
      console.log(`Utilisateur connecté: ${socket.userId}`);
      
      // Enregistrer la connexion
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Rejoindre des salles basées sur le rôle
      if (socket.userRole === 'admin') {
        socket.join('admins');
      } else if (socket.userRole === 'editor') {
        socket.join('editors');
      }
      socket.join('users');

      // Événements personnalisés
      socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Utilisateur ${socket.userId} a rejoint la salle: ${room}`);
      });

      socket.on('leave-room', (room) => {
        socket.leave(room);
        console.log(`Utilisateur ${socket.userId} a quitté la salle: ${room}`);
      });

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        console.log(`Utilisateur déconnecté: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });
    });

    console.log('Service de notifications en temps réel initialisé');
  }

  // Envoyer une notification à un utilisateur spécifique
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Envoyer une notification à plusieurs utilisateurs
  sendToUsers(userIds, event, data) {
    const sentCount = userIds.reduce((count, userId) => {
      return this.sendToUser(userId, event, data) ? count + 1 : count;
    }, 0);
    return sentCount;
  }

  // Envoyer une notification à une salle
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Envoyer une notification à tous les utilisateurs connectés
  sendToAll(event, data) {
    this.io.emit(event, data);
  }

  // Notifications spécifiques pour LuxBoard

  // Nouvelle offre disponible
  notifyNewOffer(offer) {
    this.sendToRoom('users', 'new-offer', {
      type: 'new-offer',
      title: 'Nouvelle offre disponible !',
      message: `Découvrez l'offre "${offer.title}" de ${offer.provider.name}`,
      data: offer,
      timestamp: new Date().toISOString()
    });
  }

  // Nouvel événement
  notifyNewEvent(event) {
    this.sendToRoom('users', 'new-event', {
      type: 'new-event',
      title: 'Nouvel événement exclusif !',
      message: `"${event.title}" - ${event.date}`,
      data: event,
      timestamp: new Date().toISOString()
    });
  }

  // Nouveau prestataire validé
  notifyNewProvider(provider) {
    this.sendToRoom('users', 'new-provider', {
      type: 'new-provider',
      title: 'Nouveau prestataire premium !',
      message: `${provider.name} a rejoint notre réseau de partenaires`,
      data: provider,
      timestamp: new Date().toISOString()
    });
  }

  // Notification d'administration
  notifyAdmins(title, message, data = null) {
    this.sendToRoom('admins', 'admin-notification', {
      type: 'admin-notification',
      title,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Notification de validation requise
  notifyValidationRequired(type, item) {
    this.sendToRoom('admins', 'validation-required', {
      type: 'validation-required',
      title: 'Validation requise',
      message: `Un nouveau ${type} nécessite votre validation`,
      data: { type, item },
      timestamp: new Date().toISOString()
    });
  }

  // Notification de mise à jour de profil
  notifyProfileUpdate(userId, changes) {
    this.sendToUser(userId, 'profile-updated', {
      type: 'profile-updated',
      title: 'Profil mis à jour',
      message: 'Votre profil a été mis à jour avec succès',
      data: changes,
      timestamp: new Date().toISOString()
    });
  }

  // Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Obtenir la liste des utilisateurs connectés (admin seulement)
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

// Instance singleton
const notificationService = new NotificationService();

module.exports = notificationService;

