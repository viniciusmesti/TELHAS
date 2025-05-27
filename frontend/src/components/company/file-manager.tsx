"use client";

import * as React from "react";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/company/file-uploader";
import { FileList } from "@/components/company/file-list";
import {
  uploadUnificado,
  uploadRegra,
  getDownloadUrl,
  UploadResponse,
} from "@/services/api";

const fileCategories = [
  { id: "recebimentos", name: "Recebimentos", tipo: "unificado" },
  { id: "pagamentos",   name: "Pagamentos",   tipo: "unificado" },
  { id: "regra289",     name: "Regra 289",     tipo: "289" },
  { id: "regra326",     name: "Regra 326",     tipo: "326" },
];

interface CompanyFileManagerProps {
  company: {
    id: string;
    nome: string;
    codigoSistema: string;
  };
}

// formato dos arquivos processados que exibimos no front
interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  downloadUrl: string;
}

// Estados de upload
interface UploadStatus {
  isUploading: boolean;
  progress: number;
  currentFile: string;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

export function CompanyFileManager({ company }: CompanyFileManagerProps) {
  const [files, setFiles] = React.useState<Record<string, ProcessedFile[]>>({
    recebimentos: [],
    pagamentos: [],
    regra289: [],
    regra326: [],
  });
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<Record<string, UploadStatus>>({
    recebimentos: { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
    pagamentos: { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
    regra289: { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
    regra326: { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
  });

  // Função para simular progresso durante o upload
  const simulateProgress = (categoryId: string, fileName: string) => {
    setUploadStatus(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        isUploading: true,
        progress: 0,
        currentFile: fileName,
        status: 'uploading',
        message: 'Enviando arquivo...'
      }
    }));

    // Simula progresso de upload (0-70%)
    const uploadInterval = setInterval(() => {
      setUploadStatus(prev => {
        const currentProgress = prev[categoryId].progress;
        if (currentProgress >= 70) {
          clearInterval(uploadInterval);
          // Muda para status de processamento
          return {
            ...prev,
            [categoryId]: {
              ...prev[categoryId],
              progress: 70,
              status: 'processing',
              message: 'Processando arquivo...'
            }
          };
        }
        return {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            progress: currentProgress + Math.random() * 10
          }
        };
      });
    }, 200);

    return uploadInterval;
  };

  // Função para finalizar o progresso
  const finishProgress = (categoryId: string, success: boolean, message: string) => {
    setUploadStatus(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        progress: 100,
        status: success ? 'success' : 'error',
        message: message,
        isUploading: false
      }
    }));

    // Reset após 3 segundos
    setTimeout(() => {
      setUploadStatus(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          isUploading: false,
          progress: 0,
          currentFile: '',
          status: 'idle',
          message: ''
        }
      }));
    }, 3000);
  };
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpa o objeto URL para evitar vazamentos de memória
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', filename, error);
    }
  };

  // upload unificado ou regra específica (289/326)
  const handleFileUpload = async (categoryId: string, selected: File[]) => {
    if (uploadStatus[categoryId].isUploading) return;

    const categoria = fileCategories.find((c) => c.id === categoryId)!;
    const fileName = selected.length > 0 ? selected[0].name : 'arquivos';
    
    // Inicia simulação de progresso
    simulateProgress(categoryId, fileName);

    const fd = new FormData();
    if (categoria.tipo === "unificado" && selected.length > 0) {
      fd.append("file", selected[0]);
    } else {
      selected.forEach((f) => fd.append("files", f));
    }
    fd.append("codigoSistema", company.codigoSistema);

    try {
      let resp: UploadResponse;
      if (categoria.tipo === "unificado") {
        resp = await uploadUnificado(fd);
      } else {
        resp = await uploadRegra(categoria.tipo as "289" | "326", fd);
      }

      // mapeia processedFiles -> nosso ProcessedFile
      const novasEntradas = Object.entries(resp.processedFiles).map(
        ([key, supabasePath]) => {
          const pathStr = supabasePath as string;
          const filename = pathStr.split("/").pop()!;
          return {
            id: key,
            name: filename,
            size: 0,
            downloadUrl: getDownloadUrl(company.codigoSistema, filename),
            uploadDate: new Date().toISOString(),
          } as ProcessedFile;
        }
      );

      setFiles((prev) => ({
        ...prev,
        [categoryId]: [...prev[categoryId], ...novasEntradas],
      }));

      finishProgress(categoryId, true, 'Upload concluído com sucesso!');
    } catch (err: any) {
      console.error("Erro fazendo upload:", err);
      finishProgress(categoryId, false, 'Erro no upload: ' + (err.message ?? err));
    }
  };

  // remove da lista (não remove do bucket!)
  const handleFileDelete = (categoryId: string, fileId: string) => {
    setFiles((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((f) => f.id !== fileId),
    }));
  };

  // baixa todos os arquivos daquele category
  const handleDownloadAll = async (categoryId: string) => {
    if (files[categoryId].length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // Cria um pequeno delay entre downloads para evitar problemas
      for (let i = 0; i < files[categoryId].length; i++) {
        const file = files[categoryId][i];
        await downloadFile(file.downloadUrl, file.name);
        
        // Adiciona um pequeno delay entre downloads (opcional)
        if (i < files[categoryId].length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Erro no download em lote:', error);
      alert('Erro ao baixar alguns arquivos. Verifique sua conexão e tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

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
          <TabsContent
            key={category.id}
            value={category.id}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload Section */}
              <div className="futuristic-card glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ArrowUpFromLine className="mr-2 h-5 w-5 text-primary" />
                    Upload de {category.name}
                  </CardTitle>
                  <CardDescription>
                    Envie um ou mais arquivos de{" "}
                    {category.name.toLowerCase()} para {company.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    onFilesSelected={(files) =>
                      handleFileUpload(category.id, files)
                    }
                    multiple={true}
                  />
                  
                  {/* Barra de Progresso */}
                  {uploadStatus[category.id].isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {uploadStatus[category.id].currentFile}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(uploadStatus[category.id].progress)}%
                        </span>
                      </div>
                      <Progress 
                        value={uploadStatus[category.id].progress} 
                        className="w-full"
                      />
                      <div className="flex items-center space-x-2 text-sm">
                        {uploadStatus[category.id].status === 'uploading' && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {uploadStatus[category.id].status === 'processing' && (
                          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        )}
                        {uploadStatus[category.id].status === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {uploadStatus[category.id].status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`
                          ${uploadStatus[category.id].status === 'success' ? 'text-green-600' : ''}
                          ${uploadStatus[category.id].status === 'error' ? 'text-red-600' : ''}
                          ${uploadStatus[category.id].status === 'uploading' ? 'text-blue-600' : ''}
                          ${uploadStatus[category.id].status === 'processing' ? 'text-orange-600' : ''}
                        `}>
                          {uploadStatus[category.id].message}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Formatos: PDF, XLS, XLSX, CSV
                  </p>
                </CardFooter>
              </div>

              {/* Download Section */}
              <div className="futuristic-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ArrowDownToLine className="mr-2 h-5 w-5 text-secondary" />
                    Arquivos de {category.name}
                  </CardTitle>
                  <CardDescription>
                    Baixe cada regra separadamente ou todos de uma vez
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileList
                    files={files[category.id]}
                    onDelete={(id) => handleFileDelete(category.id, id)}
                  />
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {files[category.id].length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadAll(category.id)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? 'Baixando...' : 'Baixar Todos'}
                    </Button>
                  )}
                </CardFooter>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}