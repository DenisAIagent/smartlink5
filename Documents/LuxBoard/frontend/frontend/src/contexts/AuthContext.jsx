import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Types d'actions pour le reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// État initial
const initialState = {
  user: null,
  token: localStorage.getItem('luxboard_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Reducer pour gérer l'état d'authentification
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('luxboard_token');
      
      if (token) {
        try {
          const user = await authService.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });
        } catch (error) {
          // Token invalide, le supprimer
          localStorage.removeItem('luxboard_token');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authService.login(email, password);
      const { user, tokens } = response.data;
      
      // Stocker le token
      localStorage.setItem('luxboard_token', tokens.accessToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token: tokens.accessToken }
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const response = await authService.register(userData);
      const { user, tokens } = response.data;
      
      // Stocker le token
      localStorage.setItem('luxboard_token', tokens.accessToken);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token: tokens.accessToken }
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('luxboard_token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const { user } = response.data;
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: user
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de mise à jour';
      return { success: false, error: errorMessage };
    }
  };

  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (requiredRoles) => {
    if (!state.user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(state.user.role);
  };

  // Valeurs du contexte
  const value = {
    // État
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

