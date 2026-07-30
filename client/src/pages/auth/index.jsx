import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginOperario } from '../../api/auth.api';
import { useOperatorStore } from '../../store/operatorStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export const AccesoEmpleadosPage = () => {
    const navigate = useNavigate();
    const login = useOperatorStore((s) => s.login);

    const [form, setForm] = useState({
        orgCode: localStorage.getItem('fs_org_code') || '',
        username: '',
        password: ''
    });
    const [branches, setBranches] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const enviar = async (branchId = undefined) => {
        setError(null);
        setCargando(true);
        try {
            const { data } = await loginOperario(form.orgCode, form.username, form.password, branchId);

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
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#eef2ff_0%,var(--background)_100%)] p-5">
            <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card px-8 py-9 shadow-[0_10px_40px_rgba(24,24,27,0.08)]">
                <div className="mb-6 text-center">
                    <span className="inline-flex size-13 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-extrabold text-primary-foreground">FS</span>
                    <h1 className="mt-3 mb-1 font-heading text-2xl">FitoShop</h1>
                    <p className="m-0 text-sm text-muted-foreground">Acceso de empleados</p>
                </div>

                {!branches ? (
                    <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="orgCode">Código de empresa</Label>
                            <Input
                                id="orgCode"
                                value={form.orgCode}
                                onChange={(e) => setForm({ ...form, orgCode: e.target.value.toUpperCase() })}
                                placeholder="Ej: DEMO01"
                                required
                                autoFocus={!form.orgCode}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="username">Usuario</Label>
                            <Input
                                id="username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                autoFocus={!!form.orgCode}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        {error && <p className="m-0 text-center text-sm text-destructive">{error}</p>}

                        <Button type="submit" disabled={cargando} className="mt-1.5 w-full">
                            {cargando ? 'Ingresando…' : 'Ingresar'}
                        </Button>

                        <div className="mt-4 flex flex-col items-center gap-1 rounded-[10px] border border-dashed border-border bg-muted-foreground/8 px-3.5 py-3 text-center text-xs text-muted-foreground">
                            <strong className="text-[13px] text-foreground">Cuenta demo</strong>
                            <span>
                                Empresa <code className="rounded bg-muted-foreground/20 px-1.5 py-px font-mono">DEMO01</code> · usuarios{' '}
                                <code className="rounded bg-muted-foreground/20 px-1.5 py-px font-mono">juan</code> /{' '}
                                <code className="rounded bg-muted-foreground/20 px-1.5 py-px font-mono">maria</code> · clave{' '}
                                <code className="rounded bg-muted-foreground/20 px-1.5 py-px font-mono">1234</code>
                            </span>
                            <Button
                                variant="link"
                                type="button"
                                className="h-auto p-0.5 text-xs"
                                onClick={() => setForm({ orgCode: 'DEMO01', username: 'juan', password: '1234' })}
                            >
                                Usar credenciales demo
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col gap-3.5">
                        <p className="m-0 text-center text-muted-foreground">
                            ¿En qué local vas a operar hoy?
                        </p>
                        {branches.map((b) => (
                            <button
                                key={b.id}
                                disabled={cargando}
                                onClick={() => enviar(b.id)}
                                className="flex w-full flex-col gap-0.5 rounded-lg border border-border bg-card px-3.5 py-3.5 text-left text-[0.95rem] text-foreground transition-colors hover:border-primary hover:bg-accent disabled:opacity-60"
                            >
                                <strong>{b.name}</strong>
                                {b.address && <span className="text-xs text-muted-foreground">{b.address}</span>}
                            </button>
                        ))}
                        <Button variant="link" onClick={() => setBranches(null)}>← Volver</Button>
                    </div>
                )}

                <p className="mt-5.5 mb-0 text-center text-[13px] text-muted-foreground">
                    ¿Sos el dueño del negocio? <Link to="/admin" className="text-primary">Entrá al panel de administración</Link>
                </p>
            </div>
        </div>
    );
};
