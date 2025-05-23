"use client"

import * as React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Definindo os schemas com tipos mais precisos
const generalFormSchema = z.object({
  systemName: z.string().min(2, {
    message: "O nome do sistema deve ter pelo menos 2 caracteres.",
  }),
  darkMode: z.boolean(),
  notifications: z.boolean(),
})

// Definindo o tipo a partir do schema
type GeneralFormValues = z.infer<typeof generalFormSchema>

const storageFormSchema = z.object({
  maxFileSize: z.string().min(1, {
    message: "Tamanho máximo de arquivo é obrigatório.",
  }),
  allowedFileTypes: z.string().min(1, {
    message: "Tipos de arquivo permitidos são obrigatórios.",
  }),
  autoDeleteFiles: z.boolean(),
})

// Definindo o tipo a partir do schema
type StorageFormValues = z.infer<typeof storageFormSchema>

export function SettingsForm() {
  // Usando os tipos definidos acima
  const generalForm = useForm<GeneralFormValues>({
    defaultValues: {
      systemName: "FinDocs",
      darkMode: false,
      notifications: true,
    },
  })

  const storageForm = useForm<StorageFormValues>({
    defaultValues: {
      maxFileSize: "10",
      allowedFileTypes: "pdf,xls,xlsx,csv",
      autoDeleteFiles: false,
    },
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Usando o tipo SubmitHandler com o tipo correto
  const onSubmitGeneral: SubmitHandler<GeneralFormValues> = (data) => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      setIsSubmitting(false)
    }, 1500)
  }

  // Usando o tipo SubmitHandler com o tipo correto
  const onSubmitStorage: SubmitHandler<StorageFormValues> = (data) => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="storage">Armazenamento</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Personalize as configurações gerais do sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                <FormField
                  control={generalForm.control}
                  name="systemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Sistema</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Este nome será exibido no cabeçalho e no título da página.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={generalForm.control}
                  name="darkMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Modo Escuro</FormLabel>
                        <FormDescription>Ativar o modo escuro para o sistema.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={generalForm.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Notificações</FormLabel>
                        <FormDescription>Receber notificações sobre uploads e downloads.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="storage">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Armazenamento</CardTitle>
            <CardDescription>Gerencie como os arquivos são armazenados e processados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...storageForm}>
              <form onSubmit={storageForm.handleSubmit(onSubmitStorage)} className="space-y-6">
                <FormField
                  control={storageForm.control}
                  name="maxFileSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho Máximo de Arquivo (MB)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Tamanho máximo permitido para upload de arquivos em megabytes.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={storageForm.control}
                  name="allowedFileTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipos de Arquivo Permitidos</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Lista de extensões de arquivo permitidas, separadas por vírgula (ex: pdf,xls,xlsx,csv).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={storageForm.control}
                  name="autoDeleteFiles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exclusão Automática</FormLabel>
                        <FormDescription>Excluir automaticamente arquivos após 30 dias.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
