"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DocumentActions } from "@/components/documents/document-actions";
import { FileDownload } from "@/components/documents/file-download";
import { 
  FileText,
  Calendar,
  Folder,
  Search,
  Filter,
  Shield,
  File,
  Image,
  FileSpreadsheet,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Document {
  id: string;
  audit?: string;
  checklist?: string;
  link: any;
  created_at: string;
  folder: string;
}

interface LinkedAudit {
  id: string;
  title: string;
  status: string;
  created_at: string;
  folder: string;
  type: 'audit';
}

interface LinkedChecklist {
  id: string;
  checklists: { name: string }[];
  status: string;
  created_at: string;
  folder: string;
  type: 'checklist';
}

type FolderItem = Document | LinkedAudit | LinkedChecklist;

export function DocumentsClientWrapper() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [linkedAudits, setLinkedAudits] = useState<LinkedAudit[]>([]);
  const [linkedChecklists, setLinkedChecklists] = useState<LinkedChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Load actual document uploads from cert table
      const { data: certData, error: certError } = await supabase
        .from('cert')
        .select(`
          id,
          audit,
          checklist,
          link,
          created_at,
          folder
        `)
        .order('created_at', { ascending: false });

      if (certError) {
        console.error("Error fetching documents:", certError);
      } else {
        // Filter out folder placeholders and keep only actual file uploads
        const actualDocuments = certData?.filter(doc => 
          doc.link && 
          typeof doc.link === 'object' && 
          doc.link.fileName && 
          doc.link.type !== 'folder_placeholder' &&
          doc.link.type !== 'folder_metadata'
        ) || [];
        setDocuments(actualDocuments);
      }

      // Load linked audits (completed audits with folder references)
      const { data: auditData, error: auditError } = await supabase
        .from('audit')
        .select('id, title, status, created_at, folder')
        .eq('status', 'completed')
        .not('folder', 'is', null);

      if (!auditError && auditData) {
        const auditsWithType = auditData.map(audit => ({ ...audit, type: 'audit' as const }));
        setLinkedAudits(auditsWithType);
      }

      // Load linked checklist responses (completed responses with folder references)
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklist_responses')
        .select('id, checklists(name), status, created_at, folder')
        .eq('status', 'completed')
        .not('folder', 'is', null);

      if (!checklistError && checklistData) {
        const checklistsWithType = checklistData.map(checklist => ({ ...checklist, type: 'checklist' as const }));
        setLinkedChecklists(checklistsWithType);
      }

    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);
  // Group all items by folder
  const allItems = [...documents, ...linkedAudits, ...linkedChecklists];
  const itemsByFolder = allItems.reduce((acc, item) => {
    const folderName = item.folder || 'Uncategorized';
    if (!acc[folderName]) {
      acc[folderName] = [];
    }
    acc[folderName].push(item);
    return acc;
  }, {} as Record<string, FolderItem[]>);
  // Add empty folders
  useEffect(() => {
    const loadEmptyFolders = async () => {
      const { data } = await supabase
        .from('cert')
        .select('folder')
        .not('folder', 'is', null);
      
      const uniqueFolders = data ? Array.from(new Set(data.map(f => f.folder))) : [];
      
      uniqueFolders.forEach(folder => {
        if (!itemsByFolder[folder]) {
          itemsByFolder[folder] = [];
        }
      });
    };
    
    loadEmptyFolders();
  }, [allItems]);
  const getFileIcon = (linkData: any) => {
    if (linkData?.type === 'audit_link') {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (linkData?.type === 'checklist_link') {
      return <FileSpreadsheet className="h-5 w-5 text-purple-500" />;
    }
    
    const fileName = linkData?.fileName;
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };  // Type guards
  const isDocument = (item: FolderItem): item is Document => {
    return 'link' in item;
  };

  const isLinkedAudit = (item: FolderItem): item is LinkedAudit => {
    return 'type' in item && item.type === 'audit';
  };

  const isLinkedChecklist = (item: FolderItem): item is LinkedChecklist => {
    return 'type' in item && item.type === 'checklist';
  };

  const filteredFolders = Object.entries(itemsByFolder).filter(([folderName, folderItems]) => {
    if (!searchTerm) return true;
    return folderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           folderItems.some((item: FolderItem) => {
             if (isLinkedAudit(item)) {
               return item.title?.toLowerCase().includes(searchTerm.toLowerCase());
             } else if (isLinkedChecklist(item)) {
               return item.checklists[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase());
             } else if (isDocument(item)) {
               const linkData = item.link ? (typeof item.link === 'string' ? JSON.parse(item.link) : item.link) : null;
               return linkData?.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
             }
             return false;
           });
  });

  const handleRefresh = () => {
    loadDocuments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-sky-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-3 rounded-xl shadow-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Storage</h1>
              <p className="text-slate-600">Manage certifications, audits, and compliance documents</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <DocumentActions 
            onFolderCreated={handleRefresh}
            onDocumentUploaded={handleRefresh}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{Object.keys(itemsByFolder).length}</p>
                <p className="text-sm text-slate-600">Total Folders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>                <p className="text-2xl font-bold text-slate-900">{allItems.length}</p>
                <p className="text-sm text-slate-600">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>                  <p className="text-2xl font-bold text-slate-900">
                    {linkedAudits.length + linkedChecklists.length}
                  </p>
                  <p className="text-sm text-slate-600">Linked Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>                  <p className="text-2xl font-bold text-slate-900">
                    {allItems.filter(item => {
                      const itemDate = new Date(item.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return itemDate >= weekAgo;
                    }).length}
                  </p>
                <p className="text-sm text-slate-600">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search documents and folders..." 
            className="pl-10 border-slate-200 focus:border-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-slate-200"
          onClick={handleRefresh}
        >
          <Filter className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Folders and Documents Grid */}
      <div className="space-y-6">
        {filteredFolders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No folders or documents found</h3>
              <p className="text-gray-600 mb-4">
                Create your first folder to organize documents and certifications.
              </p>
              <div className="flex justify-center">
                <DocumentActions 
                  onFolderCreated={handleRefresh}
                  onDocumentUploaded={handleRefresh}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredFolders.map(([folderName, folderItems]) => (
            <Card key={folderName} className="border-slate-200 bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">{folderName}</CardTitle>
                      <p className="text-sm text-slate-600">
                        {folderItems.length} item{folderItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
                {folderItems.length > 0 && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">                    {folderItems.map((item) => {
                      // Determine item title and details based on type
                      let itemTitle = '';
                      let itemSize = '';
                      let itemType = '';
                      let linkData = null;
                      
                      if (isLinkedAudit(item)) {
                        itemTitle = item.title || `Audit ${item.id}`;
                        itemSize = 'Audit Report';
                        itemType = 'audit';
                      } else if (isLinkedChecklist(item)) {
                        itemTitle = item.checklists[0]?.name || `Checklist ${item.id}`;
                        itemSize = 'Checklist Response';
                        itemType = 'checklist';
                      } else if (isDocument(item)) {
                        linkData = item.link ? (typeof item.link === 'string' ? JSON.parse(item.link) : item.link) : null;
                        itemTitle = linkData?.fileName || `Document ${item.id}`;
                        itemSize = linkData?.fileSize ? formatFileSize(linkData.fileSize) : 'Unknown size';
                        itemType = 'file';
                      }
                      
                      return (
                        <Card key={item.id} className="border-slate-100 hover:border-blue-200 transition-colors group">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {getFileIcon(linkData || { type: itemType })}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 truncate">
                                  {itemTitle}
                                </h4>
                                <p className="text-sm text-slate-500">
                                  {itemSize}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {linkData?.linkedAt 
                                    ? `Linked: ${new Date(linkData.linkedAt).toLocaleDateString()}`
                                    : `Created: ${new Date(item.created_at).toLocaleDateString()}`
                                  }
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {itemType === 'audit' && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      Audit Report
                                    </Badge>
                                  )}
                                  {itemType === 'checklist' && (
                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                      Checklist Response
                                    </Badge>
                                  )}
                                  {isDocument(item) && item.audit && itemType !== 'audit' && (
                                    <Badge variant="outline" className="text-xs">
                                      Audit #{item.audit}
                                    </Badge>
                                  )}
                                  {isDocument(item) && item.checklist && itemType !== 'checklist' && (
                                    <Badge variant="outline" className="text-xs">
                                      Checklist #{item.checklist}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {itemType === 'file' && linkData?.filePath && (
                                <FileDownload 
                                  filePath={linkData.filePath}
                                  fileName={linkData.fileName}
                                  publicUrl={linkData.publicUrl}
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
