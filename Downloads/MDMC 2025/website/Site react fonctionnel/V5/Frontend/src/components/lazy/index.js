import { lazy } from 'react';

// Pages publiques
export const HomePage = lazy(() => import('../../pages/public/HomePage'));
export const ArtistPage = lazy(() => import('../../pages/public/ArtistPage'));
export const SmartLinkPage = lazy(() => import('../../pages/public/SmartLinkPage'));
export const AllReviews = lazy(() => import('../../components/pages/AllReviews'));

// Pages d'administration
export const AdminLogin = lazy(() => import('../../components/admin/AdminLogin'));
export const AdminPanel = lazy(() => import('../../components/admin/AdminPanel'));
export const ArtistListPage = lazy(() => import('../../pages/admin/artists/ArtistListPage'));
export const ArtistCreatePage = lazy(() => import('../../pages/admin/artists/ArtistCreatePage'));
export const ArtistEditPage = lazy(() => import('../../pages/admin/artists/ArtistEditPage'));
export const SmartlinkListPage = lazy(() => import('../../pages/admin/smartlinks/SmartlinkListPage'));
export const SmartlinkCreatePage = lazy(() => import('../../pages/admin/smartlinks/SmartlinkCreatePage'));
export const SmartlinkEditPage = lazy(() => import('../../pages/admin/smartlinks/SmartlinkEditPage'));
export const LandingPageGenerator = lazy(() => import('../../components/admin/LandingPageGenerator'));
export const WordPressConnector = lazy(() => import('../../components/admin/WordPressConnector'));
export const WordPressSync = lazy(() => import('../../components/admin/WordPressSync'));
export const ReviewManager = lazy(() => import('../../components/admin/ReviewManager'));
export const CampaignStatsShowcase = lazy(() => import('../../components/landing/common/CampaignStatsShowcase'));

// Sections
export const Hero = lazy(() => import('../../components/sections/Hero'));
export const Services = lazy(() => import('../../components/sections/Services'));
export const About = lazy(() => import('../../components/sections/About'));
export const Articles = lazy(() => import('../../components/sections/Articles'));
export const Reviews = lazy(() => import('../../components/sections/Reviews'));
export const Contact = lazy(() => import('../../components/sections/Contact'));

// Composants communs
export const Simulator = lazy(() => import('../../components/features/Simulator'));
export const CookieBanner = lazy(() => import('../../components/features/CookieBanner')); 