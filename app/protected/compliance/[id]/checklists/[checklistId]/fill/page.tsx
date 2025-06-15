import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ChecklistFillForm from "./fill-form";

// Server component wrapper that checks auth and provides the checklist data
export default async function FillChecklistPage({ params }: { params: { id: string; checklistId: string } }) {
  const supabase = await createClient();
  const complianceId = params.id;
  const checklistId = params.checklistId;
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Fetch the checklist schema to verify it exists
  const { data: checklist, error } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .single();
    
  if (error || !checklist) {
    console.error("Error fetching checklist:", error);
    return redirect(`/protected/compliance/${complianceId}/checklists`);
  }
  
  // Render the client component
  return <ChecklistFillForm complianceId={complianceId} checklistId={checklistId} />;
}

// Client component for the interactive form
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, File, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

// Define types for the checklist data
interface ChecklistItem {
  id: string;
  name: string;
  type: 'document' | 'yesno';
  required: boolean;
  category?: string;
}

interface ChecklistSchema {
  title: string;
  description?: string;
  items: ChecklistItem[];
  categories?: string[];
}

interface ChecklistResponse {
  id: string;
  checklist_id: string;
  user_id: string;
  status: string;
  response_data: Record<string, any>;
  title: string;
  result?: string;
  created_at: string;
  last_edit_at: string;
}

