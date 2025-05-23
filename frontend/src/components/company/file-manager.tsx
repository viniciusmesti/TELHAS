"use client"

import * as React from "react"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/company/file-uploader"
import { FileList } from "@/components/company/file-list"

const fileCategories = [
  { id: "recebimentos", name: "Recebimentos" },
  { id: "pagamentos", name: "Pagamentos" },
  { id: "regra289", name: "Regra 289" },
  { id: "regra326", name: "Regra 326" },
]

interface CompanyFileManagerProps {
  company: string
}

export function CompanyFileManager({ company }: CompanyFileManagerProps) {
  // This would be replaced with actual file data from your backend
  const [files, setFiles] = React.useState<Record<string, any[]>>({
    recebimentos: [],
    pagamentos: [],
    regra289: [],
    regra326: [],
  })

  // Mock function to handle file upload
  const handleFileUpload = (category: string, newFiles: File[]) => {
    const fileObjects = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
    }))

    setFiles((prev) => ({
      ...prev,
      [category]: [...prev[category], ...fileObjects],
    }))
  }

  // Mock function to handle file deletion
  const handleFileDelete = (category: string, fileId: string) => {
    setFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((file) => file.id !== fileId),
    }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="recebimentos" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-muted/50 backdrop-blur-sm">
          {fileCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-glow transition-all duration-300"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {fileCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload Section */}
              <div className="futuristic-card glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ArrowUpFromLine className="mr-2 h-5 w-5 text-primary" />
                    Upload de {category.name}
                  </CardTitle>
                  <CardDescription>
                    Faça upload de um ou mais arquivos de {category.name.toLowerCase()} para {company}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader onFilesSelected={(files) => handleFileUpload(category.id, files)} multiple={true} />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Formatos suportados: PDF, XLS, XLSX, CSV</p>
                </CardFooter>
              </div>

              {/* Download Section */}
              <div className="futuristic-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ArrowDownToLine className="mr-2 h-5 w-5 text-secondary" />
                    Arquivos de {category.name}
                  </CardTitle>
                  <CardDescription>Arquivos de {category.name.toLowerCase()} disponíveis para download</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileList files={files[category.id]} onDelete={(fileId) => handleFileDelete(category.id, fileId)} />
                </CardContent>
                <CardFooter>
                  {files[category.id].length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full bg-secondary/10 hover:bg-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all duration-300"
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Baixar Todos
                    </Button>
                  )}
                </CardFooter>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
