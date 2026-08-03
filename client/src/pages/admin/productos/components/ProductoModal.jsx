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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/Select';

export function ProductoModal({
    open,
    onClose,
    form,
    setForm,
    editando,
    guardar,
    buscandoOFF,
    buscarEnOFF,
    categoriasActivas,
    SIN_CATEGORIA
}) {
    const handleSubmit = (e) => {
        guardar(e);
    };

    return (
        <Sheet open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-6 sm:max-w-[400px]">
                <SheetHeader className="p-0 pb-4 border-b border-border">
                    <SheetTitle className="text-lg font-semibold text-foreground">
                        {editando ? 'Editar Producto' : 'Agregar Producto'}
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-4 overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="code">Código *</Label>
                            <Input
                                id="code"
                                placeholder="Ej: A001"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="barcode">Código de barras</Label>
                            <Input
                                id="barcode"
                                placeholder="Ej: 7790001000011"
                                value={form.barcode}
                                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                                onBlur={(e) => buscarEnOFF(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Nombre del producto *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Coca Cola 500ml"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Categoría</Label>
                            <Select
                                value={form.category || SIN_CATEGORIA}
                                onValueChange={(v) => setForm({ ...form, category: v === SIN_CATEGORIA ? '' : v })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sin categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={SIN_CATEGORIA}>Sin categoría</SelectItem>
                                    {categoriasActivas.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="salePrice">Precio ($) *</Label>
                            <Input
                                id="salePrice"
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.salePrice}
                                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                                required
                            />
                        </div>

                        {buscandoOFF && (
                            <p className="animate-pulse text-xs text-muted-foreground">
                                Buscando datos en OpenFoodFacts…
                            </p>
                        )}
                    </div>

                    <SheetFooter className="p-0 pt-4 border-t border-border mt-4 flex-row justify-end gap-2.5">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button disabled={buscandoOFF} type="submit">
                            {editando ? 'Guardar Cambios' : 'Agregar Producto'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
