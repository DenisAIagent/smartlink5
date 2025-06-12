import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import SEO from '../common/SEO';

const MainLayout = ({
  children,
  title,
  description,
  keywords,
  image,
  maxWidth = 'lg',
  disablePadding = false,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        image={image}
      />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Header />
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <Container
            maxWidth={maxWidth}
            sx={{
              py: disablePadding ? 0 : isMobile ? 3 : 6,
              px: disablePadding ? 0 : isMobile ? 2 : 3,
              flex: 1,
            }}
            {...props}
          >
            {children}
          </Container>
        </motion.div>
        <Footer />
      </Box>
    </>
  );
};

export default MainLayout; 