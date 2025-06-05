import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsPage from '../ReportsPage';
import reportsService from '../../../services/reports.service';

// Mock du service
jest.mock('../../../services/reports.service');

describe('ReportsPage', () => {
  const mockTemplates = [
    {
      id: 1,
      name: 'Rapport quotidien',
      description: 'Rapport des ventes quotidiennes',
      format: 'pdf',
    },
    {
      id: 2,
      name: 'Rapport mensuel',
      description: 'Rapport des ventes mensuelles',
      format: 'excel',
    },
  ];

  const mockScheduledReports = [
    {
      id: 1,
      templateId: 1,
      frequency: 'daily',
      format: 'pdf',
      email: 'test@example.com',
      lastRun: '2024-03-20T10:00:00Z',
      nextRun: '2024-03-21T10:00:00Z',
    },
  ];

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    reportsService.getTemplates.mockResolvedValue(mockTemplates);
    reportsService.getScheduledReports.mockResolvedValue(mockScheduledReports);
  });

  it('devrait charger les modèles et rapports planifiés au montage', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(reportsService.getTemplates).toHaveBeenCalled();
      expect(reportsService.getScheduledReports).toHaveBeenCalled();
    });

    expect(screen.getByText('Rapport quotidien')).toBeInTheDocument();
    expect(screen.getByText('Rapport mensuel')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('devrait générer un rapport', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    reportsService.generateReport.mockResolvedValue(mockBlob);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rapport quotidien')).toBeInTheDocument();
    });

    const generateButton = screen.getAllByText('Générer')[0];
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(reportsService.generateReport).toHaveBeenCalledWith({
        templateId: 1,
        format: 'pdf',
        period: 'last30days',
      });
    });
  });

  it('devrait planifier un rapport', async () => {
    reportsService.scheduleReport.mockResolvedValue({
      id: 2,
      templateId: 1,
      frequency: 'weekly',
      format: 'pdf',
      email: 'new@example.com',
    });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rapport quotidien')).toBeInTheDocument();
    });

    const scheduleButton = screen.getAllByText('Planifier')[0];
    fireEvent.click(scheduleButton);

    // Remplir le formulaire de planification
    const frequencySelect = screen.getByLabelText('Fréquence');
    fireEvent.change(frequencySelect, { target: { value: 'weekly' } });

    const formatSelect = screen.getByLabelText('Format');
    fireEvent.change(formatSelect, { target: { value: 'pdf' } });

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    const submitButton = screen.getByText('Planifier');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(reportsService.scheduleReport).toHaveBeenCalledWith({
        templateId: 1,
        frequency: 'weekly',
        format: 'pdf',
        email: 'new@example.com',
      });
    });
  });

  it('devrait supprimer un rapport planifié', async () => {
    reportsService.deleteScheduledReport.mockResolvedValue({ success: true });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(reportsService.deleteScheduledReport).toHaveBeenCalledWith(1);
    });
  });

  it('devrait gérer les erreurs lors du chargement des données', async () => {
    const mockError = new Error('Erreur de chargement');
    reportsService.getTemplates.mockRejectedValue(mockError);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs lors de la génération d\'un rapport', async () => {
    const mockError = new Error('Erreur de génération');
    reportsService.generateReport.mockRejectedValue(mockError);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rapport quotidien')).toBeInTheDocument();
    });

    const generateButton = screen.getAllByText('Générer')[0];
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la génération du rapport')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs lors de la planification d\'un rapport', async () => {
    const mockError = new Error('Erreur de planification');
    reportsService.scheduleReport.mockRejectedValue(mockError);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rapport quotidien')).toBeInTheDocument();
    });

    const scheduleButton = screen.getAllByText('Planifier')[0];
    fireEvent.click(scheduleButton);

    const submitButton = screen.getByText('Planifier');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la planification du rapport')).toBeInTheDocument();
    });
  });
}); 