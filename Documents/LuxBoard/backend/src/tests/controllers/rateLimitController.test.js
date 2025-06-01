const rateLimitController = require('../../controllers/admin/rateLimitController');
const rateLimitStatsService = require('../../services/rateLimitStatsService');

jest.mock('../../services/rateLimitStatsService');
jest.mock('../../middleware/auth', () => ({
  validateAdmin: (req, res, next) => next()
}));

describe('RateLimitController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {},
      user: { role: 'admin' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('devrait retourner les statistiques', async () => {
      const mockStats = {
        requests: [{ count: 100 }],
        errors: [{ count: 10 }],
        retries: [{ count: 5 }]
      };

      rateLimitStatsService.getStats.mockResolvedValue(mockStats);

      await rateLimitController.getStats(req, res);

      expect(rateLimitStatsService.getStats).toHaveBeenCalledWith('1h', 'all');
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Erreur de test');
      rateLimitStatsService.getStats.mockRejectedValue(error);

      await rateLimitController.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des statistiques'
      });
    });

    it('devrait utiliser les paramètres de requête', async () => {
      req.query = {
        timeRange: '24h',
        endpoint: '/api/test'
      };

      await rateLimitController.getStats(req, res);

      expect(rateLimitStatsService.getStats).toHaveBeenCalledWith('24h', '/api/test');
    });
  });

  describe('getEndpoints', () => {
    it('devrait retourner la liste des endpoints', async () => {
      const mockEndpoints = ['/api/test', '/api/users'];
      rateLimitStatsService.getEndpoints.mockResolvedValue(mockEndpoints);

      await rateLimitController.getEndpoints(req, res);

      expect(rateLimitStatsService.getEndpoints).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockEndpoints);
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Erreur de test');
      rateLimitStatsService.getEndpoints.mockRejectedValue(error);

      await rateLimitController.getEndpoints(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des endpoints'
      });
    });
  });

  describe('cleanup', () => {
    it('devrait effectuer le nettoyage', async () => {
      await rateLimitController.cleanup(req, res);

      expect(rateLimitStatsService.cleanup).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nettoyage effectué avec succès'
      });
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Erreur de test');
      rateLimitStatsService.cleanup.mockRejectedValue(error);

      await rateLimitController.cleanup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur lors du nettoyage des données'
      });
    });
  });
}); 