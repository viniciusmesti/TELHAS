"use client"
import { ArrowDownToLine, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize, formatDate } from "@/lib/utils"

interface FileListProps {
  files: any[]
  onDelete: (fileId: string) => void
}

export function FileList({ files, onDelete }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum arquivo disponível para download</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="futuristic-border flex items-center justify-between p-2 bg-background/50 dark:bg-muted/20"
        >
          <div className="flex items-center space-x-2 overflow-hidden">
            <FileText className="h-5 w-5 flex-shrink-0 text-secondary" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary/20 hover:text-secondary transition-colors"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/20 transition-colors"
              onClick={() => onDelete(file.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
