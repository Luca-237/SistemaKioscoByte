import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '../../../../components/ui/sheet';

export function EmpleadoModal({
    open,
    onClose,
    form,
    setForm,
    editando,
    guardar,
    sucursales,
    toggleBranchForm
}) {
    const handleSubmit = (e) => {
        guardar(e);
    };

    return (
        <Sheet open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-6 sm:max-w-[400px]">
                <SheetHeader className="p-0 pb-4 border-b border-border">
                    <SheetTitle className="text-lg font-semibold text-foreground">
                        {editando ? 'Editar operario' : 'Agregar operario'}
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-4 overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Juan Pérez"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="username">Usuario *</Label>
                            <Input
                                id="username"
                                placeholder="Ej: jperez"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">{editando ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required={!editando}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Locales asignados</Label>
                            <div className="flex flex-col gap-2 rounded-md border border-input p-3">
                                {sucursales.map((b) => (
                                    <label key={b._id} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input text-primary focus:ring-primary"
                                            checked={form.branchIds.includes(b._id)}
                                            onChange={() => toggleBranchForm(b._id)}
                                        />
                                        {b.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="p-0 pt-4 border-t border-border mt-4 flex-row justify-end gap-2.5">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editando ? 'Guardar cambios' : 'Agregar operario'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
