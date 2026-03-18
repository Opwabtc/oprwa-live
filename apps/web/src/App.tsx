import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppNav } from '@/components/AppNav';
import { CustomCursor } from '@/components/CustomCursor';
import { Landing } from '@/pages/Landing';
import { Marketplace } from '@/pages/Marketplace';
import { AssetDetail } from '@/pages/AssetDetail';
import { Portfolio } from '@/pages/Portfolio';
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
      <CustomCursor />
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
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
