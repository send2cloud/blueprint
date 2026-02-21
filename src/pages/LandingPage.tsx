import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getStorageAdapter } from '../lib/storage';

const IdeaScene = lazy(() => import('../components/landing/IdeaScene'));

export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // Auto-redirect to the first project's dashboard if projects exist
  useEffect(() => {
    const storage = getStorageAdapter();
    storage.getProjects().then(projects => {
      if (projects.length > 0) {
        navigate(`/${projects[0].slug}`, { replace: true });
      } else {
        setReady(true);
      }
    }).catch(() => setReady(true));
  }, [navigate]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0a0a0b' }}>
        <span className="text-xs tracking-[0.3em] uppercase" style={{ color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>
          Loading…
        </span>
      </div>
    );
  }
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: '#0a0a0b' }}>
      {/* 3D Background */}
      <Suspense fallback={null}>
        <IdeaScene />
      </Suspense>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pointer-events-none">
        
        {/* Top-left mark */}
        <motion.div
          className="absolute top-8 left-8 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: '#555', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Blueprint
          </span>
        </motion.div>

        {/* Main content — offset left for asymmetry */}
        <div className="w-full max-w-5xl -mt-12" style={{ paddingLeft: '4%' }}>
          
          {/* Overline */}
          <motion.p
            className="text-sm tracking-[0.2em] uppercase mb-6"
            style={{ color: '#666', fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Your project's idea room
          </motion.p>

          {/* Headline — large, editorial */}
          <motion.h1
            className="leading-[0.9] font-bold mb-8"
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              color: '#f0f0f0',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.03em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            Where ideas<br />
            <span style={{ color: '#4ecdc4' }}>take shape.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-lg max-w-md mb-12 leading-relaxed"
            style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Sketch on whiteboards. Map out flows. Track tasks.
            Write docs. All in one space that lives with your project.
          </motion.p>

          {/* CTA */}
          <motion.button
            onClick={() => navigate('/home')}
            className="pointer-events-auto group relative px-10 py-4 text-base font-medium tracking-wide uppercase overflow-hidden"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#0a0a0b',
              background: '#f0f0f0',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.15em',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Launch →</span>
            {/* Hover fill effect */}
            <motion.div
              className="absolute inset-0"
              style={{ background: '#4ecdc4', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.button>
        </div>

        {/* Bottom-right descriptor */}
        <motion.div
          className="absolute bottom-8 right-8 text-right pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <p
            className="text-xs leading-relaxed max-w-48"
            style={{ color: '#444', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Whiteboard · Flow · Tasks · Docs · Calendar
          </p>
        </motion.div>
      </div>
    </div>
  );
}
