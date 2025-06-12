import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Récupérer depuis le localStorage par la clé
      const item = window.localStorage.getItem(key);
      // Analyser la valeur stockée ou retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // En cas d'erreur, retourner initialValue
      console.error('Erreur lors de la lecture du localStorage:', error);
      return initialValue;
    }
  });

  // Retourner une version enveloppée de useState's setter function qui
  // persiste la nouvelle valeur dans localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Permettre à la valeur d'être une fonction pour avoir la même API que useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Sauvegarder l'état
        setStoredValue(valueToStore);
        // Sauvegarder dans le localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Erreur lors de l\'écriture dans le localStorage:', error);
      }
    },
    [key, storedValue]
  );

  // Écouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
};

export default useLocalStorage; 