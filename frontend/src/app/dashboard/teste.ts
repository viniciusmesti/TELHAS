"use-client"

import * as React from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/company/file-uploader";
import { FileList } from "@/components/company/file-list";

const fileCategories = [
    { id: "recebimentos", name: "Recebimentos" },
    { id: "pagamentos", name: "Pagamentos" },
    { id: "regra289", name: "Regra 289" },
    { id: "regra326", name: "Regra 326" },
]

interface CompanyFileManagerProps {
    company: string;
}

export function CompanyFileManager({ company }: CompanyFileManagerProps) {
    const [files, setFiles] = React.useState<Record<string, any[]>>({
        recebimentos: [],
        pagamentos: [],
        regra289: [],
        regra326: [],
    })

    const handleFileUpload = (category: string, newFiles: File[]) => {
        const fileObjects = newFiles.map((file) => ({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
        }))

        setFiles((prev) => ({
            ... prev,
            [category]: [...prev[category], ...fileObjects],
        }))
    }

    const handleFileDelete = (category: string, fileId: string) => {
        setFiles((prev) => ({
            ...prev,
            [category]: prev[category].filter((file) => file.id !== fileId),
        }))
    }

    return (
        <div className="space-y-6">
        
        </div>
    )
}