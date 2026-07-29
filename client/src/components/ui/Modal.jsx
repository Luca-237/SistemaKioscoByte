import * as React from "react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Modal genérico sobre shadcn <Dialog>. Mantiene la API anterior
// (open, onClose, children) para no tocar a los consumidores.
export function Modal({ open, onClose, className = '', children }) {
    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
            <DialogContent className={cn("gap-3", className)}>
                {children}
            </DialogContent>
        </Dialog>
    );
}
