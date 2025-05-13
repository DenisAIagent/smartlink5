import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const defaultQuestions = [
  {
    question: "Quels types d'artistes ou de projets soutenez-vous ?",
    answer: "Nous soutenons tous les types d'artistes et de projets musicaux, des artistes émergents aux artistes établis, dans tous les genres musicaux. Notre expertise s'étend à la promotion de singles, d'albums, de clips vidéo et d'événements musicaux."
  },
  {
    question: "Quel investissement est nécessaire pour obtenir des résultats ?",
    answer: "L'investissement minimum recommandé est de 300€ hors honoraires. Ce budget permet de lancer des campagnes efficaces sur les plateformes principales. Nous proposons également des packages personnalisés selon vos objectifs et votre budget."
  },
  {
    question: "En combien de temps verrai-je des résultats ?",
    answer: "Les premiers résultats sont généralement visibles dans les 48 à 72 heures suivant le lancement de la campagne. Les performances optimales sont atteintes après 7 à 14 jours, une fois que les algorithmes ont optimisé la distribution."
  },
  {
    question: "Comment choisir les bonnes plateformes pour ma musique ?",
    answer: "Nous analysons votre musique, votre audience cible et vos objectifs pour recommander les plateformes les plus pertinentes. Notre expertise couvre YouTube, Spotify, Instagram, TikTok et d'autres plateformes selon votre cas."
  },
  {
    question: "Les vues et résultats sont-ils authentiques ?",
    answer: "Absolument. Nous n'utilisons que des méthodes de promotion légitimes et conformes aux conditions d'utilisation des plateformes. Toutes les vues et interactions proviennent d'utilisateurs réels."
  },
  {
    question: "Dois-je m'engager sur le long terme ?",
    answer: "Non, nos services sont flexibles. Vous pouvez choisir des campagnes ponctuelles ou des programmes plus longs selon vos besoins. Nous vous accompagnons à votre rythme."
  },
  {
    question: "Proposez-vous une consultation avant la campagne ?",
    answer: "Oui, nous offrons une consultation gratuite pour analyser votre projet, définir vos objectifs et vous proposer la stratégie la plus adaptée. C'est l'occasion d'échanger sur vos attentes et de répondre à toutes vos questions."
  }
];

const FAQSection = ({
  title = "Questions fréquentes",
  subtitle = "Tout ce que vous devez savoir sur nos services",
  questions = defaultQuestions,
  backgroundColor,
  textColor
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: backgroundColor || theme.palette.background.default,
        color: textColor || theme.palette.text.primary
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 2
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            {subtitle}
          </Typography>
        )}
        <Box>
          {questions.map((item, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                mb: 2,
                '&:before': {
                  display: 'none'
                },
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&.Mui-expanded': {
                  margin: '0 0 16px 0'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0'
                  }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: expanded === `panel${index}` ? 'bold' : 'normal'
                  }}
                >
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQSection; 