"use client"

import { useEffect, useState } from "react"
import { useEstablishment } from "@/components/establishment-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Product, Category } from "@/types/entities"
import { productService } from "@/lib/services/product-service"
import { categoryService } from "@/lib/services/category-service"

export default function ProductsPage() {
  const { currentEstablishment } = useEstablishment()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isEditingProduct, setIsEditingProduct] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    available: true,
  })

  useEffect(() => {
    if (currentEstablishment) {
      loadData()
    }
  }, [currentEstablishment])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(currentEstablishment!.id),
        categoryService.getCategories(currentEstablishment!.id),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    try {
      const newProduct = await productService.createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        available: formData.available,
        establishmentId: currentEstablishment!.id,
      })
      setProducts([...products, newProduct])
      setIsAddingProduct(false)
      resetForm()
      toast.success("Produto adicionado com sucesso")
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Erro ao adicionar produto")
    }
  }

  const handleEditProduct = async () => {
    if (!currentProduct) return

    try {
      const updatedProduct = await productService.updateProduct(currentProduct.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        available: formData.available,
      })
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
      setIsEditingProduct(false)
      setCurrentProduct(null)
      resetForm()
      toast.success("Produto atualizado com sucesso")
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Erro ao atualizar produto")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
      toast.success("Produto excluído com sucesso")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Erro ao excluir produto")
    }
  }

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      const updatedProduct = await productService.toggleAvailability(id, available)
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
      toast.success(`Produto ${available ? "ativado" : "desativado"} com sucesso`)
    } catch (error) {
      console.error("Error toggling product availability:", error)
      toast.error("Erro ao alterar disponibilidade do produto")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      available: true,
    })
  }

  const openEditForm = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      description: product.description!,
      price: product.price.toString(),
      categoryId: product.categoryId!,
      available: product.available,
    })
    setIsEditingProduct(true)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={() => setIsAddingProduct(true)}>Adicionar Produto</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === product.categoryId)?.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={product.available ? "default" : "secondary"}
                      onClick={() => handleToggleAvailability(product.id, !product.available)}
                    >
                      {product.available ? "Ativo" : "Inativo"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEditForm(product)}>
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(isAddingProduct || isEditingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>
                {isAddingProduct ? "Adicionar Produto" : "Editar Produto"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingProduct(false)
                      setIsEditingProduct(false)
                      setCurrentProduct(null)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={isAddingProduct ? handleAddProduct : handleEditProduct}>
                    {isAddingProduct ? "Adicionar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

