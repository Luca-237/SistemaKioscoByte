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

export function LocalModal({
    open,
    onClose,
    form,
    setForm,
    editando,
    guardar
}) {
    const handleSubmit = (e) => {
        guardar(e);
    };

    return (
        <Sheet open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-6 sm:max-w-[400px]">
                <SheetHeader className="p-0 pb-4 border-b border-border">
                    <SheetTitle className="text-lg font-semibold text-foreground">
                        {editando ? 'Editar sucursal' : 'Agregar sucursal'}
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-4 overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Nombre de la sucursal *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Sucursal Centro"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                placeholder="Ej: Av. San Martín 123"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                placeholder="Ej: 351 1234567"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <SheetFooter className="p-0 pt-4 border-t border-border mt-4 flex-row justify-end gap-2.5">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editando ? 'Guardar cambios' : 'Agregar sucursal'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
