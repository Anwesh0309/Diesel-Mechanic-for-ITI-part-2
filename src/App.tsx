import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';

const Home = lazy(() => import('@/pages/Home'));
const PartPage = lazy(() => import('@/pages/PartPage'));
const UnitPage = lazy(() => import('@/pages/UnitPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));

export default function App() {
  return (
    <Shell>
      <Suspense fallback={<div className="py-24 text-center text-mute text-sm">…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track/:k" element={<PartPage />} />
          <Route path="/unit/:id" element={<UnitPage />} />
          <Route path="/unit/:id/:stage" element={<UnitPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
