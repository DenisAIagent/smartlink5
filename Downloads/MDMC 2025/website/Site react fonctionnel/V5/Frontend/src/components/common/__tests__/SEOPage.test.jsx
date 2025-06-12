import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { useSEO } from '../../../hooks/useSEO';
import { usePerformance } from '../../../hooks/usePerformance';
import SEOPage from '../SEOPage';
import theme from '../../../theme';

// Mock des hooks
jest.mock('../../../hooks/useSEO');
jest.mock('../../../hooks/usePerformance');

describe('SEOPage', () => {
  const mockUpdateSEO = jest.fn();
  const mockGenerateStructuredData = jest.fn();
  const mockUpdateCanonicalUrl = jest.fn();
  const mockUpdateSocialMediaTags = jest.fn();
  const mockMeasureRender = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useSEO.mockReturnValue({
      updateSEO: mockUpdateSEO,
      generateStructuredData: mockGenerateStructuredData,
      updateCanonicalUrl: mockUpdateCanonicalUrl,
      updateSocialMediaTags: mockUpdateSocialMediaTags,
    });

    usePerformance.mockReturnValue({
      measureRender: () => mockMeasureRender,
    });
  });

  const defaultProps = {
    title: 'Test Page',
    description: 'Test Description',
    keywords: 'test, keywords',
    image: 'test-image.jpg',
    type: 'website',
    children: <div>Test Content</div>,
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <SEOPage {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  it('devrait mettre à jour les métadonnées SEO au montage', () => {
    renderComponent();
    expect(mockUpdateSEO).toHaveBeenCalledWith({
      title: defaultProps.title,
      description: defaultProps.description,
      keywords: defaultProps.keywords,
      ogType: defaultProps.type,
      ogImage: defaultProps.image,
    });
  });

  it('devrait mettre à jour les données structurées si fournies', () => {
    const structuredData = { type: 'Article', title: 'Test Article' };
    renderComponent({ structuredData });

    expect(mockGenerateStructuredData).toHaveBeenCalledWith(
      defaultProps.type,
      structuredData
    );
  });

  it('devrait mettre à jour l\'URL canonique si fournie', () => {
    const canonicalUrl = 'https://example.com/test';
    renderComponent({ canonicalUrl });

    expect(mockUpdateCanonicalUrl).toHaveBeenCalledWith(canonicalUrl);
  });

  it('devrait mettre à jour les balises de médias sociaux si fournies', () => {
    const socialData = {
      title: 'Social Title',
      description: 'Social Description',
      image: 'social-image.jpg',
    };
    renderComponent({ socialData });

    expect(mockUpdateSocialMediaTags).toHaveBeenCalledWith(socialData);
  });

  it('devrait mesurer les performances de rendu', () => {
    renderComponent();
    expect(mockMeasureRender).toHaveBeenCalled();
  });

  it('devrait rendre le contenu correctement', () => {
    renderComponent();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('devrait appliquer les styles personnalisés', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = renderComponent({ style: customStyle });
    
    const mainElement = container.firstChild;
    expect(mainElement).toHaveStyle(customStyle);
  });

  it('devrait gérer les mises à jour de props', () => {
    const { rerender } = renderComponent();
    
    const newProps = {
      title: 'New Title',
      description: 'New Description',
    };

    rerender(
      <ThemeProvider theme={theme}>
        <SEOPage {...defaultProps} {...newProps} />
      </ThemeProvider>
    );

    expect(mockUpdateSEO).toHaveBeenCalledWith({
      title: newProps.title,
      description: newProps.description,
      keywords: defaultProps.keywords,
      ogType: defaultProps.type,
      ogImage: defaultProps.image,
    });
  });
}); 