"use client";

import { useEstablishment } from "@/components/establishment-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { categoryService } from "@/lib/services/category-service";
import { productService } from "@/lib/services/product-service";
import {
  ProductFormData,
  productFormSchema,
} from "@/lib/validations/product-schema";
import { Category, Product } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function ProductsPage() {
  const { currentEstablishment } = useEstablishment();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: products,
    isLoading: isLoadingProducts,
    refetch,
  } = useQuery({
    queryKey: ["products", currentEstablishment?.id],
    queryFn: () => productService.getProducts(currentEstablishment!.id),
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      available: true,
      stock: "",
      hasNoStock: false,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      available: true,
      stock: "",
      hasNoStock: false,
    });
  };

  useEffect(() => {
    if (currentEstablishment) {
      loadData();
    }
  }, [currentEstablishment]);

  const loadData = async () => {
    try {
      const [categoriesData] = await Promise.all([
        categoryService.getCategories(currentEstablishment!.id),
      ]);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const { mutate: createProduct } = useMutation({
    mutationKey: ["createProduct"],
    mutationFn: (data: ProductFormData) =>
      productService.createProduct({
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.categoryId,
        available: data.available,
        establishmentId: currentEstablishment!.id,
        stock: data.hasNoStock ? -1 : parseInt(data.stock) || 0,
      }),
    onSuccess: () => {
      refetch();
      setIsAddingProduct(false);
      resetForm();
      toast.success("Produto adicionado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao adicionar produto");
    },
  });

  const { mutate: updateProduct } = useMutation({
    mutationKey: ["updateProduct"],
    mutationFn: (data: ProductFormData) =>
      productService.updateProduct(currentProduct!.id, {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.categoryId,
        available: data.available,
        stock: data.hasNoStock ? -1 : parseInt(data.stock) || 0,
      }),
    onSuccess: () => {
      refetch();
      setIsEditingProduct(false);
      setCurrentProduct(null);
      resetForm();
      toast.success("Produto atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar produto");
    },
  });

  const { mutate: deleteProduct } = useMutation({
    mutationKey: ["deleteProduct"],
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      refetch();
      setProductToDelete(null);
      toast.success("Produto excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir produto");
    },
  });

  const { mutate: toggleAvailability } = useMutation({
    mutationKey: ["toggleAvailability"],
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      productService.toggleAvailability(id, available),
    onSuccess: () => {
      refetch();
      toast.success(`Produto alterado com sucesso`);
    },
    onError: () => {
      toast.error("Erro ao alterar disponibilidade do produto");
    },
  });

  const openEditForm = (product: Product) => {
    setCurrentProduct(product);
    form.reset({
      name: product.name,
      description: product.description!,
      price: product.price.toString(),
      categoryId: product.categoryId!,
      available: product.available,
      stock: product.stock === -1 ? "" : product.stock?.toString() || "",
      hasNoStock: product.stock === -1,
    });
    setIsEditingProduct(true);
  };

  if (isLoadingProducts) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos do seu estabelecimento
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAddingProduct(true);
            resetForm();
          }}
        >
          Adicionar Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {
                          categories.find((c) => c.id === product.categoryId)
                            ?.name
                        }
                      </TableCell>
                      <TableCell>
                        {product.stock === -1
                          ? "Indeterminado"
                          : product.stock?.toString() || "0"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.available}
                          onCheckedChange={(checked) =>
                            toggleAvailability({
                              id: product.id,
                              available: checked,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" color="red" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      ?.filter((product) => product.categoryId === category.id)
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Switch
                              checked={product.available}
                              onCheckedChange={(checked) =>
                                toggleAvailability({
                                  id: product.id,
                                  available: checked,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditForm(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setProductToDelete(product)}
                              >
                                <Trash2 className="h-4 w-4" color="red" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
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
              <Form {...form}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const isValid = await form.trigger();
                    if (isValid) {
                      const data = form.getValues();
                      if (isAddingProduct) {
                        await createProduct(data);
                      } else {
                        await updateProduct(data);
                      }
                    }
                  }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem
                        className={form.watch("hasNoStock") ? "hidden" : ""}
                      >
                        <FormLabel>Estoque</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasNoStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-1">
                            Produto não possui estoque
                            <Popover>
                              <PopoverTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </PopoverTrigger>
                              <PopoverContent>
                                Marque se o item não tiver um estoque definido.
                                Exemplo: Chopp 500ml
                              </PopoverContent>
                            </Popover>
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setIsEditingProduct(false);
                        setCurrentProduct(null);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const data = form.getValues();
                        if (isAddingProduct) {
                          createProduct(data);
                        } else {
                          updateProduct(data);
                        }
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={productToDelete !== null}
        onOpenChange={() => setProductToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-semibold">{productToDelete?.name}</span>?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                productToDelete && deleteProduct(productToDelete.id)
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
