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
            <h2 className="m-0 mb-1 text-2xl font-semibold text-foreground">Accesos</h2>
            <p className="mb-4 text-sm text-muted-foreground">
                Elegí qué secciones del panel puede ver cada operario, además de su punto de venta.
            </p>

            <Card className="overflow-hidden p-0">
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
                                    <Td><strong>{u.name}</strong></Td>
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
