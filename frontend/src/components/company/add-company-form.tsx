"use client"

import * as React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da empresa deve ter pelo menos 2 caracteres.",
  }),
  code: z.string().min(2, {
    message: "O código da empresa deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
})

// Definindo o tipo a partir do schema
type FormValues = z.infer<typeof formSchema>

export function AddCompanyForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      setIsSubmitting(false)
      form.reset()
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Nova Empresa
        </CardTitle>
        <CardDescription>
          Adicione uma nova empresa ao sistema para gerenciar seus arquivos financeiros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: TELHAS" {...field} />
                    </FormControl>
                    <FormDescription>Nome completo da empresa.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: telhas" {...field} />
                    </FormControl>
                    <FormDescription>Código único para identificação no sistema.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a empresa e suas operações..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar Empresa"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
