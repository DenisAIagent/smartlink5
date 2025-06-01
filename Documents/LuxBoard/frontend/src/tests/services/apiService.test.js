import axios from 'axios';
import { apiService } from '../../services/apiService';
import { rateLimitService } from '../../services/rateLimitService';
import { errorService } from '../../services/errorService';

jest.mock('axios');
jest.mock('../../services/rateLimitService');
jest.mock('../../services/errorService');

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('devrait faire une requête GET avec les paramètres', async () => {
      const mockResponse = { data: { test: 'data' } };
      axios.get.mockResolvedValue(mockResponse);

      const result = await apiService.get('/test', { param: 'value' });

      expect(axios.get).toHaveBeenCalledWith('/test', { params: { param: 'value' } });
      expect(result).toEqual({ test: 'data' });
    });

    it('devrait gérer les erreurs de limitation de taux', async () => {
      const mockError = new Error('Rate limit exceeded');
      mockError.retryAfter = 1000;
      mockError.resetTime = Date.now() + 60000;

      rateLimitService.canMakeRequest.mockReturnValue({
        allowed: false,
        retryAfter: 1000,
        resetTime: Date.now() + 60000
      });

      await expect(apiService.get('/test')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('post', () => {
    it('devrait faire une requête POST avec les données', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await apiService.post('/test', { data: 'value' });

      expect(axios.post).toHaveBeenCalledWith('/test', { data: 'value' });
      expect(result).toEqual({ success: true });
    });

    it('devrait gérer les erreurs de validation', async () => {
      const mockError = {
        response: {
          status: 422,
          data: { errors: ['Invalid data'] }
        }
      };
      axios.post.mockRejectedValue(mockError);

      await expect(apiService.post('/test', {})).rejects.toEqual(mockError);
      expect(errorService.handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('put', () => {
    it('devrait faire une requête PUT avec les données', async () => {
      const mockResponse = { data: { updated: true } };
      axios.put.mockResolvedValue(mockResponse);

      const result = await apiService.put('/test/1', { data: 'value' });

      expect(axios.put).toHaveBeenCalledWith('/test/1', { data: 'value' });
      expect(result).toEqual({ updated: true });
    });
  });

  describe('delete', () => {
    it('devrait faire une requête DELETE', async () => {
      const mockResponse = { data: { deleted: true } };
      axios.delete.mockResolvedValue(mockResponse);

      const result = await apiService.delete('/test/1');

      expect(axios.delete).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getRateLimitStats', () => {
    it('devrait retourner les statistiques de limitation', () => {
      const mockStats = {
        remaining: 50,
        resetTime: Date.now() + 30000,
        retryCount: 0
      };
      rateLimitService.getStats.mockReturnValue(mockStats);

      const stats = apiService.getRateLimitStats('/test');

      expect(stats).toEqual(mockStats);
      expect(rateLimitService.getStats).toHaveBeenCalledWith('/test');
    });
  });
}); 