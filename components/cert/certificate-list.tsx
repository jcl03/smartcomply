"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  FolderOpen, 
  ExternalLink, 
  Download,
  Eye,
  AlertTriangle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Certificate {
  id: number;
  link: any;
  created_at: string;
  folder: string | null;
  expiration: string | null;
  upload_date: string | null;
  audit_id: number | null;
  checklist_responses_id: number | null;
}

interface CertificateListProps {
  certificates: Certificate[];
  canManage: boolean;
}

export function CertificateList({ certificates, canManage }: CertificateListProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const getExpirationStatus = (expirationDate: string | null) => {
    if (!expirationDate) return { status: "unknown", color: "gray" };
    
    const expiration = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: "expired", color: "red", message: "Expired" };
    } else if (daysUntilExpiration <= 30) {
      return { status: "expiring", color: "orange", message: `Expires in ${daysUntilExpiration} days` };
    } else {
      return { status: "valid", color: "green", message: `Expires in ${daysUntilExpiration} days` };
    }
  };

  const getFileInfo = (link: any) => {
    if (!link) return null;
    
    // Handle different link formats
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
    }
  };

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-600 mb-6">
              No certificates match your current filters.
            </p>
            {canManage && (
              <Link href="/protected/cert/add">
                <Button>
                  Add Your First Certificate
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => {
        const fileInfo = getFileInfo(cert.link);
        const expirationStatus = getExpirationStatus(cert.expiration);
        const isExpanded = expandedCard === cert.id;
        
        return (
          <Card key={cert.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {cert.folder || "Untitled Certificate"}
                    
                    {/* Expiration Status Badge */}
                    {cert.expiration && (
                      <Badge 
                        variant={expirationStatus.color === "red" ? "destructive" : 
                                expirationStatus.color === "orange" ? "secondary" : "default"}
                        className="flex items-center gap-1"
                      >
                        {expirationStatus.color === "red" && <AlertTriangle className="h-3 w-3" />}
                        {expirationStatus.color === "orange" && <Clock className="h-3 w-3" />}
                        {expirationStatus.message}
                      </Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    {cert.upload_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Uploaded: {format(new Date(cert.upload_date), "MMM d, yyyy")}
                      </div>
                    )}
                    
                    {cert.folder && (
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4" />
                        {cert.folder}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedCard(isExpanded ? null : cert.id)}
                  >
                    <Eye className="h-4 w-4" />
                    {isExpanded ? "Hide" : "View"} Details
                  </Button>
                  
                  {fileInfo?.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(fileInfo.url, fileInfo.name || `certificate-${cert.id}`)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Certificate Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Certificate Details</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Certificate ID:</span>
                          <span className="ml-2 text-gray-600">#{cert.id}</span>
                        </div>
                        
                        {cert.expiration && (
                          <div>
                            <span className="font-medium text-gray-700">Expiration Date:</span>
                            <span className="ml-2 text-gray-600">
                              {format(new Date(cert.expiration), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <span className="ml-2 text-gray-600">
                            {format(new Date(cert.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        
                        {fileInfo && (
                          <div>
                            <span className="font-medium text-gray-700">File Name:</span>
                            <span className="ml-2 text-gray-600">{fileInfo.name || "Certificate File"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Related Records */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Related Records</h4>
                      
                      <div className="space-y-2">
                        {cert.audit_id && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-blue-900">
                                  Audit #{cert.audit_id}
                                </p>
                                <p className="text-sm text-blue-700">
                                  Linked to audit record
                                </p>
                              </div>
                              <Link href={`/protected/Audit/${cert.audit_id}`}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                  View Audit
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                        
                        {cert.checklist_responses_id && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-green-900">
                                  Checklist Response #{cert.checklist_responses_id}
                                </p>
                                <p className="text-sm text-green-700">
                                  Linked to checklist response
                                </p>
                              </div>
                              <Link href={`/protected/checklist-responses/${cert.checklist_responses_id}`}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                  View Response
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                        
                        {!cert.audit_id && !cert.checklist_responses_id && (
                          <p className="text-sm text-gray-500 italic">
                            No related audit or checklist response records.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
