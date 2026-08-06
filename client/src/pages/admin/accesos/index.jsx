import { useAccesos } from '../../../hooks/useAccesos';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';

export const AccesosPage = () => {
    const { operarios, codigos, toggle } = useAccesos();

    const handleToggle = async (user, code) => {
        const enabled = !user.permissions.includes(code);
        try {
            await toggle(user._id, code, enabled);
        } catch (err) { alert(err.response?.data?.message || 'Error al actualizar el acceso'); }
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1.5 rounded-full bg-primary" />
                    <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Permisos y Accesos</h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Configuración de módulos habilitados para cada operario en el panel.</p>
            </div>

            <Card className="overflow-hidden p-0 gap-0">
                {operarios.length === 0 ? (
                    <EmptyState message="Todavía no creaste operarios." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <Th>Operario</Th>
                                {codigos.map((c) => <Th key={c.code} className="text-center">{c.label}</Th>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {operarios.map((u) => (
                                <TableRow key={u._id} className={u.active ? '' : 'opacity-50'}>
                                    <Td>{u.name}</Td>
                                    {codigos.map((c) => (
                                        <Td key={c.code} className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={u.permissions.includes(c.code)}
                                                onChange={() => handleToggle(u, c.code)}
                                            />
                                        </Td>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};
