"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, Sparkles, AlertCircle, CheckCircle, FileText, Shield, ArrowLeft, Save, Heading2 } from "lucide-react";
import type { ActionResult } from "@/lib/types";
import { addFormDraft } from "../../../actions";
import { FormPreview } from "@/components/form/form-preview";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
      <Button 
        type="submit" 
        disabled={pending}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 hover:from-blue-700 hover:via-indigo-800 hover:to-purple-900 text-white transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 font-bold rounded-xl text-lg border border-white/20 backdrop-blur-sm hover:scale-105 transform"
      >
        {pending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
            Creating Form...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-3" />
            Create Form
          </>
        )}
      </Button>
    </div>
  );
}

// Add DraftButton after SubmitButton component
function DraftButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      name="action"
      value="draft"
      disabled={pending}
      variant="outline"
      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-semibold rounded-lg"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          Saving Draft...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
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

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export default function AddFormComponent({ action, complianceId }: { action: ServerAction; complianceId: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [showPreview, setShowPreview] = useState(false);
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
    
    // If no sections exist, create a General section first
    if (!fields.some(f => f.isSection)) {
      const defaultSectionField: FormField = {
        id: `section_${Date.now()}`,
        type: 'section',
        label: 'General',
        required: false,
        isSection: true
      };
      
      // Add the section and field
      setFields([defaultSectionField, newField]);
      return;
    }
    
    // If we're adding to default section or no specific section, add to the first available section
    if (sectionId === 'default' || !sectionId) {
      const firstSection = fields.find(f => f.isSection);
      if (firstSection) {
        const sectionIndex = fields.findIndex(f => f.id === firstSection.id);
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
        alert(`Field \"${fieldLabel}\" (${invalidField.type}) must have at least one non-empty option.`);
        const el = document.querySelector(`[data-field-id='${invalidField.id}']`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    
    try {
      const formSchema = {
        title: formTitle,
        description: formDescription,
        fields: fields
      };
      
      // Add the schema to form data
      formData.append("form_schema", JSON.stringify(formSchema));
      formData.append("compliance_id", complianceId);
      
      // Check if this is a draft save
      const isDraft = formData.get("action") === "draft";
      const result = await (isDraft ? addFormDraft(formData) : action(formData));
      
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage(isDraft ? "Form saved as draft!" : "Form created successfully!");
        if (!isDraft) {
          // Only reset form if it's not a draft
          setFormTitle("");
          setFormDescription("");
          setFields([]);
        }
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "An unexpected error occurred");
      console.error(error);
    }
  }
    const renderPreview = () => {
    if (!showPreview) return null;
    
      return (
      <Card className="mt-6 border-gray-200 bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Form Preview</CardTitle>
          </div>
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

  // Add renderEditMode function to organize fields by sections
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
            <Card key={sectionId} className="border border-gray-200 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-blue-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {Object.keys(sections).indexOf(sectionId) + 1}
                    </div>
                    {sectionField ? (
                      <Input
                        value={sectionField.label}
                        onChange={(e) => updateField(sectionIndex, { label: e.target.value })}
                        placeholder="Enter section name"
                        className="font-semibold text-gray-900 bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                        required
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
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
                      <Card key={field.id} className="border border-gray-200 bg-white/60 hover:bg-white/80 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Field #{fieldIndex + 1}</h4>
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
                              <Label className="text-gray-700 font-medium">Field Type *</Label>
                              <select
                                value={field.type}
                                onChange={(e) => updateField(actualFieldIndex, { type: e.target.value })}
                                className="w-full p-2 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-200 text-gray-900"
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
                              <Label className="text-gray-700 font-medium">Field Label *</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(actualFieldIndex, { label: e.target.value })}
                                placeholder="Enter field label"
                                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-200 text-gray-900 placeholder:text-gray-400"
                                required
                              />
                            </div>
                          </div>

                          {!(field.type === 'checkbox' || field.type === 'radio' || field.type === 'image') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Placeholder Text</Label>
                                <Input
                                  value={field.placeholder || ""}
                                  onChange={(e) => updateField(actualFieldIndex, { placeholder: e.target.value })}
                                  placeholder="Enter placeholder text"
                                  className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-200 text-gray-900 placeholder:text-gray-400"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Required Field</Label>
                                <div className="flex items-center gap-2">
                                  <div 
                                    onClick={() => updateField(actualFieldIndex, { required: !field.required })}
                                    className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                      field.required 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'bg-white border-gray-300 hover:border-blue-400'
                                    }`}
                                  >
                                    {field.required && (
                                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <Label className="text-gray-700 font-medium cursor-pointer" onClick={() => updateField(actualFieldIndex, { required: !field.required })}>
                                    Required Field
                                  </Label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Scoring Options */}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-800 mb-3">Scoring Options</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-gray-800 font-medium">Weightage (optional)</Label>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={field.weightage || ""}
                                  onChange={(e) => updateField(actualFieldIndex, { weightage: e.target.value ? parseFloat(e.target.value) : undefined })}
                                  placeholder="e.g., 10, 5.5"
                                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900 placeholder:text-gray-400"
                                />
                                <p className="text-xs text-gray-600">Numerical weight for scoring</p>
                              </div>
                              <div className="flex items-center gap-2 pt-6">
                                <div 
                                  onClick={() => updateField(actualFieldIndex, { autoFail: !field.autoFail })}
                                  className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    field.autoFail 
                                      ? 'bg-red-600 border-red-600' 
                                      : 'bg-white border-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {field.autoFail && (
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <Label className="text-gray-800 font-medium cursor-pointer" onClick={() => updateField(actualFieldIndex, { autoFail: !field.autoFail })}>Auto-fail</Label>
                              </div>
                            </div>
                          </div>

                          {/* Options for select/radio/checkbox fields */}
                          {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                            <div className="space-y-2 mt-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-800 font-medium">
                                  {shouldUseEnhancedOptions(field) ? "Options (Enhanced)" : "Options"}
                                </Label>
                                <Button 
                                  type="button" 
                                  onClick={() => shouldUseEnhancedOptions(field) ? addEnhancedOption(actualFieldIndex) : addOption(actualFieldIndex)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 bg-white font-medium"
                                >
                                  <Plus size={16} className="mr-2" />
                                  Add Option
                                </Button>
                              </div>
                              {shouldUseEnhancedOptions(field) ? (
                                field.enhancedOptions?.map((option, optIndex) => (
                                  <div key={optIndex} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white/80">
                                    <div className="flex gap-2">
                                      <Input 
                                        value={option.value}
                                        onChange={(e) => updateEnhancedOption(actualFieldIndex, optIndex, { value: e.target.value })}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900 placeholder:text-gray-400"
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
                                          <Label className="text-xs text-gray-800 font-medium">Points</Label>
                                          <Input 
                                            type="number"
                                            value={option.points || ""}
                                            onChange={(e) => updateEnhancedOption(actualFieldIndex, optIndex, { points: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            placeholder="Points"
                                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900 placeholder:text-gray-400"
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
                                              : 'bg-white border-gray-300 hover:border-blue-400'
                                          }`}
                                        >
                                          {option.isFailOption && (
                                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </div>
                                        <Label className="text-xs text-gray-800 font-medium cursor-pointer" onClick={() => updateEnhancedOption(actualFieldIndex, optIndex, { isFailOption: !option.isFailOption })}>Auto-fail option</Label>
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
                                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900 placeholder:text-gray-400"
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
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
          <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/30">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sections Added</h3>
            <p className="text-gray-600 mb-4">
              Start building your form by adding your first section to organize your fields.
            </p>
            <Button 
              type="button" 
              onClick={addSection}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Section
            </Button>
          </div>
        )}

        {/* Add Section Button */}
        {fields.some(f => f.isSection) && fields.filter(f => !f.isSection).length === 0 && (
          <div className="flex justify-center pt-4">
            <Button 
              type="button" 
              onClick={addSection}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Section
            </Button>
          </div>
        )}

        {/* Add Section Button when there are fields */}
        {fields.filter(f => !f.isSection).length > 0 && (
          <div className="flex justify-center pt-4">
            <Button 
              type="button" 
              onClick={addSection}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
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
    <form action={clientAction}>      <CardContent className="space-y-8 p-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        {errorMessage && (
          <div className="relative p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-800 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-semibold text-lg">{errorMessage}</span>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="relative p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 text-emerald-800 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="font-semibold text-lg">{successMessage}</span>
            </div>
          </div>
        )}
          {/* Framework Details Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
          <div className="relative space-y-6 bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Form Details
                </h3>
                <p className="text-gray-600 mt-1">Configure your form settings and parameters</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-gray-800 font-semibold text-lg">Form Title <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    id="title" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., SOX Controls Assessment, GDPR Data Protection Form" 
                    required 
                    className="h-14 border-gray-200 focus:border-blue-500 focus:ring-blue-200 bg-white/90 backdrop-blur-sm text-gray-900 text-lg font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl pointer-events-none"></div>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600">Choose a descriptive name that clearly identifies what this form is for</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-gray-800 font-semibold text-lg">Form Description</Label>
                <div className="relative">
                  <textarea 
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of what this form is for"
                    className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 bg-white/90 backdrop-blur-sm text-gray-900 font-medium shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-xl resize-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* What happens next? */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  What happens next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Add sections to organize your form structure</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Add fields within each section for data collection</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Configure validation rules and scoring options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-lg">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              Form Fields
            </h3>
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 bg-white font-medium"
              >
                <Eye size={16} className="mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button 
                type="button" 
                onClick={addSection}
                variant="outline"
                className="border-dashed border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 bg-white/50 font-medium"
              >
                <Heading2 size={16} className="mr-2" />
                Add Section
              </Button>
              <Button 
                type="button" 
                onClick={() => addField()} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Add Field
              </Button>
            </div>
          </div>
          {showPreview ? (
            renderPreview()
          ) : (
            renderEditMode()
          )}
        </div>
        
        <CardFooter className="flex justify-between gap-4 p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Link 
              href={`/protected/compliance/${complianceId}/forms`} 
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Cancel
            </Link>
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Draft forms can be edited later</span>
            </div>
          </div>
          <div className="flex gap-4">
            <DraftButton />
            <SubmitButton />
          </div>
        </CardFooter>
      </CardContent>
    </form>
  );
}