import React from 'react';
import { render, screen, act } from '@testing-library/react';
import RateLimitDisplay from '../../components/common/RateLimitDisplay';
import { apiService } from '../../services/apiService';

jest.mock('../../services/apiService');

describe('RateLimitDisplay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ne devrait pas s\'afficher quand les stats sont nulles', () => {
    apiService.getRateLimitStats.mockReturnValue(null);
    render(<RateLimitDisplay endpoint="/test" />);
    expect(screen.queryByText('Limite de requêtes')).not.toBeInTheDocument();
  });

  it('ne devrait pas s\'afficher quand il reste plus de 20 requêtes', () => {
    apiService.getRateLimitStats.mockReturnValue({
      remaining: 30,
      resetTime: Date.now() + 60000,
      retryCount: 0
    });
    render(<RateLimitDisplay endpoint="/test" />);
    expect(screen.queryByText('Limite de requêtes')).not.toBeInTheDocument();
  });

  it('devrait s\'afficher quand il reste moins de 20 requêtes', () => {
    apiService.getRateLimitStats.mockReturnValue({
      remaining: 15,
      resetTime: Date.now() + 60000,
      retryCount: 0
    });
    render(<RateLimitDisplay endpoint="/test" />);
    expect(screen.getByText('Limite de requêtes')).toBeInTheDocument();
    expect(screen.getByText('15 / 100')).toBeInTheDocument();
  });

  it('devrait mettre à jour les stats toutes les secondes', () => {
    apiService.getRateLimitStats
      .mockReturnValueOnce({
        remaining: 15,
        resetTime: Date.now() + 60000,
        retryCount: 0
      })
      .mockReturnValueOnce({
        remaining: 10,
        resetTime: Date.now() + 60000,
        retryCount: 0
      });

    render(<RateLimitDisplay endpoint="/test" />);
    expect(screen.getByText('15 / 100')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10 / 100')).toBeInTheDocument();
  });

  it('devrait changer la couleur de la barre de progression selon le nombre de requêtes restantes', () => {
    apiService.getRateLimitStats.mockReturnValue({
      remaining: 5,
      resetTime: Date.now() + 60000,
      retryCount: 0
    });

    render(<RateLimitDisplay endpoint="/test" />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-red-500');
  });

  it('devrait permettre de fermer l\'affichage', () => {
    apiService.getRateLimitStats.mockReturnValue({
      remaining: 15,
      resetTime: Date.now() + 60000,
      retryCount: 0
    });

    render(<RateLimitDisplay endpoint="/test" />);
    const closeButton = screen.getByRole('button');
    closeButton.click();
    expect(screen.queryByText('Limite de requêtes')).not.toBeInTheDocument();
  });

  it('devrait afficher le temps restant avant réinitialisation', () => {
    const resetTime = Date.now() + 30000; // 30 secondes
    apiService.getRateLimitStats.mockReturnValue({
      remaining: 15,
      resetTime,
      retryCount: 0
    });

    render(<RateLimitDisplay endpoint="/test" />);
    expect(screen.getByText(/Réinitialisation dans/)).toBeInTheDocument();
  });
}); 