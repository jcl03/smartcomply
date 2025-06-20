"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  FolderOpen, 
  Download,
  Edit,
  Save,
  X,
  ExternalLink,
  AlertTriangle,
  Clock,
  CheckCircle,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { updateCertificate, deleteCertificate } from "@/app/protected/cert/actions";

interface CertificateData {
  id: number;
  link: any;
  created_at: string;
  folder: string | null;
  expiration: string | null;
  upload_date: string | null;
  audit_id: number | null;
  checklist_responses_id: number | null;
  audit?: {
    id: number;
    title: string | null;
    status: string | null;
    created_at: string;
    marks: number | null;
    percentage: number | null;
    result: string | null;
  } | null;
  checklist_responses?: {
    id: number;
    title: string | null;
    status: string | null;
    created_at: string;
    result: string | null;
  } | null;
}

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

interface CertificateDetailViewProps {
  certificate: CertificateData;
  canManage: boolean;
  audits: Audit[];
  checklistResponses: ChecklistResponse[];
}

export function CertificateDetailView({ 
  certificate, 
  canManage, 
  audits, 
  checklistResponses 
}: CertificateDetailViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  const [editData, setEditData] = useState({
    folder: certificate.folder || "",
    expiration: certificate.expiration || "",
    audit_id: certificate.audit_id?.toString() || "",
    checklist_responses_id: certificate.checklist_responses_id?.toString() || "",
  });

  const getExpirationStatus = (expirationDate: string | null) => {
    if (!expirationDate) return { status: "unknown", color: "gray", icon: null };
    
    const expiration = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { 
        status: "expired", 
        color: "red", 
        message: "Expired", 
        icon: <AlertTriangle className="h-4 w-4" />
      };
    } else if (daysUntilExpiration <= 30) {
      return { 
        status: "expiring", 
        color: "orange", 
        message: `Expires in ${daysUntilExpiration} days`,
        icon: <Clock className="h-4 w-4" />
      };
    } else {
      return { 
        status: "valid", 
        color: "green", 
        message: `Expires in ${daysUntilExpiration} days`,
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
  };

  const getFileInfo = (link: any) => {
    if (!link) return null;
    
    if (typeof link === 'string') {
      try {
        const parsed = JSON.parse(link);
        return parsed;
      } catch {
        return { url: link, name: "Certificate File" };
      }
    }
    
    if (Array.isArray(link)) {
      return link[0] || null;
    }
    
    return link;
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
      const formData = new FormData();
    formData.append("id", certificate.id.toString());
    formData.append("folder", editData.folder);
    formData.append("expiration", editData.expiration);
    formData.append("audit_id", editData.audit_id);
    formData.append("checklist_responses_id", editData.checklist_responses_id);

    try {
      const result = await updateCertificate(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Certificate updated successfully!",
      });
      
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update certificate.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await deleteCertificate(certificate.id);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Certificate deleted successfully!",
      });
      
      router.push("/protected/cert");
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete certificate.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fileInfo = getFileInfo(certificate.link);
  const expirationStatus = getExpirationStatus(certificate.expiration);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/protected/cert">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Certificates
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificate Details</h1>
            <p className="text-gray-600 mt-1">#{certificate.id}</p>
          </div>
        </div>
        
        {canManage && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (              <>
                <div className="space-y-2">
                  <Label htmlFor="folder">Folder Name</Label>
                  <Input
                    id="folder"
                    value={editData.folder}
                    onChange={(e) => setEditData(prev => ({ ...prev, folder: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={editData.expiration}
                    onChange={(e) => setEditData(prev => ({ ...prev, expiration: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Upload Date
                  </Label>
                  <Input
                    type="date"
                    value={certificate.upload_date || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Upload date cannot be modified
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Folder:</span>
                  </div>
                  <span>{certificate.folder || "Uncategorized"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Upload Date:</span>
                  </div>
                  <span>
                    {certificate.upload_date ? 
                      format(new Date(certificate.upload_date), "MMM d, yyyy") : 
                      "Not specified"
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Expiration:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {certificate.expiration ? (
                      <>
                        <span>{format(new Date(certificate.expiration), "MMM d, yyyy")}</span>
                        <Badge 
                          variant={expirationStatus.color === "red" ? "destructive" : 
                                  expirationStatus.color === "orange" ? "secondary" : "default"}
                          className="flex items-center gap-1"
                        >
                          {expirationStatus.icon}
                          {expirationStatus.message}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-gray-500">No expiration date</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Created:</span>
                  </div>
                  <span>{format(new Date(certificate.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* File Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              File Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fileInfo ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">File Name:</span>
                  <span className="text-right">{fileInfo.name || "Certificate File"}</span>
                </div>
                
                {fileInfo.type && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">File Type:</span>
                    <span>{fileInfo.type}</span>
                  </div>
                )}
                
                {fileInfo.size && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">File Size:</span>
                    <span>{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    onClick={() => downloadFile(fileInfo.url, fileInfo.name || `certificate-${certificate.id}`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No file information available</p>
            )}
          </CardContent>
        </Card>

        {/* Related Records */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Related Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audit_id">Related Audit</Label>
                  <select
                    id="audit_id"
                    value={editData.audit_id}
                    onChange={(e) => setEditData(prev => ({ ...prev, audit_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an audit...</option>
                    {audits.map((audit) => (
                      <option key={audit.id} value={audit.id.toString()}>
                        {audit.title || `Audit #${audit.id}`} ({audit.status})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="checklist_responses_id">Related Checklist Response</Label>
                  <select
                    id="checklist_responses_id"
                    value={editData.checklist_responses_id}
                    onChange={(e) => setEditData(prev => ({ ...prev, checklist_responses_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a response...</option>
                    {checklistResponses.map((response) => (
                      <option key={response.id} value={response.id.toString()}>
                        {response.title || `Response #${response.id}`} ({response.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificate.audit ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900">Related Audit</h4>
                      <Link href={`/protected/Audit/${certificate.audit.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                          View Audit
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {certificate.audit.title || `Audit #${certificate.audit.id}`}</p>
                      <p><strong>Status:</strong> {certificate.audit.status}</p>
                      <p><strong>Created:</strong> {format(new Date(certificate.audit.created_at), "MMM d, yyyy")}</p>
                      {certificate.audit.percentage && (
                        <p><strong>Score:</strong> {certificate.audit.percentage}%</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No related audit</p>
                  </div>
                )}
                
                {certificate.checklist_responses ? (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-green-900">Related Checklist Response</h4>
                      <Link href={`/protected/checklist-responses/${certificate.checklist_responses.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                          View Response
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {certificate.checklist_responses.title || `Response #${certificate.checklist_responses.id}`}</p>
                      <p><strong>Status:</strong> {certificate.checklist_responses.status}</p>
                      <p><strong>Created:</strong> {format(new Date(certificate.checklist_responses.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No related checklist response</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
