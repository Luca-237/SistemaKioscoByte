import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPos } from '../../api/http';
import { useOperatorStore } from '../../store/operatorStore';

// Login de OPERARIOS: código de empresa + usuario + clave.
// Si el operario tiene varias sucursales, el backend devuelve la lista y
// se muestra el paso de selección antes de emitir el token definitivo.
export const LoginOperario = () => {
    const navigate = useNavigate();
    const login = useOperatorStore((s) => s.login);

    const [form, setForm] = useState({
        orgCode: localStorage.getItem('fs_org_code') || '',
        username: '',
        password: ''
    });
    const [branches, setBranches] = useState(null);   // null = paso credenciales
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const enviar = async (branchId = undefined) => {
        setError(null);
        setCargando(true);
        try {
            const { data } = await apiPos.post('/api/auth/operator/login', { ...form, branchId });

            if (data.needsBranchSelection) {
                setBranches(data.branches);
                return;
            }

            localStorage.setItem('fs_org_code', form.orgCode.toUpperCase());
            login(data.token, data.operator);
            navigate('/pos');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo conectar con el servidor');
            setBranches(null);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-brand">
                    <span className="login-logo">FS</span>
                    <h1>FitoShop</h1>
                    <p>Acceso de operarios</p>
                </div>

                {!branches ? (
                    <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="login-form">
                        <label>
                            Código de empresa
                            <input
                                value={form.orgCode}
                                onChange={(e) => setForm({ ...form, orgCode: e.target.value.toUpperCase() })}
                                placeholder="Ej: DEMO01"
                                required
                                autoFocus={!form.orgCode}
                            />
                        </label>
                        <label>
                            Usuario
                            <input
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                autoFocus={!!form.orgCode}
                            />
                        </label>
                        <label>
                            Contraseña
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </label>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" disabled={cargando}>
                            {cargando ? 'Ingresando…' : 'Ingresar'}
                        </button>
                    </form>
                ) : (
                    <div className="login-form">
                        <p style={{ textAlign: 'center', color: '#475569', margin: 0 }}>
                            ¿En qué sucursal vas a operar hoy?
                        </p>
                        {branches.map((b) => (
                            <button
                                key={b.id}
                                className="branch-option"
                                disabled={cargando}
                                onClick={() => enviar(b.id)}
                            >
                                <strong>{b.name}</strong>
                                {b.address && <span>{b.address}</span>}
                            </button>
                        ))}
                        <button className="btn-link" onClick={() => setBranches(null)}>← Volver</button>
                    </div>
                )}

                <p className="login-footer">
                    ¿Sos el dueño del negocio? <Link to="/admin">Entrá al panel de administración</Link>
                </p>
            </div>
        </div>
    );
};
