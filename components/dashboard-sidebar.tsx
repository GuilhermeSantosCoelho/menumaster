"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  CreditCard,
  Home,
  LogOut,
  QrCode,
  Receipt,
  Settings,
  ShoppingBag,
  Table,
  User,
  Utensils,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { EstablishmentSwitcher } from "./establishment-switcher"
import { useAuth } from "@/hooks/use-auth"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Produtos",
    href: "/dashboard/produtos",
    icon: ShoppingBag,
  },
  {
    title: "Mesas",
    href: "/dashboard/mesas",
    icon: Table,
  },
  {
    title: "Pedidos",
    href: "/dashboard/pedidos",
    icon: Receipt,
  },
  {
    title: "QR Codes",
    href: "/dashboard/qrcodes",
    icon: QrCode,
  },
  {
    title: "Faturas",
    href: "/dashboard/faturas",
    icon: CreditCard,
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
  {
    title: "Minha Conta",
    href: "/dashboard/conta",
    icon: User,
  },
]

export function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { signOut } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Utensils className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 border-b">
            <Utensils className="h-6 w-6" />
            <span className="text-xl font-bold">MenuMaster</span>
          </div>

          <div className="p-4 border-b">
            <EstablishmentSwitcher />
          </div>

          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 border-r flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 p-4 h-16 border-b">
        <Utensils className="h-6 w-6" />
        <span className="text-xl font-bold">MenuMaster</span>
      </div>

      <div className="p-4 border-b">
        <EstablishmentSwitcher />
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground/70 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => signOut()}>
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  )
}

