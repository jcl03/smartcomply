"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface FileDownloadProps {
  filePath: string;
  fileName: string;
  publicUrl?: string;
}

export function FileDownload({ filePath, fileName, publicUrl }: FileDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      let downloadUrl = publicUrl;
      
      if (!downloadUrl) {
        // Get the public URL if not provided
        const { data } = supabase.storage
          .from('cert')
          .getPublicUrl(filePath);
        downloadUrl = data.publicUrl;
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Downloaded ${fileName}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDownload}
      disabled={isDownloading}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
