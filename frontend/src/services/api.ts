import axios from "axios";

export interface DashboardStats {
  totalUploads: number;
  totalDownloads: number;
  empresasAtivas: number;
  ultimoUpload: {
    processedAt: string;
    empresa: string;
    filename: string;
  } | null;
}

// ——— Dashboard Stats ———
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>("/dashboard/stats");
  return response.data;
};

// Monta a baseURL sem quebrar no SSR
let baseURL = "http://localhost:3000";
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("electron")) {
    baseURL = window.location.origin.replace(/^file:\/\//, "http://localhost:3000");
  }
}

export const api = axios.create({ baseURL });

export interface UploadResponse {
  message: string;
  processedFiles: Record<string, {
    path: string;
    size: number;
  }>;
}

// ——— Empresas ———
export const cadastrarEmpresa = (dados: {
  cnpj: string;
  nome: string;
  apelido: string;
  codigoSistema: string;
}) => api.post("/empresas", dados);

export const listarEmpresas = () => api.get("/empresas");

// ——— Upload “Unificado” (Recebimentos/Pagamentos) ———
export async function uploadUnificado(
  formData: FormData
): Promise<UploadResponse> {
  const response = await api.post<UploadResponse>("/process/upload", formData);
  return response.data;
}

// ——— Upload de Regra 289 / 326 ———
export async function uploadRegra(
  tipo: "289" | "326",
  formData: FormData
): Promise<UploadResponse> {
  const response = await api.post<UploadResponse>(
    `/process/upload${tipo}`,
    formData
  );
  return response.data;
}

// ——— Download ———
export function getDownloadUrl(
  codigoSistema: string,
  filename: string
): string {
  return `${baseURL}/process/download/${codigoSistema}/${filename}`;
}
