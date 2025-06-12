import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemIcon, Collapse } from '@mui/material';
import { Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AccessibilityTester = () => {
  const { t } = useTranslation();
  const [violations, setViolations] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const runAxe = async () => {
      try {
        const axe = await import('@axe-core/react');
        axe.default(React, ReactDOM, 1000, {
          rules: [
            { id: 'color-contrast', enabled: true },
            { id: 'document-title', enabled: true },
            { id: 'html-has-lang', enabled: true },
            { id: 'image-alt', enabled: true },
            { id: 'link-name', enabled: true },
            { id: 'meta-viewport', enabled: true },
            { id: 'page-has-heading-one', enabled: true },
            { id: 'region', enabled: true },
            { id: 'skip-link', enabled: true },
            { id: 'tabindex', enabled: true }
          ]
        });

        // Attendre que axe-core termine l'analyse
        setTimeout(() => {
          const results = window.axeResults;
          if (results) {
            setViolations(results.violations);
          }
        }, 2000);
      } catch (error) {
        console.error('Erreur lors du chargement de axe-core:', error);
      }
    };

    runAxe();
  }, []);

  const getSeverityIcon = (impact) => {
    switch (impact) {
      case 'critical':
      case 'serious':
        return <ErrorIcon color="error" />;
      case 'moderate':
        return <WarningIcon color="warning" />;
      case 'minor':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (impact) => {
    switch (impact) {
      case 'critical':
      case 'serious':
        return 'error.main';
      case 'moderate':
        return 'warning.main';
      case 'minor':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 400,
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: 3
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          {t('a11y.tester.title', 'Tests d\'accessibilité')}
          <Button
            color="inherit"
            onClick={() => setExpanded(!expanded)}
            sx={{ float: 'right', minWidth: 'auto' }}
          >
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s'
              }}
            />
          </Button>
        </Typography>
      </Box>

      <Collapse in={expanded}>
        <List sx={{ p: 2 }}>
          {violations.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={t('a11y.tester.noIssues', 'Aucun problème d\'accessibilité détecté')}
                sx={{ color: 'success.main' }}
              />
            </ListItem>
          ) : (
            violations.map((violation, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItemIcon>
                  {getSeverityIcon(violation.impact)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{ color: getSeverityColor(violation.impact) }}
                    >
                      {violation.help}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {t('a11y.tester.impact', 'Impact')}: {violation.impact}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('a11y.tester.nodes', 'Éléments concernés')}: {violation.nodes.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('a11y.tester.help', 'Solution')}: {violation.helpUrl}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Collapse>
    </Paper>
  );
};

export default AccessibilityTester; 