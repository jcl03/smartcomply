"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpCircle, CheckSquare, Upload, AlertTriangle, FileText, X, Save, ArrowLeft, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import Link from "next/link";

interface Props {
  response: any;
  userProfile: any;
}

type ChecklistItem = {
  id: string;
  name: string;
  type: 'document' | 'yesno';
  autoFail?: boolean;
  sectionId?: string;
};

type ChecklistSection = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

type ChecklistSchema = {
  title: string;
  description: string;
  sections: ChecklistSection[];
};

export default function ChecklistEditForm({ response, userProfile }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<ChecklistSchema | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [tempFiles, setTempFiles] = useState<Record<string, File>>({});
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    // Set the schema from the response data
    if (response?.checklist?.checklist_schema) {
      setSchema(response.checklist.checklist_schema);
    }
    
    // Initialize form data with existing response data
    if (response?.response_data) {
      setFormData(response.response_data);
    }
  }, [response]);

  // Cleanup temporary file URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up temporary file URLs to prevent memory leaks
      Object.values(tempFiles).forEach(file => {
        if (file) {
          const url = URL.createObjectURL(file);
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [tempFiles]);

  // Calculate progress whenever form data or schema changes
  useEffect(() => {
    if (schema?.sections?.length) {
      setProgress(calculateProgress());
    }
  }, [formData, schema]);

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("checklist-document")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getTempFileUrl = (itemId: string) => {
    const file = tempFiles[itemId];
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleInputChange = (itemId: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file temporarily for preview
    setTempFiles((prev) => ({ ...prev, [itemId]: file }));
    
    // Create file metadata for form data (but don't upload yet)
    handleInputChange(itemId, {
      fileName: file.name,
      fileSize: file.size,
      isTemporary: true,
      lastModified: file.lastModified,
    });

    toast({
      title: "File Selected",
      description: `${file.name} ready for upload when checklist is saved`,
    });
  };

  const handleRemoveFile = (itemId: string) => {
    // Remove from temp files
    setTempFiles((prev) => {
      const newTempFiles = { ...prev };
      delete newTempFiles[itemId];
      return newTempFiles;
    });
    
    // Remove from form data
    setFormData((prev: any) => {
      const newFormData = { ...prev };
      delete newFormData[itemId];
      return newFormData;
    });

    toast({
      title: "File Removed",
      description: "File has been removed from the checklist",
    });
  };

  const handleCancel = () => {
    router.push(`/protected/checklist/${response.id}`);
  };

  // Calculate progress based on completed items
  const calculateProgress = () => {
    if (!schema?.sections?.length) return { completed: 0, total: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;
    
    schema.sections.forEach((section) => {
      section.items.forEach((item) => {
        total += 1;
        const value = formData[item.id];
          if (item.type === 'document') {
          // Document is completed if it has a valid file
          if (value && (value.filePath || value.isTemporary)) {
            completed += 1;
          }
        } else if (item.type === 'yesno') {
          // Yes/No is completed only if the answer is 'yes'
          if (value === 'yes') {
            completed += 1;
          }
        } else {
          // Other types are completed if they have any value
          if (value) {
            completed += 1;
          }
        }
      });
    });
    
    // Add the title field to the count
    total += 1;
    if (formData['checklist_title']?.trim()) {
      completed += 1;
    }
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (!schema?.sections?.length) {
        throw new Error("No checklist items found");
      }

      // Upload all temporary files to storage
      const uploadedFormData = { ...formData };
      for (const [itemId, file] of Object.entries(tempFiles)) {
        if (file && formData[itemId]?.isTemporary) {
          try {
            const fileName = `${user.id}/${response.checklist_id}/${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
              .from("checklist-document")
              .upload(fileName, file);

            if (error) throw error;

            // Update form data with permanent file info
            uploadedFormData[itemId] = {
              fileName: file.name,
              filePath: data.path,
              fileSize: file.size,
              uploadedAt: new Date().toISOString(),
            };
          } catch (uploadError: any) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
        }
      }

      // Validate required fields and auto-fail items
      let hasAutoFailures = false;
      const validationErrors: string[] = [];

      // Check if title is provided
      if (!uploadedFormData['checklist_title'] || uploadedFormData['checklist_title'].trim() === '') {
        validationErrors.push('Location/Instance is required');
      }

      schema.sections.forEach((section) => {
        section.items.forEach((item) => {
          const value = uploadedFormData[item.id];
          
          // Check if required item is missing
          if (!value) {
            if (item.type === 'document') {
              validationErrors.push(`${section.name}: ${item.name} - Document upload is required`);
            } else if (item.type === 'yesno') {
              validationErrors.push(`${section.name}: ${item.name} - Please select Yes or No`);
            } else {
              validationErrors.push(`${section.name}: ${item.name} is required`);
            }
          }
          
          // Check auto-fail conditions
          if (item.autoFail && item.type === 'yesno' && value === 'no') {
            hasAutoFailures = true;
          }
          
          if (item.autoFail && item.type === 'document' && !value) {
            hasAutoFailures = true;
          }
        });
      });

      if (validationErrors.length > 0) {
        throw new Error(`Please complete the following items:\n${validationErrors.join('\n')}`);
      }      // Calculate result based on business logic
      let result = "pass"; // Start with pass assumption
      
      // Check for auto-fail conditions first
      if (hasAutoFailures) {
        result = "failed";
      } else {
        // Check if all items are properly completed for a pass
        schema.sections.forEach((section) => {
          section.items.forEach((item) => {
            const value = uploadedFormData[item.id];
            
            if (item.type === 'document' && !value) {
              result = "failed"; // Missing document = failed
            } else if (item.type === 'yesno' && value !== 'yes') {
              result = "failed"; // Not "yes" = failed
            }
          });
        });
      }
      
      // Set status based on result
      const status = result === "pass" ? "completed" : "pending";

      // Update response
      const { error: responseError } = await supabase
        .from("checklist_responses")
        .update({
          status: status,
          result: result,
          title: uploadedFormData['checklist_title']?.trim(),
          response_data: uploadedFormData,
          last_edit_at: new Date().toISOString(),
        })
        .eq('id', response.id);

      if (responseError) throw responseError;

      toast({
        title: result === "pass" ? "✅ Success" : "⚠️ Saved with Issues",
        description: result === "pass" 
          ? `Checklist updated successfully! All requirements met. (Status: ${status.toUpperCase()})`
          : `Checklist updated but requires attention. Some items need completion or review. (Status: ${status.toUpperCase()})`,
        variant: result === "pass" ? "default" : "destructive",
      });

      // Redirect back to view page
      router.push(`/protected/checklist/${response.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update checklist",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!userProfile || !schema || !response) {
    return (
      <DashboardLayout userProfile={userProfile}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-sky-600">Loading checklist...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userProfile={userProfile}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/protected/checklist" className="hover:text-slate-900 transition-colors">
            Checklist Responses
          </Link>
          <span>/</span>
          <Link href={`/protected/checklist/${response.id}`} className="hover:text-slate-900 transition-colors">
            View Response
          </Link>
          <span>/</span>
          <span className="text-slate-900">Edit</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit: {schema.title}</h1>
                {schema.description && (
                  <p className="text-sm text-gray-700 mt-1">{schema.description}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">{response.checklist?.compliance?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {progress.completed} of {progress.total} items ({progress.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    progress.percentage === 100 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : progress.percentage >= 75 
                        ? 'bg-gradient-to-r from-blue-400 to-sky-500'
                        : progress.percentage >= 50 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-red-400 to-pink-500'
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {progress.percentage === 100 ? '✅ Complete' : 
                   progress.percentage >= 75 ? '🟦 Almost done' :
                   progress.percentage >= 50 ? '🟨 Halfway there' :
                   '🟥 Getting started'}
                </span>
                <span>{progress.total - progress.completed} items remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" />
              Edit Checklist Items
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Input Field */}
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-gray-700 font-medium">Location/Instance</Label>
                      <span className="text-red-500">*</span>
                    </div>
                    <input
                      type="text"
                      value={formData['checklist_title'] || ''}
                      onChange={(e) => handleInputChange('checklist_title', e.target.value)}
                      placeholder="Enter location or instance name (e.g., Main Factory, Building A, Store #123)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Specify the location or instance where this checklist applies
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Checklist Sections */}
              {schema.sections.map((section) => (
                <Card key={section.id} className="border border-gray-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-gray-800">{section.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {section.items.map((item) => (
                      <div key={item.id} className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Label className="text-gray-700 font-medium">
                                {item.name}
                              </Label>
                              <span className="text-red-500">*</span>
                              {item.autoFail && (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                                  Critical
                                </span>
                              )}
                            </div>

                            {item.type === 'document' ? (
                              <div className="space-y-3">
                                {/* Existing file display */}
                                {formData[item.id] && !formData[item.id].isTemporary && (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {formData[item.id].fileName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={getFileUrl(formData[item.id].filePath)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                          View
                                        </a>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRemoveFile(item.id)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Size: {(formData[item.id].fileSize / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                )}

                                {/* Temporary file display */}
                                {formData[item.id]?.isTemporary && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                          {formData[item.id].fileName} (New)
                                        </span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveFile(item.id)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                      Size: {(formData[item.id].fileSize / 1024 / 1024).toFixed(2)} MB (Will be uploaded on save)
                                    </p>
                                  </div>
                                )}

                                {/* File upload input */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                  <input
                                    type="file"
                                    id={`file-${item.id}`}
                                    onChange={(e) => handleFileUpload(e, item.id)}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  />
                                  <label
                                    htmlFor={`file-${item.id}`}
                                    className="cursor-pointer"
                                  >
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                      {formData[item.id] ? 'Replace file' : 'Click to upload file'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                                    </p>
                                  </label>
                                </div>
                              </div>
                            ) : item.type === 'yesno' ? (
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={item.id}
                                    value="yes"
                                    checked={formData[item.id] === 'yes'}
                                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                                    className="text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-green-700 font-medium">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={item.id}
                                    value="no"
                                    checked={formData[item.id] === 'no'}
                                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                                    className="text-red-600 focus:ring-red-500"
                                  />
                                  <span className="text-red-700 font-medium">No</span>
                                </label>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <ArrowUpCircle className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
