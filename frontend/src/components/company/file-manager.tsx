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
import { useDashboard } from "@/contexts/dashboard-context";

interface CompanyFileManagerProps {
  company: {
    id: string;
    nome: string;
    codigoSistema: string;
  };
}

interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  downloadUrl: string;
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  currentFile: string;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

export function CompanyFileManager({ company }: CompanyFileManagerProps) {
  const { triggerStatsRefresh } = useDashboard();

  const fileCategories = company.codigoSistema === '333'
    ? [{ id: "pagamentos", name: "Salários e Tarifas", tipo: "unificado" }]
    : [
        { id: "recebimentos", name: "Recebimentos", tipo: "unificado" },
        { id: "pagamentos",   name: "Pagamentos",   tipo: "unificado" },
        { id: "regra289",     name: "Regra 289",     tipo: "289" },
        { id: "regra326",     name: "Regra 326",     tipo: "326" },
      ];

  const [files, setFiles] = React.useState<Record<string, ProcessedFile[]>>({
    recebimentos: [],
    pagamentos: [],
    regra289: [],
    regra326: [],
  });
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<Record<string, UploadStatus>>({
    recebimentos: { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
    pagamentos:   { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
    regra289:     { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
    regra326:     { isUploading: false, progress: 0, currentFile: '', status: 'idle', message: '' },
  });

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

    const uploadInterval = setInterval(() => {
      setUploadStatus(prev => {
        const currentProgress = prev[categoryId].progress;
        if (currentProgress >= 70) {
          clearInterval(uploadInterval);
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

  const finishProgress = (categoryId: string, success: boolean, message: string) => {
    setUploadStatus(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        progress: 100,
        status: success ? 'success' : 'error',
        message,
        isUploading: false
      }
    }));

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
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', filename, error);
    }
  };

  // 3️⃣ Modificamos handleFileUpload para chamar triggerStatsRefresh após sucesso
  const handleFileUpload = async (categoryId: string, selected: File[]) => {
    if (uploadStatus[categoryId].isUploading) return;
  
    const categoria = fileCategories.find(c => c.id === categoryId)!;
    const fileName = selected.length ? selected[0].name : 'arquivos';
    const uploadInterval = simulateProgress(categoryId, fileName);
  
    const fd = new FormData();
    if (categoria.tipo === 'unificado' && selected.length > 1) {
      selected.forEach(f => fd.append('files', f)); // ✅ para METRO
    } else if (categoria.tipo === 'unificado') {
      fd.append('file', selected[0]); // ✅ para demais empresas
    } else {
      selected.forEach(f => fd.append('files', f)); // para 289/326
    }
    fd.append('codigoSistema', company.codigoSistema);
  
    try {
      let resp: UploadResponse;
  
      if (company.codigoSistema === '333') {
        // 🚀 Chamada especial para METRO
        resp = await uploadRegra('metro', fd);
      } else if (categoria.tipo === 'unificado') {
        resp = await uploadUnificado(fd);
      } else {
        resp = await uploadRegra(categoria.tipo as '289' | '326', fd);
      }

      // Constrói as novas entradas para a lista de arquivos
      const novasEntradas = Object.entries(resp.processedFiles).map(
        ([key, info]) => {
          let filePath: string;
          let fileSize = 0;
          if (info && typeof info === 'object' && 'path' in info && typeof info.path === 'string') {
            filePath = info.path;
            fileSize = (info as any).size ?? 0;
          } else if (typeof info === 'string') {
            filePath = info;
          } else {
            filePath = key;
          }
          const filename = filePath.split('/').pop()!;
          return {
            id: key,
            name: filename,
            size: fileSize,
            downloadUrl: getDownloadUrl(company.codigoSistema, filename),
            uploadDate: new Date().toISOString(),
          } as ProcessedFile;
        }
      );

      // Atualiza a lista de arquivos no estado
      setFiles(prev => ({
        ...prev,
        [categoryId]: [...prev[categoryId], ...novasEntradas],
      }));

      // ✅ DISPARA o refresh das estatísticas globais
      triggerStatsRefresh();

      finishProgress(categoryId, true, 'Upload concluído com sucesso!');
    } catch (err: any) {
      console.error('Erro fazendo upload:', err);
      finishProgress(categoryId, false, 'Erro no upload: ' + (err.message ?? err));
    } finally {
      clearInterval(uploadInterval);
    }
  };

  const handleFileDelete = (categoryId: string, fileId: string) => {
    setFiles(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(f => f.id !== fileId),
    }));
  };

  const handleDownloadAll = async (categoryId: string) => {
    if (!files[categoryId].length) return;
    setIsDownloading(true);
    try {
      for (let i = 0; i < files[categoryId].length; i++) {
        const file = files[categoryId][i];
        await downloadFile(file.downloadUrl, file.name);
        if (i < files[categoryId].length - 1) await new Promise(res => setTimeout(res, 500));
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
          {fileCategories.map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-glow transition-all duration-300"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {fileCategories.map(category => (
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
                    Envie um ou mais arquivos de {category.name.toLowerCase()} para {company.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader onFilesSelected={files => handleFileUpload(category.id, files)} multiple />
                  {uploadStatus[category.id].isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{uploadStatus[category.id].currentFile}</span>
                        <span className="text-muted-foreground">{Math.round(uploadStatus[category.id].progress)}%</span>
                      </div>
                      <Progress value={uploadStatus[category.id].progress} className="w-full" />
                      <div className="flex items-center space-x-2 text-sm">
                        {uploadStatus[category.id].status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        {uploadStatus[category.id].status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
                        {uploadStatus[category.id].status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {uploadStatus[category.id].status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <span className={`${
                          uploadStatus[category.id].status === 'success' ? 'text-green-600' : ''}
                          ${uploadStatus[category.id].status === 'error' ? 'text-red-600' : ''}
                          ${uploadStatus[category.id].status === 'uploading' ? 'text-blue-600' : ''}
                          ${uploadStatus[category.id].status === 'processing' ? 'text-orange-600' : ''}
                        `}>{uploadStatus[category.id].message}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Formatos: PDF, XLS, XLSX, CSV</p>
                </CardFooter>
              </div>

              {/* Download Section */}
              <div className="futuristic-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ArrowDownToLine className="mr-2 h-5 w-5 text-secondary" />
                    Arquivos de {category.name}
                  </CardTitle>
                  <CardDescription>Baixe cada regra separadamente ou todos de uma vez</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileList files={files[category.id]} onDelete={id => handleFileDelete(category.id, id)} />
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {!!files[category.id].length && (
                    <Button variant="outline" onClick={() => handleDownloadAll(category.id)} disabled={isDownloading}>
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