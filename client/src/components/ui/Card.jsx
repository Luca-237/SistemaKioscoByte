import * as React from "react"

import { cn } from "@/lib/utils"

// Card de superficie. variant="glass" mantiene el look glassmorphism legado
// (se elimina en la migración a shadcn del admin). accent agrega una clase
// extra (ej. borde de color) sobre la base de shadcn.
function Card({ variant, accent, className = '', children, ...props }) {
    const base = variant === 'glass'
        ? 'glass-panel'
        : 'flex flex-col gap-6 rounded-xl border bg-card px-6 py-6 text-card-foreground shadow-sm';

    return (
        <div data-slot="card" className={cn(base, accent, className)} {...props}>
            {children}
        </div>
    );
}

function CardHeader({ className, ...props }) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
                className
            )}
            {...props} />
    );
}

function CardTitle({ className, ...props }) {
    return (
        <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />
    );
}

function CardDescription({ className, ...props }) {
    return (
        <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
    );
}

function CardAction({ className, ...props }) {
    return (
        <div
            data-slot="card-action"
            className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
            {...props} />
    );
}

function CardContent({ className, ...props }) {
    return <div data-slot="card-content" className={className} {...props} />;
}

function CardFooter({ className, ...props }) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center [.border-t]:pt-6", className)}
            {...props} />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