export default function FillChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const complianceId = params.id as string;
  const checklistId = params.checklistId as string;
  
  const [checklist, setChecklist] = useState<ChecklistSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string, url: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Create a dynamic form schema based on the checklist items
  const createFormSchema = (items: ChecklistItem[]) => {
    const schema: Record<string, any> = {};
    
    items.forEach(item => {
      if (item.type === 'yesno') {
        schema[item.id] = item.required 
          ? z.boolean({ required_error: `${item.name} is required` })
          : z.boolean().optional();
      } else if (item.type === 'document') {
        // Document uploads are handled separately via the uploadedFiles state
        schema[item.id] = item.required 
          ? z.any().refine(val => {
              return uploadedFiles[item.id] !== undefined;
            }, { message: `Document for ${item.name} is required` })
          : z.any().optional();
      }
    });
    
    return z.object(schema);
  };

  // Load checklist data
  useEffect(() => {
    async function loadChecklistData() {
      try {
        setLoading(true);
        
        // Fetch checklist schema
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklist')
          .select('*')
          .eq('id', checklistId)
          .single();
          
        if (checklistError) throw checklistError;
        if (!checklistData) throw new Error('Checklist not found');
        
        // Parse the schema JSON
        const schema = checklistData.checklist_schema as ChecklistSchema;
        setChecklist(schema);
          // Check if user has a saved response
        const { data: responseData, error: responseError } = await supabase
          .from('checklist_responses')
          .select('*')
          .eq('checklist_id', checklistId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
          
        if (responseData && !responseError) {
          // Populate the form with saved data
          if (responseData.response_data) {
            // Set form values
            Object.entries(responseData.response_data).forEach(([key, value]) => {              if (value && typeof value === 'object' && 'type' in value && value.type === 'document' && 
                  'fileName' in value && 'url' in value) {
                setUploadedFiles(prev => ({
                  ...prev,
                  [key]: { 
                    name: value.fileName as string, 
                    url: value.url as string 
                  }
                }));
              } else if (typeof value === 'boolean') {
                // For yes/no questions
                setValue(key, value);
              }
            });
          }
          
          // Set status from saved response
          setValue('status', responseData.status || 'in_progress');
          
          // If already submitted, show a notification
          if (responseData.status === 'submitted') {            toast({
              title: "Checklist already submitted",
              description: "This checklist has already been submitted. You can review but not modify it."
            });
          }
        }
      } catch (err: any) {
        console.error('Error loading checklist:', err);
        setError(err.message || 'Failed to load checklist');
      } finally {
        setLoading(false);
      }
    }
    
    if (checklistId) {
      loadChecklistData();
    }
  }, [checklistId]);
  // Create form with dynamic validation
  const formSchema = checklist ? createFormSchema(checklist.items).extend({
    status: z.enum(['in_progress', 'submitted'])
  }) : z.object({});
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'in_progress'
    }
  });

  // Handle file uploads
  const handleFileUpload = async (itemId: string, file: File) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [itemId]: true }));
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${checklistId}/${itemId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('checklist-document')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('checklist-document')
        .getPublicUrl(fileName);
        
      // Save file info
      setUploadedFiles(prev => ({ 
        ...prev, 
        [itemId]: { 
          name: file.name,
          url: urlData.publicUrl
        }
      }));
      
      // Update form value to pass validation
      setValue(itemId, file.name);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: "Upload failed",
        description: err.message || 'Failed to upload file',
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [itemId]: false }));
    }
  };
  // Submit form
  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      
      // Get submission status
      const status = data.status || 'in_progress';
      
      // Prepare response data by combining form values and uploaded files
      const responseData: Record<string, any> = {};
      
      // Check for missing required documents or questions
      if (status === 'submitted') {
        for (const item of checklist?.items || []) {
          if (item.required) {
            if (item.type === 'document' && !uploadedFiles[item.id]) {
              toast({
                title: "Missing required document",
                description: `Please upload ${item.name} before submitting.`,
                variant: "destructive"
              });
              setSubmitting(false);
              return;
            } else if (item.type === 'yesno' && data[item.id] === undefined) {
              toast({
                title: "Missing required answer",
                description: `Please answer ${item.name} before submitting.`,
                variant: "destructive"
              });
              setSubmitting(false);
              return;
            }
          }
        }
      }
      
      // Populate response data
      checklist?.items.forEach(item => {
        if (item.type === 'yesno') {
          responseData[item.id] = data[item.id];
        } else if (item.type === 'document' && uploadedFiles[item.id]) {
          responseData[item.id] = {
            type: 'document',
            fileName: uploadedFiles[item.id].name,
            url: uploadedFiles[item.id].url
          };
        }
      });
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Check if response exists
      const { data: existingResponse } = await supabase
        .from('checklist_responses')
        .select('id')
        .eq('checklist_id', checklistId)
        .eq('user_id', userData.user.id)
        .single();
      
      // Update or insert response
      if (existingResponse) {
        const { error } = await supabase
          .from('checklist_responses')
          .update({
            response_data: responseData,
            status: status,
            last_edit_at: new Date().toISOString()
          })
          .eq('id', existingResponse.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('checklist_responses')
          .insert({
            checklist_id: checklistId,
            user_id: userData.user.id,
            response_data: responseData,
            status: status,
            title: checklist?.title || 'Untitled Checklist'
          });
          
        if (error) throw error;
      }
      
      if (status === 'submitted') {
        toast({
          title: "Checklist submitted",
          description: "Your checklist has been submitted successfully."
        });
      } else {
        toast({
          title: "Progress saved",
          description: "Your checklist progress has been saved."
        });
      }
      
      // Redirect back to checklist list after short delay to show toast
      setTimeout(() => {
        router.push(`/protected/compliance/${complianceId}/checklists`);
      }, 1500);
    } catch (err: any) {
      console.error('Submission error:', err);
      toast({
        title: status === 'submitted' ? "Submit failed" : "Save failed",
        description: err.message || 'Failed to save your responses',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-6 text-center">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error || 'Checklist not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{checklist.title}</h1>
          {watch('status') === 'submitted' && (
            <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Submitted
            </div>
          )}
        </div>
        {checklist.description && (
          <p className="text-muted-foreground mt-2">{checklist.description}</p>
        )}
        {watch('status') === 'submitted' && (
          <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              This checklist has already been submitted. You can review your responses, but cannot modify them.
            </p>
          </div>
        )}
      </div>      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end mb-4">              <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6"
            onClick={() => setValue('status', 'submitted')}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Checklist"}
          </Button>
        </div>
        
        {checklist.items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="font-medium">{item.name}</h3>
              {item.required && (
                <span className="text-xs text-red-500">*Required</span>
              )}
            </div>

            {item.type === 'document' ? (
              <div>
                {uploadedFiles[item.id] ? (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <File size={16} />
                    <span className="flex-1 truncate">{uploadedFiles[item.id].name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFiles(prev => {
                          const newFiles = { ...prev };
                          delete newFiles[item.id];
                          return newFiles;
                        });
                        setValue(item.id, undefined);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (                <div 
                    className={`border-2 border-dashed border-gray-300 rounded p-6 text-center ${watch('status') !== 'submitted' ? 'cursor-pointer hover:bg-muted/20 transition-colors' : 'opacity-70'}`}
                    onClick={() => watch('status') !== 'submitted' && document.getElementById(`file-${item.id}`)?.click()}
                  >
                    <input
                      id={`file-${item.id}`}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(item.id, file);
                      }}
                    />
                    {uploadingFiles[item.id] ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLS, JPG, PNG (max 10MB)</p>
                      </div>
                    )}
                  </div>
                )}
                {errors[item.id] && (
                  <p className="text-sm text-red-500 mt-1">{errors[item.id]?.message as string}</p>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">                    <input
                      type="radio"
                      className="w-4 h-4 text-primary accent-primary"
                      {...register(item.id)}
                      value="true"
                      onChange={() => setValue(item.id, true)}
                      checked={watch(item.id) === true}
                      disabled={watch('status') === 'submitted'}
                    />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">                    <input
                      type="radio"
                      className="w-4 h-4 text-primary accent-primary"
                      {...register(item.id)}
                      value="false"
                      onChange={() => setValue(item.id, false)}
                      checked={watch(item.id) === false}
                      disabled={watch('status') === 'submitted'}
                    />
                  <span>No</span>
                </label>
                {errors[item.id] && (
                  <p className="text-sm text-red-500 ml-2">{errors[item.id]?.message as string}</p>
                )}
              </div>
            )}
          </Card>
        ))}        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={handleSubmit((data) => onSubmit({ ...data, status: 'in_progress' }))}
            disabled={submitting || watch('status') === 'submitted'}
          >
            {submitting && watch('status') === 'in_progress' ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></span>
                Saving...
              </>
            ) : (
              'Save Progress'
            )}
          </Button>
          
          <Button 
            type="submit" 
            disabled={submitting || watch('status') === 'submitted'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting && watch('status') === 'submitted' ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Submitting...
              </>
            ) : (
              'Submit Checklist'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
