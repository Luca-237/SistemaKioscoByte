import { cn } from "@/lib/utils";

// Estado vacío estándar: ícono + mensaje + acción opcional.
export function EmptyState({ message = 'Sin resultados.', action }) {
    return (
        <div className="px-5 py-10 text-center">
            <p className={cn("text-muted-foreground", action && "mb-4")}>{message}</p>
            {action}
        </div>
    );
}
