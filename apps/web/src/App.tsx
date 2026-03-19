import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppNav } from '@/components/AppNav';
import { CursorTrail } from '@/components/CursorTrail';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Landing } from '@/pages/Landing';
import { AssetDetail } from '@/pages/AssetDetail';
import { Dashboard } from '@/pages/Dashboard';
import { Docs } from '@/pages/Docs';
import { Terms } from '@/pages/Terms';
import { Privacy } from '@/pages/Privacy';
import { useWalletStore } from '@/store/walletStore';

const PAGE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const PAGE_TRANSITION = { duration: 0.18, ease: 'easeOut' as const };

export function App(): React.JSX.Element {
  const location = useLocation();
  const { address, connected, refreshPortfolio } = useWalletStore();
  const [loading, setLoading] = useState(true);

  // Auto-load portfolio when wallet is restored from localStorage after page refresh
  useEffect(() => {
    if (address && connected) {
      void refreshPortfolio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      <div className="bg-canvas" aria-hidden="true" />
      <div className="bg-canvas-accent" aria-hidden="true" />
      <CursorTrail />
      <AppNav />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={PAGE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={PAGE_TRANSITION}
        >
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/marketplace" element={<Navigate to="/#markets" replace />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/portfolio" element={<Navigate to="/app" replace />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
