"use client"

import { useState, useEffect } from "react"
import { Coffee, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  stock: number | null
  available: boolean
  created_at: string
  updated_at: string
  establishment_id: string
  category_id: string | null
  category: string // This will be managed in the UI
}

const CATEGORIES = ["Lanches", "Pizzas", "Bebidas", "Saladas", "Acompanhamentos", "Sobremesas"]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient();

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
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

      // Get products for this establishment
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map database products to include UI category
      const productsWithCategory = (dbProducts || []).map(product => ({
        ...product,
        category: CATEGORIES[0] // Default to first category, you might want to store this in the database
      }))

      setProducts(productsWithCategory)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (formData: HTMLFormElement) => {
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
      const category = form.get('category') as string
      const productData = {
        name: form.get('name') as string,
        price: parseFloat(form.get('price') as string),
        description: form.get('description') as string,
        available: (form.get('available') as string) === 'on',
        stock: parseInt(form.get('stock') as string || '0'),
        establishment_id: establishment.id
      }

      let savedProduct;
      
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single()

        if (error) throw error
        savedProduct = { ...data, category }
        toast.success("Produto atualizado com sucesso")
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        savedProduct = { ...data, category }
        toast.success("Produto adicionado com sucesso")
      }

      // Update local state with the saved product including category
      setProducts(products => products.map(p => 
        p.id === savedProduct.id ? savedProduct : p
      ))

      setOpenDialog(false)
      setEditingProduct(null)
      fetchProducts() // Refresh all products
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error("Erro ao salvar produto")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== id))
      toast.success("Produto removido com sucesso")
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error("Erro ao remover produto")
    }
  }

  const handleToggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !currentAvailability })
        .eq('id', id)

      if (error) throw error

      setProducts(products.map(product => 
        product.id === id ? { ...product, available: !currentAvailability } : product
      ))
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error("Erro ao atualizar disponibilidade")
    }
  }

  const filteredProducts = filterCategory === "todos" 
    ? products 
    : products.filter((p) => p.category === filterCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o cardápio do seu estabelecimento</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
              <DialogDescription>Preencha os dados do produto para adicioná-lo ao cardápio</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddProduct(e.currentTarget)
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Ex: Hambúrguer Clássico" 
                    defaultValue={editingProduct?.name || ""} 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="Ex: 29.90"
                      step="0.01"
                      defaultValue={editingProduct?.price || ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Estoque (opcional)</Label>
                    <Input 
                      id="stock" 
                      name="stock"
                      type="number" 
                      placeholder="Ex: 20" 
                      defaultValue={editingProduct?.stock || ""} 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue={editingProduct?.category || ""}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Ex: Pão, hambúrguer 180g, queijo, alface, tomate e molho especial"
                    defaultValue={editingProduct?.description || ""}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="available" 
                    name="available"
                    defaultChecked={editingProduct?.available ?? true} 
                  />
                  <Label htmlFor="available">Produto disponível</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDialog(false)
                    setEditingProduct(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : (editingProduct ? "Salvar" : "Adicionar")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="todos" onValueChange={setFilterCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filterCategory}>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">
                {filterCategory === "todos" ? "Todos os Produtos" : filterCategory}
              </CardTitle>
              <CardDescription>
                {loading ? "Carregando..." : `${filteredProducts.length} produtos encontrados`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Carregando produtos...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">Nenhum produto encontrado.</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <Coffee className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {product.name}
                            {!product.available && (
                              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                Indisponível
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            R$ {product.price.toFixed(2)}
                            <span className="text-xs">•</span>
                            <span>{product.category}</span>
                            {product.stock !== undefined && (
                              <>
                                <span className="text-xs">•</span>
                                <span>Estoque: {product.stock}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.available}
                          onCheckedChange={() => handleToggleAvailability(product.id, product.available)}
                        />
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
                                setEditingProduct(product)
                                setOpenDialog(true)
                              }} 
                              className="gap-2 cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

