"use client";

import { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, Sparkles, AlertCircle, CheckCircle, FileText, Save, Heading2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateForm } from "../../../../actions";
import type { ActionResult } from "@/lib/types";
import { FormPreview } from "@/components/form/form-preview";

// Form interface definition
interface Form {
  id: string;
  compliance_id: string;
  name: string;
  form_schema: any;
  created_at: string;
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 font-semibold rounded-lg"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Updating Form...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Update Form
        </>
      )}
    </Button>
  );
}

type FormFieldOption = {
  value: string;
  points?: number;
  isFailOption?: boolean;
};

type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // Keep for backward compatibility
  enhancedOptions?: FormFieldOption[]; // New enhanced options
  weightage?: number;
  autoFail?: boolean;
  isSection?: boolean; // New field to identify section headers
};

export default function EditFormComponent({ form, complianceId }: { form: Form; complianceId: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  
  // Initialize form data from existing form
  useEffect(() => {
    if (form.form_schema) {
      setFormTitle(form.form_schema.title || "");
      setFormDescription(form.form_schema.description || "");
      const formFields = form.form_schema.fields || [];
      
      // Check if there are any sections defined
      const hasSections = formFields.some((field: any) => field.isSection);
      
      if (!hasSections && formFields.length > 0) {
        // Create a General section field if no sections exist
        const generalSectionField: FormField = {
          id: `section_${Date.now()}`, // Use dynamic ID instead of 'general'
          type: 'section',
          label: 'General',
          required: false,
          isSection: true
        };
        setFields([generalSectionField, ...formFields]);
      } else {
        setFields(formFields);
      }
    }
  }, [form]);
    const addField = (sectionId?: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "",
      required: false,
      placeholder: "",
      weightage: undefined,
      autoFail: false
    };
    
    if (sectionId && sectionId !== 'default') {
      // Find the section and add the field after the last field in that section
      const sectionIndex = fields.findIndex(f => f.id === sectionId);
      if (sectionIndex !== -1) {
        // Find the last field in this section (before the next section)
        let insertIndex = sectionIndex + 1;
        while (insertIndex < fields.length && !fields[insertIndex].isSection) {
          insertIndex++;
        }
        
        const updatedFields = [...fields];
        updatedFields.splice(insertIndex, 0, newField);
        setFields(updatedFields);
        return;
      }
    }
    
    // If no sections exist or we're adding to default section, create a section first
    if (sectionId === 'default' || !fields.some(f => f.isSection)) {
      const defaultSectionField: FormField = {
        id: `section_${Date.now()}`,
        type: 'section',
        label: 'General',
        required: false,
        isSection: true
      };
      
      // Add the section and field
      setFields([defaultSectionField, newField, ...fields]);
      return;
    }
    
    // Fallback: add to the end
    setFields([...fields, newField]);
  };
  
  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };
  
  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };
  
  const addOption = (fieldIndex: number) => {
    const updatedFields = [...fields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options!.push("");
    setFields(updatedFields);
  };
  
  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options![optionIndex] = value;
    setFields(updatedFields);
  };
    const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options!.splice(optionIndex, 1);
    setFields(updatedFields);
  };

  // Enhanced options functions
  const addEnhancedOption = (fieldIndex: number) => {
    const updatedFields = [...fields];
    if (!updatedFields[fieldIndex].enhancedOptions) {
      updatedFields[fieldIndex].enhancedOptions = [];
    }
    updatedFields[fieldIndex].enhancedOptions!.push({
      value: "",
      points: 0,
      isFailOption: false
    });
    setFields(updatedFields);
  };

  const updateEnhancedOption = (fieldIndex: number, optionIndex: number, updates: Partial<FormFieldOption>) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].enhancedOptions) {
      updatedFields[fieldIndex].enhancedOptions![optionIndex] = {
        ...updatedFields[fieldIndex].enhancedOptions![optionIndex],
        ...updates
      };
      setFields(updatedFields);
    }
  };

  const removeEnhancedOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].enhancedOptions!.splice(optionIndex, 1);
    setFields(updatedFields);
  };
  // Check if field should use enhanced options
  const shouldUseEnhancedOptions = (field: FormField) => {
    // Text, textarea, and email fields should never use enhanced options
    if (field.type === 'text' || field.type === 'textarea' || field.type === 'email') {
      return false;
    }
    return (field.weightage !== undefined && field.weightage > 0) || field.autoFail;
  };
  
  const addSection = () => {
    const newField: FormField = {
      id: `section_${Date.now()}`,
      type: "section",
      label: "",
      required: false,
      isSection: true
    };
    setFields([...fields, newField]);
  };
  
  async function clientAction(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");
    
    // Custom validation: ensure each section has at least one field
    const sections: { [key: string]: any[] } = {};
    let currentSection = '';
    fields.forEach(field => {
      if (field.isSection) {
        currentSection = field.id;
        sections[currentSection] = [];
      } else {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(field);
      }
    });
    const emptySectionEntry = Object.entries(sections).find(([_, fs]) => fs.length === 0);
    if (emptySectionEntry) {
      const [emptySectionId] = emptySectionEntry;
      const sectionField = fields.find(f => f.id === emptySectionId);
      const sectionName = sectionField?.label?.trim() ? sectionField.label : 'Unnamed Section';
      setTimeout(() => {
        alert(`Section "${sectionName}" has no field inserted. Please add at least one field to this section.`);
        const el = document.querySelector(`[data-section-id='${emptySectionId}']`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    // New validation: ensure checkbox/radio fields have at least one non-empty option
    const invalidField = fields.find(f => {
      if (f.type === 'checkbox' || f.type === 'radio') {
        if (shouldUseEnhancedOptions(f)) {
          return !f.enhancedOptions || f.enhancedOptions.length === 0 || f.enhancedOptions.every(opt => !opt.value?.trim());
        } else {
          return !f.options || f.options.length === 0 || f.options.every(opt => !opt?.trim());
        }
      }
      return false;
    });
    if (invalidField) {
      const fieldLabel = invalidField.label?.trim() ? invalidField.label : 'Unnamed Field';
      setTimeout(() => {
        alert(`Field "${fieldLabel}" (${invalidField.type}) must have at least one non-empty option.`);
        const el = document.querySelector(`[data-field-id='${invalidField.id}']`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    try {
      // Save all fields including sections
      const formSchema = {
        title: formTitle,
        description: formDescription,
        fields: fields
      };
      
      // Add the schema to form data
      formData.append("form_schema", JSON.stringify(formSchema));
      formData.append("form_id", form.id.toString());
      
      const result = await updateForm(formData);
      
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Form updated successfully!");
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/protected/compliance/${complianceId}/forms`);
        }, 1000);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "An unexpected error occurred");
      console.error(error);
    }
  }
    const renderPreview = () => {
    if (!showPreview) return null;
    
    // Show all fields in preview including sections
    return (
      <Card className="mt-6 border-sky-200 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
          <CardTitle className="text-sky-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-sky-600" />
            Form Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <FormPreview 
            schema={{
              title: formTitle,
              description: formDescription,
              fields: fields
            }}
          />
        </CardContent>
      </Card>
    );
  };

// Fix the edit mode structure by creating a separate function
const renderEditMode = () => {
  const sections: { [key: string]: FormField[] } = {};
  let currentSection = '';
  
  // First pass: organize fields by sections
  fields.forEach(field => {
    if (field.isSection) {
      currentSection = field.id;
      sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      sections[currentSection].push(field);
    }
  });
  
  // If no sections exist but we have fields, create a default section for display
  if (Object.keys(sections).length === 0 && fields.filter(f => !f.isSection).length > 0) {
    sections['default'] = fields.filter(f => !f.isSection);
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([sectionId, sectionFields]) => {
        const sectionField = fields.find(f => f.id === sectionId);
        const sectionIndex = fields.findIndex(f => f.id === sectionId);
        
        return (
          <Card key={sectionId} className="border border-sky-200 bg-gradient-to-r from-sky-50/50 to-blue-50/50">
            <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-100 border-b border-sky-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-sky-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {Object.keys(sections).indexOf(sectionId) + 1}
                  </div>
                  {sectionField ? (
                    <Input
                      value={sectionField.label}
                      onChange={(e) => updateField(sectionIndex, { label: e.target.value })}
                      placeholder="Enter section name"
                      className="font-semibold text-sky-900 bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-sky-200"
                      required
                    />
                  ) : (
                    <span className="font-semibold text-sky-900">
                      {sectionId === 'default' ? 'General' : 'Unnamed Section'}
                    </span>
                  )}
                </div>
                {sectionField && (
                  <Button
                    type="button"
                    onClick={() => removeField(sectionIndex)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {sectionFields.map((field, fieldIndex) => {
                  const actualFieldIndex = fields.findIndex(f => f.id === field.id);
                  return (
                    <Card key={field.id} className="border border-sky-200 bg-white/60 hover:bg-white/80 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-sky-900">Field #{fieldIndex + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeField(actualFieldIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sky-700 font-medium">Field Type *</Label>                            <select
                              value={field.type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                const updates: Partial<FormField> = { type: newType };
                                
                                // Clear scoring options for text, textarea, and email fields
                                if (newType === 'text' || newType === 'textarea' || newType === 'email') {
                                  updates.weightage = undefined;
                                  updates.autoFail = false;
                                }
                                
                                updateField(actualFieldIndex, updates);
                              }}
                              className="w-full p-2 bg-white border border-sky-200 rounded-md focus:border-sky-400 focus:ring-sky-200 text-sky-900"
                            >
                              <option value="text">Text Input</option>
                              <option value="textarea">Text Area</option>
                              <option value="select">Dropdown</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="radio">Radio Buttons</option>
                              <option value="email">Email</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="image">Image</option>
                  </select>
                  </div>
                
                  <div className="space-y-2">
                            <Label className="text-sky-700 font-medium">Field Label *</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(actualFieldIndex, { label: e.target.value })}
                              placeholder="Enter field label"
                              className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                              required
                            />
                          </div>
                        </div>                        {/* Placeholder and Required Field options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {!(field.type === 'checkbox' || field.type === 'radio' || field.type === 'image') && (
                            <div className="space-y-2">
                              <Label className="text-sky-700 font-medium">Placeholder Text</Label>
                              <Input
                                value={field.placeholder || ""}
                                onChange={(e) => updateField(actualFieldIndex, { placeholder: e.target.value })}
                                placeholder="Enter placeholder text"
                                className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                              />
                            </div>
                          )}
                          {!(field.type === 'checkbox' || field.type === 'image') && (
                            <div className="space-y-2">
                              <Label className="text-sky-700 font-medium">Required Field</Label>
                              <div className="flex items-center gap-2">
                                <div 
                                  onClick={() => updateField(actualFieldIndex, { required: !field.required })}
                                  className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    field.required 
                                      ? 'bg-sky-600 border-sky-600' 
                                      : 'bg-white border-sky-300 hover:border-sky-400'
                                  }`}
                                >
                                  {field.required && (
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <Label className="text-sky-700 font-medium cursor-pointer" onClick={() => updateField(actualFieldIndex, { required: !field.required })}>
                                  Required Field
                                </Label>
                              </div>
                            </div>
                          )}
                        </div>{/* Scoring Options - Hidden for text, textarea, and email fields */}
                        {field.type !== 'text' && field.type !== 'textarea' && field.type !== 'email' && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-sky-800 mb-3">Scoring Options</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sky-800 font-medium">Weightage (optional)</Label>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={field.weightage || ""}
                                  onChange={(e) => updateField(actualFieldIndex, { weightage: e.target.value ? parseFloat(e.target.value) : undefined })}
                                  placeholder="e.g., 10, 5.5"
                                  className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                                />
                                <p className="text-xs text-sky-600">Numerical weight for scoring</p>
                              </div>
                              <div className="flex items-center gap-2 pt-6">
                                <div 
                                  onClick={() => updateField(actualFieldIndex, { autoFail: !field.autoFail })}
                                  className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    field.autoFail 
                                      ? 'bg-red-600 border-red-600' 
                                      : 'bg-white border-sky-300 hover:border-sky-400'
                                  }`}
                                >
                                  {field.autoFail && (
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <Label className="text-sky-800 font-medium cursor-pointer" onClick={() => updateField(actualFieldIndex, { autoFail: !field.autoFail })}>Auto-fail</Label>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Info message for non-scoring field types */}
                        {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 p-1 rounded">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                              </div>
                              <p className="text-sm text-blue-700 font-medium">
                                Text fields, text areas, and email fields do not support scoring or auto-fail options.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Options for select/radio/checkbox fields */}
                        {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                          <div className="space-y-2 mt-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sky-800 font-medium">
                                {shouldUseEnhancedOptions(field) ? "Options (Enhanced)" : "Options"}
                              </Label>
                              <Button 
                                type="button" 
                                onClick={() => shouldUseEnhancedOptions(field) ? addEnhancedOption(actualFieldIndex) : addOption(actualFieldIndex)}
                                variant="outline"
                                size="sm"
                                className="border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 bg-white font-medium"
                              >
                                <Plus size={16} className="mr-2" />
                                Add Option
                              </Button>
                            </div>
                            {shouldUseEnhancedOptions(field) ? (
                              field.enhancedOptions?.map((option, optIndex) => (
                                <div key={optIndex} className="border border-sky-200 rounded-lg p-3 space-y-2 bg-white/80">
                                  <div className="flex gap-2">
                                    <Input 
                                      value={option.value}
                                      onChange={(e) => updateEnhancedOption(actualFieldIndex, optIndex, { value: e.target.value })}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                                    />
                                    <Button 
                                      type="button" 
                                      onClick={() => removeEnhancedOption(actualFieldIndex, optIndex)}
                                      variant="outline"
                                      size="sm"
                                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 bg-white font-medium"
                                    >
                                      <Minus size={16} className="text-red-500" />
                                    </Button>
                      </div>
                                  {field.weightage && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs text-sky-800 font-medium">Points</Label>
                                        <Input 
                                          type="number"
                                          value={option.points || ""}
                                          onChange={(e) => updateEnhancedOption(actualFieldIndex, optIndex, { points: e.target.value ? parseFloat(e.target.value) : undefined })}
                                          placeholder="Points"
                                          className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                                        />
                    </div>
                  </div>
                )}
                                  {field.autoFail && (
                                    <div className="flex items-center gap-2">
                                      <div
                                        onClick={() => updateEnhancedOption(actualFieldIndex, optIndex, { isFailOption: !option.isFailOption })}
                                        className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                          option.isFailOption 
                                            ? 'bg-red-600 border-red-600' 
                                            : 'bg-white border-sky-300 hover:border-sky-400'
                                        }`}
                                      >
                                        {option.isFailOption && (
                                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <Label className="text-xs text-sky-800 font-medium cursor-pointer" onClick={() => updateEnhancedOption(actualFieldIndex, optIndex, { isFailOption: !option.isFailOption })}>Auto-fail option</Label>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              field.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex gap-2">
                                  <Input 
                                    value={option}
                                    onChange={(e) => updateOption(actualFieldIndex, optIndex, e.target.value)}
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                                  />
                                  <Button 
                                    type="button" 
                                    onClick={() => removeOption(actualFieldIndex, optIndex)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 bg-white font-medium"
                                  >
                                    <Minus size={16} className="text-red-500" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Add Field Button */}
                <div className="flex justify-center pt-2">
                  <Button 
                    type="button" 
                    onClick={() => addField(sectionId)}
                    variant="outline"
                    className="border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
              </div>
          </div>
        </CardContent>
      </Card>
        );
      })}

      {/* No Sections State */}
      {fields.filter(f => !f.isSection).length === 0 && (
        <div className="text-center py-12 px-6 border-2 border-dashed border-sky-200 rounded-lg bg-sky-50/30">
          <div className="bg-sky-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-sky-800 mb-2">No Fields Added</h3>
          <p className="text-sky-600 mb-4">
            Start building your form by adding your first field.
          </p>
          <Button 
            type="button" 
            onClick={() => addField()}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Field
          </Button>
        </div>
      )}

      {/* Add Section Button */}
      {fields.filter(f => !f.isSection).length > 0 && (
        <div className="flex justify-center pt-4">
          <Button 
            type="button" 
            onClick={addSection}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      )}
    </div>
  );
};

    return (
    <form action={clientAction}>
      <CardContent className="space-y-6 p-6">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}
        
        {/* Form Basic Info */}
        <div className="space-y-4 bg-sky-50/30 rounded-lg p-4 border border-sky-100">
          <h3 className="text-lg font-semibold text-sky-900 flex items-center gap-2">
            <div className="bg-sky-100 p-1.5 rounded-lg">
              <FileText className="h-4 w-4 text-sky-600" />
            </div>
            Form Information
          </h3>            <div className="space-y-2">
            <Label htmlFor="title" className="text-sky-800 font-medium">Form Title</Label>
            <Input 
              id="title" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., SOX Controls Assessment" 
              required 
              className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
            />
          </div>
            <div className="space-y-2">
            <Label htmlFor="description" className="text-sky-800 font-medium">Form Description</Label>
            <textarea 
              id="description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of what this form is for"
              className="w-full p-3 border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-colors bg-white text-sky-900 placeholder:text-sky-400"
              rows={3}
            />
          </div></div>
        
        {/* Form Fields */}
        <div className="space-y-4 bg-sky-50/30 rounded-lg p-4 border border-sky-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-sky-900 flex items-center gap-2">
              <div className="bg-sky-100 p-1.5 rounded-lg">
                <Plus className="h-4 w-4 text-sky-600" />
              </div>
              Form Fields
            </h3>
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline"
                className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-800 bg-white font-medium"
              >
                <Eye size={16} className="mr-2 text-sky-600" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
            </div>
          </div>          
          
          {showPreview ? (
            renderPreview()
          ) : (
            renderEditMode()
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Link 
          href={`/protected/compliance/${complianceId}/forms`} 
          className="text-sm text-muted-foreground hover:underline"
        >
          Cancel
        </Link>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}
