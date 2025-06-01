class ErrorService {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = new Set();
  }

  // Ajouter une erreur
  addError(error, context = {}) {
    const errorObject = {
      id: Date.now(),
      message: error.message || 'Une erreur est survenue',
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date(),
      context,
      stack: error.stack,
      type: this.getErrorType(error)
    };

    this.errors.unshift(errorObject);
    
    // Limiter le nombre d'erreurs stockées
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Notifier les listeners
    this.notifyListeners(errorObject);

    // Logger l'erreur
    this.logError(errorObject);

    return errorObject;
  }

  // Obtenir le type d'erreur
  getErrorType(error) {
    if (error.response) {
      return 'API_ERROR';
    } else if (error instanceof TypeError) {
      return 'TYPE_ERROR';
    } else if (error instanceof SyntaxError) {
      return 'SYNTAX_ERROR';
    } else if (error instanceof NetworkError) {
      return 'NETWORK_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  // Logger une erreur
  logError(error) {
    console.error(`[${error.type}] ${error.message}`, {
      code: error.code,
      context: error.context,
      stack: error.stack
    });

    // Envoyer l'erreur au serveur de logging
    this.sendToLoggingServer(error);
  }

  // Envoyer l'erreur au serveur de logging
  async sendToLoggingServer(error) {
    try {
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      });
    } catch (e) {
      console.error('Erreur lors de l\'envoi au serveur de logging:', e);
    }
  }

  // Obtenir toutes les erreurs
  getErrors() {
    return this.errors;
  }

  // Obtenir les erreurs par type
  getErrorsByType(type) {
    return this.errors.filter(error => error.type === type);
  }

  // Obtenir les erreurs récentes
  getRecentErrors(limit = 10) {
    return this.errors.slice(0, limit);
  }

  // Effacer toutes les erreurs
  clearErrors() {
    this.errors = [];
    this.notifyListeners({ type: 'CLEAR' });
  }

  // Ajouter un listener
  addListener(listener) {
    this.listeners.add(listener);
  }

  // Supprimer un listener
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  // Notifier les listeners
  notifyListeners(error) {
    this.listeners.forEach(listener => listener(error));
  }

  // Gérer les erreurs API
  handleApiError(error) {
    const errorObject = {
      message: error.response?.data?.message || 'Erreur API',
      code: error.response?.status || 500,
      context: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        data: error.config?.data
      }
    };

    return this.addError(errorObject);
  }

  // Gérer les erreurs de validation
  handleValidationError(errors) {
    const errorObject = {
      message: 'Erreur de validation',
      code: 'VALIDATION_ERROR',
      context: { errors }
    };

    return this.addError(errorObject);
  }

  // Gérer les erreurs de réseau
  handleNetworkError(error) {
    const errorObject = {
      message: 'Erreur de connexion',
      code: 'NETWORK_ERROR',
      context: { error }
    };

    return this.addError(errorObject);
  }

  // Gérer les erreurs d'authentification
  handleAuthError(error) {
    const errorObject = {
      message: 'Erreur d\'authentification',
      code: 'AUTH_ERROR',
      context: { error }
    };

    return this.addError(errorObject);
  }
}

export const errorService = new ErrorService(); 