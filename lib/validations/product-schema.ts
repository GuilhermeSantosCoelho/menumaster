import { z } from "zod"

export const productFormSchema = z.object({
  name: z.string()
    .min(1, "O nome é obrigatório")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  description: z.string()
    .min(1, "A descrição é obrigatória")
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  price: z.string()
    .min(1, "O preço é obrigatório")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "O preço deve ser um número positivo",
    }),
  categoryId: z.string()
    .min(1, "A categoria é obrigatória"),
  available: z.boolean(),
  stock: z.string()
    .refine((val) => {
      if (val === "") return true
      const num = parseInt(val)
      return !isNaN(num) && num >= 0
    }, {
      message: "O estoque deve ser um número positivo",
    }),
  hasNoStock: z.boolean(),
}).refine((data) => {
  if (!data.hasNoStock) {
    return data.stock !== ""
  }
  return true
}, {
  message: "O estoque é obrigatório quando o produto possui controle de estoque",
  path: ["stock"],
})

export type ProductFormData = z.infer<typeof productFormSchema> 