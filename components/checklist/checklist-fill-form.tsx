"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpCircle, CheckSquare, Upload, AlertTriangle, FileText, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface Props {
  complianceId: string;
  checklistId: string;
  checklist: any;
  framework: any;
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

export function ChecklistFillForm({ complianceId, checklistId, checklist, framework, userProfile }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<ChecklistSchema | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [tempFiles, setTempFiles] = useState<Record<string, File>>({});
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    // Set the schema from the passed checklist data
    if (checklist?.checklist_schema) {
      setSchema(checklist.checklist_schema);
    }
  }, [checklist]);

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

  const handleCancel = () => {
    router.back();
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

      // Check if any responses already exist for this user
      const { data: existingResponse } = await supabase
        .from("checklist_responses")
        .select("id")
        .eq("checklist_id", checklistId)
        .eq("user_id", user.id)
        .single();      if (existingResponse) {
        throw new Error("You have already submitted a response for this checklist");
      }

      // Upload all temporary files to storage
      const uploadedFormData = { ...formData };
      for (const [itemId, file] of Object.entries(tempFiles)) {
        if (file && formData[itemId]?.isTemporary) {
          try {
            const fileName = `${user.id}/${checklistId}/${Date.now()}_${file.name}`;
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
      const validationErrors: string[] = [];      // Check if title is provided
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
        result = "fail";
      } else {        // Check if all items are properly completed for a pass
        schema.sections.forEach((section) => {
          section.items.forEach((item) => {
            const value = uploadedFormData[item.id];
            
            if (item.type === 'document' && !value) {
              result = "fail"; // Missing document = fail
            } else if (item.type === 'yesno' && value !== 'yes') {
              result = "fail"; // Not "yes" = fail
            }
          });
        });
      }
      
      // Set status based on result
      const status = result === "pass" ? "completed" : "pending";      // Save response
      const { error: responseError } = await supabase
        .from("checklist_responses")
        .insert([
          {
            checklist_id: parseInt(checklistId),
            user_id: user.id,
            status: status,
            result: result,            title: uploadedFormData['checklist_title']?.trim(),
            response_data: uploadedFormData,
            last_edit_at: new Date().toISOString(),
          },
        ]);

      if (responseError) throw responseError;      toast({
        title: result === "pass" ? "✅ Success" : "⚠️ Saved with Issues",
        description: result === "pass" 
          ? `Checklist saved successfully! All requirements met. (Status: ${status.toUpperCase()})`
          : `Checklist saved but requires attention. Some items need completion or review. (Status: ${status.toUpperCase()})`,
        variant: result === "pass" ? "default" : "destructive",
      });      // Redirect back to documents page
      window.location.href = `/protected/documents`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save checklist",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  if (!userProfile || !schema || !framework) {
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
      <div className="space-y-6">        {/* Header */}        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckSquare className="h-5 w-5 text-blue-600" />
            </div>            <div>
              <h1 className="text-xl font-semibold text-gray-900">{schema.title}</h1>
              {schema.description && (
                <p className="text-sm text-gray-700 mt-1">{schema.description}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">{framework.name}</p>
            </div>
          </div>
        </div>        {/* Form */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" />
              Checklist Items
            </CardTitle>
          </CardHeader><CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">              {/* Title Input Field */}
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
                      placeholder="e.g., KFC Seremban 2, McDonald's KLCC, Office Block A"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Identify the specific location or instance for this checklist.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {schema.sections.map((section, sectionIndex) => (
                <div key={section.id} className="space-y-4">                  {/* Section Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {sectionIndex + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-4 ml-11">
                    {section.items.map((item, itemIndex) => (                      <Card key={item.id} className="border border-gray-200 bg-white">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Item Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    {sectionIndex + 1}.{itemIndex + 1}
                                  </span>
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    item.type === 'document' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {item.type === 'document' ? 'Document' : 'Yes/No'}
                                  </span>
                                </div>                                {item.autoFail && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span className="text-xs text-orange-700 font-medium">
                                      Critical item - must be completed correctly
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>                            {/* Item Input */}
                            {item.type === "document" && (
                              <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Upload Document</Label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    onChange={(e) => handleFileUpload(e, item.id)}
                                    disabled={uploading[item.id]}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors"
                                  />
                                  {uploading[item.id] && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                                    </div>
                                  )}
                                </div>                                {formData[item.id] && (
                                  <div className="flex items-center justify-between text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                      <Upload className="h-4 w-4" />
                                      <div>
                                        <span className="font-medium">Selected: {formData[item.id].fileName}</span>
                                        <p className="text-xs text-blue-600 mt-1">
                                          Size: {(formData[item.id].fileSize / 1024).toFixed(1)} KB • 
                                          {formData[item.id].isTemporary ? "Ready for upload" : `Uploaded: ${new Date(formData[item.id].uploadedAt).toLocaleString()}`}
                                        </p>
                                      </div>
                                    </div>                                    {formData[item.id].isTemporary ? (
                                      getTempFileUrl(item.id) ? (
                                        <a
                                          href={getTempFileUrl(item.id)!}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                        >
                                          Preview
                                        </a>
                                      ) : (
                                        <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">
                                          No Preview
                                        </span>
                                      )
                                    ) : (
                                      <a
                                        href={getFileUrl(formData[item.id].filePath)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}                            {item.type === "yesno" && (
                              <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Select Option</Label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={item.id}
                                      value="yes"
                                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                                      className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-gray-700 font-medium">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={item.id}
                                      value="no"
                                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                                      className="text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 font-medium">No</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 font-medium rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium rounded-lg transition-colors"
                >{submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Save Checklist
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
