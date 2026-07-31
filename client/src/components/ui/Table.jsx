import * as React from "react"

import { cn } from "@/lib/utils"

// Tabla real de shadcn. compact reduce el padding de celdas (equivalente a
// la vieja clase .compacta).
function Table({ compact = false, className = '', children, ...props }) {
    return (
        <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table
                data-slot="table"
                className={cn("w-full caption-bottom text-sm", compact && "[&_th]:py-1.5 [&_td]:py-1.5", className)}
                {...props}>
                {children}
            </table>
        </div>
    );
}

function TableHeader({ className, ...props }) {
    return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }) {
    return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }) {
    return (
        <tfoot data-slot="table-footer" className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
    );
}

function TableRow({ className, ...props }) {
    return (
        <tr
            data-slot="table-row"
            className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
            {...props} />
    );
}

// Th: equivalente shadcn TableHead, mantiene el nombre corto usado antes.
function Th({ className, children, ...props }) {
    return (
        <th
            data-slot="table-head"
            className={cn("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-muted-foreground", className)}
            {...props}>
            {children}
        </th>
    );
}

// Td: equivalente shadcn TableCell, mantiene el nombre corto usado antes.
function Td({ className, children, ...props }) {
    return (
        <td data-slot="table-cell" className={cn("p-2 align-middle", className)} {...props}>
            {children}
        </td>
    );
}

function TableCaption({ className, ...props }) {
    return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableRow, Th, Td, TableCaption };
