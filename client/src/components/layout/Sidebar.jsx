import { useLocation, NavLink } from 'react-router-dom';
import { CircleIcon } from 'lucide-react';
import {
    Sidebar as SidebarPrimitive,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

// Layout con sidebar colapsable (ícono en desktop, hoja deslizante en mobile).
// items acepta dos modos:
//  - navegación por ruta: { href, end, icon, label }
//  - navegación por acción: { key, icon, label, active, onClick }
export function Sidebar({ brand, items = [], footer, children }) {
    const { pathname } = useLocation();

    return (
        <SidebarProvider>
            <SidebarPrimitive collapsible="icon">
                <SidebarHeader>
                    <div className="flex items-center justify-between gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center">
                        <div className="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:hidden">
                            {brand}
                        </div>
                        <SidebarTrigger />
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            {items.map((item) => {
                                const Icon = item.icon ?? CircleIcon;

                                if (item.href) {
                                    const isActive = item.end
                                        ? pathname === item.href
                                        : pathname === item.href || pathname.startsWith(`${item.href}/`);

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                                                <NavLink to={item.href} end={item.end}>
                                                    <Icon />
                                                    <span>{item.label}</span>
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.key}>
                                        <SidebarMenuButton onClick={item.onClick} isActive={item.active} tooltip={item.label}>
                                            <Icon />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                {footer && <SidebarFooter>{footer}</SidebarFooter>}
            </SidebarPrimitive>

            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
                    <SidebarTrigger />
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
