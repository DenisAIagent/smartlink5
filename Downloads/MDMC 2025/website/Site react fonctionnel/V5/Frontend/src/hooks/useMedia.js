import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';

const useMedia = (query) => {
  const theme = useTheme();
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

const useBreakpoint = () => {
  const theme = useTheme();
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < theme.breakpoints.values.sm) {
        setBreakpoint('xs');
      } else if (width < theme.breakpoints.values.md) {
        setBreakpoint('sm');
      } else if (width < theme.breakpoints.values.lg) {
        setBreakpoint('md');
      } else if (width < theme.breakpoints.values.xl) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme.breakpoints.values]);

  return breakpoint;
};

const useIsMobile = () => {
  const theme = useTheme();
  return useMedia(`(max-width:${theme.breakpoints.values.sm}px)`);
};

const useIsTablet = () => {
  const theme = useTheme();
  return useMedia(
    `(min-width:${theme.breakpoints.values.sm}px) and (max-width:${theme.breakpoints.values.md}px)`
  );
};

const useIsDesktop = () => {
  const theme = useTheme();
  return useMedia(`(min-width:${theme.breakpoints.values.md}px)`);
};

const useIsLargeDesktop = () => {
  const theme = useTheme();
  return useMedia(`(min-width:${theme.breakpoints.values.lg}px)`);
};

const useIsPortrait = () => {
  return useMedia('(orientation: portrait)');
};

const useIsLandscape = () => {
  return useMedia('(orientation: landscape)');
};

const usePrefersReducedMotion = () => {
  return useMedia('(prefers-reduced-motion: reduce)');
};

const usePrefersDarkMode = () => {
  return useMedia('(prefers-color-scheme: dark)');
};

export {
  useMedia,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  useIsPortrait,
  useIsLandscape,
  usePrefersReducedMotion,
  usePrefersDarkMode,
}; 