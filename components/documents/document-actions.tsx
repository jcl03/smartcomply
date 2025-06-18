"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderPlus, 
  Upload, 
  X, 
  Loader2,
  File,
  CheckCircle,
  Link,
  FileText,
  ClipboardList
} from "lucide-react";

interface DocumentActionsProps {
  onFolderCreated?: () => void;
  onDocumentUploaded?: () => void;
}

export function DocumentActions({ onFolderCreated, onDocumentUploaded }: DocumentActionsProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [linkFolder, setLinkFolder] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [availableAudits, setAvailableAudits] = useState<any[]>([]);
  const [availableChecklists, setAvailableChecklists] = useState<any[]>([]);
  const { toast } = useToast();
  const supabase = createClient();
  // Load existing folders when upload dialog opens
  const loadFolders = async () => {
    const { data, error } = await supabase
      .from('cert')
      .select('folder')
      .not('folder', 'is', null);
    
    if (!error && data) {
      const uniqueFolders = Array.from(new Set(data.map(f => f.folder)));
      setFolders(uniqueFolders);
    }
  };

  // Load completed audits that aren't already linked
  const loadAvailableAudits = async () => {
    const { data, error } = await supabase
      .from('audits')
      .select('id, name, status, created_at')
      .eq('status', 'completed')
      .not('id', 'in', `(SELECT DISTINCT audit FROM cert WHERE audit IS NOT NULL)`);
    
    if (!error && data) {
      setAvailableAudits(data);
    }
  };

  // Load completed checklist responses that aren't already linked
  const loadAvailableChecklists = async () => {
    const { data, error } = await supabase
      .from('checklist_responses')
      .select(`
        id, 
        checklist_id,
        user_id,
        status,
        created_at,
        checklists!inner(name)
      `)
      .eq('status', 'completed')
      .not('id', 'in', `(SELECT DISTINCT checklist FROM cert WHERE checklist IS NOT NULL)`);
    
    if (!error && data) {
      setAvailableChecklists(data);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFolder(true);
    try {      // Create a placeholder entry to establish the folder with creation date
      const { error } = await supabase
        .from('cert')
        .insert({
          folder: folderName.trim(),
          link: { 
            type: 'folder_placeholder',
            createdAt: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Folder "${folderName}" created successfully`,
      });

      setFolderName("");
      setShowCreateFolder(false);
      onFolderCreated?.();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });    } finally {
      setIsCreatingFolder(false);
    }
  };
  const handleLinkItems = async () => {
    if (!linkFolder) {
      toast({
        title: "Error",
        description: "Please select a folder",
        variant: "destructive",
      });
      return;
    }

    if (selectedAudits.length === 0 && selectedChecklists.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one audit or checklist to link",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    try {
      // Update selected audits to reference the folder
      if (selectedAudits.length > 0) {
        const { error: auditError } = await supabase
          .from('audit')
          .update({ folder: linkFolder })
          .in('id', selectedAudits);
        
        if (auditError) throw auditError;
      }

      // Update selected checklist responses to reference the folder
      if (selectedChecklists.length > 0) {
        const { error: checklistError } = await supabase
          .from('checklist_responses')
          .update({ folder: linkFolder })
          .in('id', selectedChecklists);
        
        if (checklistError) throw checklistError;
      }

      toast({
        title: "Success",
        description: `${selectedAudits.length + selectedChecklists.length} item(s) linked to folder successfully`,
      });

      setSelectedAudits([]);
      setSelectedChecklists([]);
      setLinkFolder("");
      setShowLinkDialog(false);
      onDocumentUploaded?.();
    } catch (error) {
      console.error('Error linking items:', error);
      toast({
        title: "Error",
        description: "Failed to link items to folder",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFolder) {
      toast({
        title: "Error", 
        description: "Please select a folder",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${selectedFolder}/${fileName}`;

        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cert')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('cert')
          .getPublicUrl(filePath);

        // Insert record into cert table
        const { error: insertError } = await supabase
          .from('cert')
          .insert({
            folder: selectedFolder,
            link: {
              fileName: file.name,
              filePath: filePath,
              fileSize: file.size,
              fileType: file.type,
              publicUrl: publicUrl,
              uploadedAt: new Date().toISOString()
            }
          });

        if (insertError) throw insertError;

        return { fileName: file.name, success: true };
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;

      toast({
        title: "Success",
        description: `${successCount} file(s) uploaded successfully`,
      });

      setSelectedFiles(null);
      setSelectedFolder("");
      setShowUploadDialog(false);
      onDocumentUploaded?.();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  const openUploadDialog = () => {
    loadFolders();
    setShowUploadDialog(true);
  };

  const openLinkDialog = () => {
    loadFolders();
    loadAvailableAudits();
    loadAvailableChecklists();
    setShowLinkDialog(true);
  };

  return (
    <>      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => setShowCreateFolder(true)}
          className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button 
          onClick={openUploadDialog}
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
        <Button 
          onClick={openLinkDialog}
          variant="outline" 
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          <Link className="h-4 w-4 mr-2" />
          Link Audits/Checklists
        </Button>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  Create New Folder
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCreateFolder(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateFolder(false)}
                  disabled={isCreatingFolder}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFolder}
                  disabled={isCreatingFolder}
                >
                  {isCreatingFolder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Folder
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Documents Modal */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Documents
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="folderSelect">Select Folder</Label>
                <select
                  id="folderSelect"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a folder...</option>
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="fileInput">Select Files</Label>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files:</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                        <File className="h-4 w-4" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadDialog(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFileUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </CardContent>          </Card>
        </div>
      )}

      {/* Link Audits/Checklists Modal */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Link Audits & Checklists
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLinkDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div>
                <Label htmlFor="linkFolderSelect">Select Folder</Label>
                <select
                  id="linkFolderSelect"
                  value={linkFolder}
                  onChange={(e) => setLinkFolder(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a folder...</option>
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Audits */}
              {availableAudits.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Available Completed Audits
                  </Label>
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                    {availableAudits.map((audit) => (
                      <div key={audit.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`audit-${audit.id}`}
                          checked={selectedAudits.includes(audit.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAudits(prev => [...prev, audit.id]);
                            } else {
                              setSelectedAudits(prev => prev.filter(id => id !== audit.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`audit-${audit.id}`} className="text-sm flex-1">
                          <span className="font-medium">{audit.name}</span>
                          <span className="text-gray-500 ml-2">
                            ({new Date(audit.created_at).toLocaleDateString()})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Checklists */}
              {availableChecklists.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Available Completed Checklists
                  </Label>
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                    {availableChecklists.map((checklist) => (
                      <div key={checklist.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`checklist-${checklist.id}`}
                          checked={selectedChecklists.includes(checklist.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedChecklists(prev => [...prev, checklist.id]);
                            } else {
                              setSelectedChecklists(prev => prev.filter(id => id !== checklist.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`checklist-${checklist.id}`} className="text-sm flex-1">
                          <span className="font-medium">{checklist.checklists?.name}</span>
                          <span className="text-gray-500 ml-2">
                            ({new Date(checklist.created_at).toLocaleDateString()})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableAudits.length === 0 && availableChecklists.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No completed audits or checklists available to link.</p>
                  <p className="text-sm">Complete some audits or checklists first.</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLinkDialog(false)}
                  disabled={isLinking}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLinkItems}
                  disabled={isLinking || (selectedAudits.length === 0 && selectedChecklists.length === 0)}
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Link Items ({selectedAudits.length + selectedChecklists.length})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
