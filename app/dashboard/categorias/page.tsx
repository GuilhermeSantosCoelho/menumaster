"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Category } from "@/types/entities"
import { categoryService } from "@/lib/services/category-service"
import { useEstablishment } from "@/components/establishment-context"

export default function CategoriesPage() {
  const { toast } = useToast()
  const { currentEstablishment } = useEstablishment()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (currentEstablishment) {
      loadCategories()
    }
  }, [currentEstablishment])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getCategories(currentEstablishment!.id)
      setCategories(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar categorias',
        description: 'Não foi possível carregar as categorias. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsAddingCategory(true)
      await categoryService.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        establishmentId: currentEstablishment!.id,
      })
      
      setNewCategory({ name: '', description: '' })
      await loadCategories()
      
      toast({
        title: 'Categoria criada',
        description: 'A categoria foi criada com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao criar categoria',
        description: 'Não foi possível criar a categoria. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleEditCategory = async (category: Category) => {
    try {
      setEditingCategory(category)
      await categoryService.updateCategory(category.id, category)
      await loadCategories()
      
      toast({
        title: 'Categoria atualizada',
        description: 'A categoria foi atualizada com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar categoria',
        description: 'Não foi possível atualizar a categoria. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id)
      await loadCategories()
      
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao excluir categoria',
        description: 'Não foi possível excluir a categoria. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Nome da categoria"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Descrição da categoria"
                />
              </div>
              <Button
                onClick={handleAddCategory}
                disabled={isAddingCategory}
                className="w-full"
              >
                {isAddingCategory ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Categoria'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma categoria encontrada
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 