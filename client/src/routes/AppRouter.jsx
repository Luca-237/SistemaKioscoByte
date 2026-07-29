import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useOperatorStore } from '../store/operatorStore';
import { LoginOperario } from '../pages/LoginOperario';

// Code-splitting: el POS, el admin y la landing se cargan solo cuando se usan.
const PosPage = lazy(() => import('../pages/PosPage'));
const AdminArea = lazy(() => import('../pages/AdminArea'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const PanelOperario = lazy(() => import('../pages/PanelOperario'));

const Cargando = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b', fontWeight: 600 }}>
        Cargando…
    </div>
);

// Solo deja pasar operarios logueados.
const RequireOperator = () => {
    const token = useOperatorStore((s) => s.token);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AppRouter = () => (
    <BrowserRouter>
        <Suspense fallback={<Cargando />}>
            <Routes>
                <Route path="/login" element={<LoginOperario />} />

                <Route element={<RequireOperator />}>
                    <Route path="/pos" element={<PosPage />} />
                    <Route path="/panel" element={<PanelOperario />} />
                </Route>

                {/* Área del propietario (Clerk se resuelve adentro) */}
                <Route path="/admin/*" element={<AdminArea />} />

                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    </BrowserRouter>
);
