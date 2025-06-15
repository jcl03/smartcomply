"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, Sparkles, AlertCircle, CheckCircle, FileText, Shield, ArrowLeft } from "lucide-react";
import type { ActionResult } from "@/lib/types";

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
            Create Framework
          </>
        )}
      </Button>
    </div>
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
};

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export default function AddFormComponent({ action, complianceId }: { action: ServerAction; complianceId: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [showPreview, setShowPreview] = useState(false);
    const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "",
      required: false,
      placeholder: "",
      weightage: undefined,
      autoFail: false
    };
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
  
  async function clientAction(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const formSchema = {
        title: formTitle,
        description: formDescription,
        fields: fields
      };
      
      // Add the schema to form data
      formData.append("form_schema", JSON.stringify(formSchema));
      formData.append("compliance_id", complianceId);
      
      const result = await action(formData);
      
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Form created successfully!");
        // Reset form
        setFormTitle("");
        setFormDescription("");
        setFields([]);
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
          <div className="space-y-4">
            {formTitle && <h3 className="text-lg font-semibold text-gray-900">{formTitle}</h3>}
            {formDescription && <p className="text-gray-700">{formDescription}</p>}
            
            {fields.map((field, index) => (              <div key={field.id} className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-gray-800 font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.weightage && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Weight: {field.weightage}
                    </span>
                  )}
                  {field.autoFail && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Auto-fail
                    </span>
                  )}
                </div>
                
                {field.type === "text" && (
                  <Input placeholder={field.placeholder} disabled className="border-gray-200 text-gray-700 bg-white" />
                )}
                
                {field.type === "textarea" && (
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 bg-white" 
                    placeholder={field.placeholder}
                    disabled
                    rows={3}
                  />
                )}                  {field.type === "select" && (
                  <select className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 bg-white" disabled>
                    <option>Select an option...</option>
                    {shouldUseEnhancedOptions(field) ? (
                      field.enhancedOptions?.map((option, optIndex) => (
                        <option key={optIndex} value={option.value}>
                          {option.value}
                          {field.weightage && option.points !== undefined ? ` (${option.points} pts)` : ''}
                          {field.autoFail && option.isFailOption ? ' ❌' : ''}
                        </option>
                      ))
                    ) : (
                      field.options?.map((option, optIndex) => (
                        <option key={optIndex} value={option}>{option}</option>
                      ))
                    )}
                  </select>
                )}
                  {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border-2 bg-white border-gray-300 flex items-center justify-center opacity-60">
                      {/* Disabled checkbox appearance */}
                    </div>
                    <span className="text-gray-800">{field.label}</span>
                  </div>
                )}
                
                {field.type === "radio" && (
                  <div className="space-y-2">                    {shouldUseEnhancedOptions(field) ? (
                      field.enhancedOptions?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input type="radio" name={field.id} disabled className="w-4 h-4 text-blue-600 border-gray-300" />
                          <span className="flex items-center gap-2">
                            <span className="text-gray-800">{option.value}</span>
                            {field.weightage && option.points !== undefined && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {option.points} pts
                              </span>
                            )}
                            {field.autoFail && option.isFailOption && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Auto-fail
                              </span>
                            )}
                          </span>
                        </div>
                      ))
                    ) : (
                      field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input type="radio" name={field.id} disabled className="w-4 h-4 text-blue-600 border-gray-300" />
                          <span className="text-gray-800">{option}</span>
                        </div>
                      ))                    )}
                  </div>
                )}                {field.type === "email" && (
                  <Input type="email" placeholder={field.placeholder} disabled className="border-gray-200 text-gray-700 bg-white" />
                )}

                {field.type === "number" && (
                  <Input type="number" placeholder={field.placeholder} disabled className="border-gray-200 text-gray-700 bg-white" />
                )}

                {field.type === "date" && (
                  <Input type="date" disabled className="border-gray-200 text-gray-700 bg-white" />
                )}

                {field.type === "image" && (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium">Click to upload image</p>
                        <p className="text-gray-500 text-sm">or drag and drop</p>
                        <p className="text-gray-400 text-xs">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
                  Framework Details
                </h3>
                <p className="text-gray-600 mt-1">Configure your compliance framework settings and parameters</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-gray-800 font-semibold text-lg">Framework Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    id="title" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., SOX Compliance, GDPR Data Protection, ISO 27001 Security" 
                    required 
                    className="h-14 border-gray-200 focus:border-blue-500 focus:ring-blue-200 bg-white/90 backdrop-blur-sm text-gray-900 text-lg font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl pointer-events-none"></div>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600">Choose a descriptive name that clearly identifies the compliance standard or regulation this framework addresses</p>                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-gray-800 font-semibold text-lg">Description</Label>
                <div className="relative">
                  <textarea 
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of what this framework is for"
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
                    <p className="text-gray-700 font-medium">Your framework will be created and ready for configuration</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">You can add forms, checklists, and compliance requirements</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Team members can be assigned and workflows configured</p>
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
            <div className="flex gap-2">              <Button 
                type="button" 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 bg-white font-medium"
              >
                <Eye size={16} className="mr-2 text-blue-600" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button 
                type="button" 
                onClick={addField} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Add Field
              </Button>
            </div>
          </div>          {fields.map((field, index) => (
            <Card key={field.id} className="border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900">Field {index + 1}</h4>                  <Button 
                    type="button" 
                    onClick={() => removeField(index)}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 bg-white font-medium"
                  >
                    <Minus size={16} className="text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-800 font-medium">Field Type</Label>                    <select 
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors bg-white text-gray-900"
                    ><option value="text">Text Input</option>
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
                    <Label className="text-gray-800 font-medium">Field Label</Label>                    <Input 
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Field label"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900"
                    />
                  </div>
                </div>                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-800 font-medium">Placeholder Text</Label>                    <Input 
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900"
                    />
                  </div>
                    <div className="flex items-center gap-2 pt-6">
                    <div 
                      onClick={() => updateField(index, { required: !field.required })}
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
                    <Label className="text-gray-800 font-medium cursor-pointer" onClick={() => updateField(index, { required: !field.required })}>Required Field</Label>
                  </div>
                </div>
                
                {/* Scoring Options */}
                <div className="space-y-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                    </div>
                    Scoring Options
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">Weightage (optional)</Label>                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        value={field.weightage || ""}
                        onChange={(e) => updateField(index, { weightage: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="e.g., 10, 5.5"
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900"
                      />
                      <p className="text-xs text-gray-600">Numerical weight for scoring</p>
                    </div>
                      <div className="flex items-center gap-2 pt-6">
                      <div 
                        onClick={() => updateField(index, { autoFail: !field.autoFail })}
                        className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                          field.autoFail 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {field.autoFail && (
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="cursor-pointer" onClick={() => updateField(index, { autoFail: !field.autoFail })}>
                        <Label className="text-gray-800 font-medium cursor-pointer">Auto-fail</Label>
                        <p className="text-xs text-red-600">Failing this field fails entire audit</p>
                      </div>
                    </div>
                  </div>
                </div>                  {(field.type === "select" || field.type === "radio") && (
                  <div className="space-y-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-800 font-medium">
                        Options
                        {shouldUseEnhancedOptions(field) && (
                          <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-2 py-1 rounded-full">(Enhanced)</span>
                        )}
                      </Label>                      <Button 
                        type="button" 
                        onClick={() => shouldUseEnhancedOptions(field) ? addEnhancedOption(index) : addOption(index)}
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 bg-white font-medium"
                      >
                        <Plus size={16} className="mr-1 text-blue-600" />
                        Add Option
                      </Button>
                    </div>
                    
                    {shouldUseEnhancedOptions(field) ? (
                      // Enhanced options with scoring and pass/fail
                      field.enhancedOptions?.map((option, optIndex) => (
                        <div key={optIndex} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                          <div className="flex gap-2">                            <Input 
                              value={option.value}
                              onChange={(e) => updateEnhancedOption(index, optIndex, { value: e.target.value })}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900"
                            />                            <Button 
                              type="button" 
                              onClick={() => removeEnhancedOption(index, optIndex)}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 bg-white font-medium"
                            >
                              <Minus size={16} className="text-red-500" />
                            </Button>
                          </div>
                          
                          {field.weightage !== undefined && field.weightage > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-gray-700 font-medium">Points</Label>                                <Input 
                                  type="number"
                                  value={option.points || ""}
                                  onChange={(e) => updateEnhancedOption(index, optIndex, { 
                                    points: e.target.value ? parseFloat(e.target.value) : 0 
                                  })}
                                  placeholder="0"
                                  className="text-xs border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900"
                                />
                              </div>
                            </div>
                          )}
                            {field.autoFail && (
                            <div className="flex items-center gap-2">
                              <div
                                onClick={() => updateEnhancedOption(index, optIndex, { isFailOption: !option.isFailOption })}
                                className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                  option.isFailOption 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'bg-white border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {option.isFailOption && (
                                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <Label className="text-xs text-red-600 font-medium cursor-pointer" onClick={() => updateEnhancedOption(index, optIndex, { isFailOption: !option.isFailOption })}>
                                Auto-fail option (selecting this fails the audit)
                              </Label>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      // Simple options (backward compatibility)
                      field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2">                          <Input 
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-200 bg-white text-gray-900"
                          />                          <Button 
                            type="button" 
                            onClick={() => removeOption(index, optIndex)}
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
                )}</div>
            </Card>
          ))}
            {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">              <div className="flex flex-col items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium mb-2">No fields added yet</p>
                <p className="text-gray-600 text-sm mb-4">Start building your form by adding your first field</p>
                <Button 
                  type="button" 
                  onClick={addField}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Field
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {renderPreview()}
      </CardContent>        <CardFooter className="relative bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30 backdrop-blur-lg border-t border-white/50 p-8">
        <div className="flex justify-between items-center w-full">
          <Link 
            href={`/protected/compliance/${complianceId}/forms`} 
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </CardFooter>
    </form>
  );
}