"use client"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  accept?: Record<string, string[]>
}

export function FileUploader({
  onFilesSelected,
  multiple = false,
  accept = {
    "application/pdf": [".pdf"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "text/csv": [".csv"],
  },
}: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept,
    multiple,
    onDrop: (acceptedFiles) => {
      // Converter o array readonly para um array mutável
      const files = [...acceptedFiles] as File[]
      onFilesSelected(files)
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-6 cursor-pointer transition-all duration-300",
        isDragActive
          ? "border-primary bg-primary/10 shadow-glow"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 animate-pulse">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col space-y-1 text-center">
          <p className="text-sm font-medium">
            {isDragActive ? "Solte os arquivos aqui" : "Arraste e solte arquivos aqui"}
          </p>
          <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
        </div>
      </div>
      {acceptedFiles.length > 0 && (
        <div className="mt-4 w-full">
          <p className="text-sm font-medium mb-2">Arquivos selecionados:</p>
          <ul className="text-xs space-y-1 max-h-32 overflow-auto">
            {acceptedFiles.map((file, index) => (
              <li key={index} className="text-muted-foreground">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
          <Button
            type="button"
            className="mt-4 w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              // Converter o array readonly para um array mutável
              const files = [...acceptedFiles] as File[]
              onFilesSelected(files)
            }}
          >
            Fazer Upload
          </Button>
        </div>
      )}
    </div>
  )
}
