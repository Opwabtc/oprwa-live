import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppNav } from '@/components/AppNav';
import { CursorTrail } from '@/components/CursorTrail';
import { Landing } from '@/pages/Landing';
import { AssetDetail } from '@/pages/AssetDetail';
import { Dashboard } from '@/pages/Dashboard';
import { Docs } from '@/pages/Docs';

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const PAGE_TRANSITION = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

export function App(): React.JSX.Element {
  const location = useLocation();

  return (
    <>
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
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
