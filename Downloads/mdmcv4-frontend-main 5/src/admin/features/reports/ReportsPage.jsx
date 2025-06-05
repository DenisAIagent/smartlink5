import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { reportsService } from '../../services';
import { useNotificationStore } from '../../store';
import Form from '../../components/Form';

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templatesData, scheduledData] = await Promise.all([
        reportsService.getTemplates(),
        reportsService.getScheduledReports(),
      ]);
      setTemplates(templatesData);
      setScheduledReports(scheduledData);
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (template) => {
    try {
      await reportsService.generateReport({
        templateId: template.id,
        format: 'pdf',
        period: 'last30days',
      });
      showNotification('Rapport généré avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la génération du rapport', 'error');
    }
  };

  const handleScheduleReport = (template) => {
    setSelectedTemplate(template);
    setIsScheduleModalOpen(true);
  };

  const handleSubmitSchedule = async (formData) => {
    try {
      await reportsService.scheduleReport({
        templateId: selectedTemplate.id,
        ...formData,
      });
      setIsScheduleModalOpen(false);
      loadData();
      showNotification('Rapport planifié avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la planification du rapport', 'error');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette planification ?')) {
      try {
        await reportsService.deleteScheduledReport(id);
        loadData();
        showNotification('Planification supprimée avec succès', 'success');
      } catch (error) {
        showNotification('Erreur lors de la suppression de la planification', 'error');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Rapports</h1>
        <p className="text-gray-600">Générez et planifiez vos rapports</p>
      </div>

      {/* Templates Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Modèles de rapport</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      onClick={() => handleGenerateReport(template)}
                    >
                      Générer
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleScheduleReport(template)}
                    >
                      Planifier
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Scheduled Reports Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Rapports planifiés</h2>
            <Table
              columns={[
                { header: 'Modèle', accessor: 'templateName' },
                { header: 'Fréquence', accessor: 'frequency' },
                { header: 'Format', accessor: 'format' },
                { header: 'Dernière exécution', accessor: 'lastRun' },
                { header: 'Prochaine exécution', accessor: 'nextRun' },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  cell: (row) => (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteSchedule(row.id)}
                    >
                      Supprimer
                    </Button>
                  ),
                },
              ]}
              data={scheduledReports}
            />
          </div>
        </Card>
      </motion.div>

      {/* Schedule Modal */}
      <Dialog
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      >
        <DialogTitle>Planifier un rapport</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmitSchedule}>
            <div className="space-y-4">
              <TextField
                name="frequency"
                label="Fréquence"
                select
                fullWidth
                required
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </TextField>
              <TextField
                name="format"
                label="Format"
                select
                fullWidth
                required
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </TextField>
              <TextField
                name="email"
                label="Email de destination"
                type="email"
                fullWidth
                required
              />
            </div>
            <DialogActions>
              <Button onClick={() => setIsScheduleModalOpen(false)}>Annuler</Button>
              <Button type="submit">Planifier</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ReportsPage; 