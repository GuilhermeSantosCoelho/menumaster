"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, PlusCircle, Store } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEstablishment } from "./establishment-context"

export function EstablishmentSwitcher() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { establishments, currentEstablishment, changeEstablishment } = useEstablishment();

  if (!currentEstablishment) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecione um estabelecimento"
          className="w-[200px] justify-between"
        >
          <Store className="mr-2 h-4 w-4" />
          <span className="truncate">{currentEstablishment.name}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar estabelecimento..." />
            <CommandEmpty>Nenhum estabelecimento encontrado.</CommandEmpty>
            <CommandGroup heading="Estabelecimentos">
              {establishments.map((establishment) => (
                <CommandItem
                  key={establishment.id}
                  onSelect={() => {
                    changeEstablishment(establishment.id)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <Store className="mr-2 h-4 w-4" />
                  <span className="truncate">{establishment.name}</span>
                  {currentEstablishment.id === establishment.id && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  router.push("/dashboard/novo-estabelecimento")
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Estabelecimento
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

