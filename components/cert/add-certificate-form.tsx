"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Calendar, FolderOpen, Link2, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Audit {
  id: number;
  title: string | null;
  status: string | null;
}

interface ChecklistResponse {
  id: number;
  title: string | null;
  status: string | null;
}

interface AddCertificateFormProps {
  audits: Audit[];
  checklistResponses: ChecklistResponse[];
}

export function AddCertificateForm({ audits, checklistResponses }: AddCertificateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);  const [formData, setFormData] = useState({
    folder: "",
    expiration: "",
    upload_date: new Date().toISOString().split('T')[0], // Always today's date
    audit_id: "",
    checklist_responses_id: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (common certificate formats)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, image, or document file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `cert_${Date.now()}.${fileExt}`;
    const filePath = `${formData.folder || 'uncategorized'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("cert")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("cert")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please select a certificate file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.folder.trim()) {
      toast({
        title: "Folder required",
        description: "Please enter a folder name for organization.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload file to Supabase storage
      const fileUrl = await uploadFile(selectedFile);
        // Prepare certificate data
      const certData = {
        link: JSON.stringify({
          url: fileUrl,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size
        }),
        folder: formData.folder.trim(),
        expiration: formData.expiration || null,
        upload_date: new Date().toISOString().split('T')[0], // Always use today's date
        audit_id: formData.audit_id ? parseInt(formData.audit_id) : null,
        checklist_responses_id: formData.checklist_responses_id ? parseInt(formData.checklist_responses_id) : null,
      };

      // Insert certificate record
      const { error: insertError } = await supabase
        .from('cert')
        .insert([certData]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Certificate uploaded successfully!",
      });

      router.push("/protected/cert");
    } catch (error: any) {
      console.error("Error uploading certificate:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/protected/cert">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Certificates
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Certificate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Certificate File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Label
                  htmlFor="file"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Choose certificate file"}
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, Image, or Document (max 10MB)
                  </span>
                </Label>
              </div>
            </div>

            {/* Folder Name */}
            <div className="space-y-2">
              <Label htmlFor="folder" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Folder Name *
              </Label>
              <Input
                id="folder"
                type="text"
                value={formData.folder}
                onChange={(e) => handleInputChange("folder", e.target.value)}
                placeholder="e.g., ISO 27001, GDPR Compliance, Security Audits"
                required
              />
              <p className="text-xs text-gray-500">
                Used for organization and searching
              </p>
            </div>            {/* Upload Date - Display Only */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upload Date
              </Label>
              <Input
                type="date"
                value={formData.upload_date}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Automatically set to today's date
              </p>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiration" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expiration Date (Optional)
              </Label>
              <Input
                id="expiration"
                type="date"
                value={formData.expiration}
                onChange={(e) => handleInputChange("expiration", e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave blank if certificate doesn't expire
              </p>
            </div>

            {/* Related Audit */}
            <div className="space-y-2">
              <Label htmlFor="audit_id" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Related Audit (Optional)
              </Label>
              <select
                id="audit_id"
                value={formData.audit_id}
                onChange={(e) => handleInputChange("audit_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an audit...</option>
                {audits.map((audit) => (
                  <option key={audit.id} value={audit.id.toString()}>
                    {audit.title || `Audit #${audit.id}`} ({audit.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Related Checklist Response */}
            <div className="space-y-2">
              <Label htmlFor="checklist_responses_id" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Related Checklist Response (Optional)
              </Label>
              <select
                id="checklist_responses_id"
                value={formData.checklist_responses_id}
                onChange={(e) => handleInputChange("checklist_responses_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a checklist response...</option>
                {checklistResponses.map((response) => (
                  <option key={response.id} value={response.id.toString()}>
                    {response.title || `Response #${response.id}`} ({response.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/protected/cert">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Certificate
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
