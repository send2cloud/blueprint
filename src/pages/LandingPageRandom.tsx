import { lazy } from 'react';

// Pick a random landing page variant once per session
const LandingPage = Math.random() < 0.5
  ? lazy(() => import('./pages/LandingPage'))
  : lazy(() => import('./pages/LandingPageV2'));

export default LandingPage;
