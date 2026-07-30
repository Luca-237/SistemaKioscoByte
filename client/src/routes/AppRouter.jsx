import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useOperatorStore } from '../store/operatorStore';
import { AccesoEmpleadosPage } from '../pages/auth';

// Code-splitting: el POS, el admin y la landing se cargan solo cuando se usan.
const CajaPage = lazy(() => import('../pages/operario/caja'));
const AdminArea = lazy(() => import('../pages/admin'));
const LandingPage = lazy(() => import('../pages/landing'));
const PanelOperario = lazy(() => import('../pages/operario/panel'));

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
                <Route path="/login" element={<AccesoEmpleadosPage />} />

                <Route element={<RequireOperator />}>
                    <Route path="/pos" element={<CajaPage />} />
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
