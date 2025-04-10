"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Trash, Tags } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Category = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  establishment_id: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Get the current user's establishment
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      
      if (!establishment) throw new Error("No establishment found")

      // Get categories for this establishment
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('name', { ascending: true })

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (formData: HTMLFormElement) => {
    try {
      setSaving(true)
      
      // Get user's establishment
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      
      if (!establishment) throw new Error("No establishment found")

      const form = new FormData(formData)
      const categoryData = {
        name: form.get('name') as string,
        description: form.get('description') as string,
        establishment_id: establishment.id
      }

      let savedCategory;
      
      if (editingCategory) {
        const { data, error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select()
          .single()

        if (error) throw error
        savedCategory = data
        toast.success("Categoria atualizada com sucesso")
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert(categoryData)
          .select()
          .single()

        if (error) throw error
        savedCategory = data
        toast.success("Categoria adicionada com sucesso")
      }

      setCategories(categories => categories.map(c => 
        c.id === savedCategory.id ? savedCategory : c
      ))

      setOpenDialog(false)
      setEditingCategory(null)
      fetchCategories() // Refresh all categories
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error("Erro ao salvar categoria")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== id))
      toast.success("Categoria removida com sucesso")
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error("Erro ao remover categoria")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias do seu cardápio</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Adicionar Nova Categoria"}</DialogTitle>
              <DialogDescription>Preencha os dados da categoria para adicioná-la ao cardápio</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddCategory(e.currentTarget)
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Ex: Lanches" 
                    defaultValue={editingCategory?.name || ""} 
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Ex: Sanduíches, hambúrgueres e outros lanches"
                    defaultValue={editingCategory?.description || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDialog(false)
                    setEditingCategory(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : (editingCategory ? "Salvar" : "Adicionar")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl">Categorias do Cardápio</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : `${categories.length} categorias encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Carregando categorias...</div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Nenhuma categoria encontrada.</div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                      <Tags className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingCategory(category)
                            setOpenDialog(true)
                          }} 
                          className="gap-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category.id)}
                          className="gap-2 text-red-600 cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 