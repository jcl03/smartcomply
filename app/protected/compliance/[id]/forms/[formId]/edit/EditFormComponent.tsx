"use client";

import { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, Sparkles, AlertCircle, CheckCircle, FileText, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateForm } from "../../../../actions";
import type { ActionResult } from "@/lib/types";

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
      setFields(form.form_schema.fields || []);
    }
  }, [form]);
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
    
    return (
      <Card className="mt-6 border-sky-200 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
          <CardTitle className="text-sky-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-sky-600" />
            Form Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {formTitle && <h3 className="text-lg font-semibold text-sky-900">{formTitle}</h3>}
            {formDescription && <p className="text-sky-600">{formDescription}</p>}
              {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>                  {field.weightage && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
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
                  <Input placeholder={field.placeholder} disabled />
                )}
                
                {field.type === "textarea" && (
                  <textarea 
                    className="w-full p-2 border rounded-md" 
                    placeholder={field.placeholder}
                    disabled
                    rows={3}
                  />
                )}
                  {field.type === "select" && (
                  <select className="w-full p-2 border rounded-md" disabled>
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
                )}                  {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border-2 bg-white border-sky-300 flex items-center justify-center opacity-60">
                      {/* Disabled checkbox appearance for preview */}
                    </div>
                    <span className="text-sky-900">{field.label}</span>
                  </div>
                )}
                
                {field.type === "radio" && (
                  <div className="space-y-2">
                    {shouldUseEnhancedOptions(field) ? (                      field.enhancedOptions?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={field.id} 
                            disabled 
                            className="h-4 w-4 border-2 border-sky-300 text-sky-600 bg-white focus:ring-2 focus:ring-sky-200 focus:ring-offset-0 checked:bg-sky-600 checked:border-sky-600"
                          />
                          <span className="flex items-center gap-2 text-sky-900">
                            {option.value}
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
                    ) : (                      field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={field.id} 
                            disabled 
                            className="h-4 w-4 border-2 border-sky-300 text-sky-600 bg-white focus:ring-2 focus:ring-sky-200 focus:ring-offset-0 checked:bg-sky-600 checked:border-sky-600"
                          />
                          <span className="text-sky-900">{option}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {field.type === "email" && (
                  <Input type="email" placeholder={field.placeholder} disabled />
                )}
                
                {field.type === "number" && (
                  <Input type="number" placeholder={field.placeholder} disabled />
                )}
                
                {field.type === "date" && (
                  <Input type="date" disabled />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
              <Button 
                type="button" 
                onClick={addField} 
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Add Field
              </Button>
            </div>
          </div>          
          {fields.map((field, index) => (
            <Card key={field.id} className="border-sky-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between bg-sky-50/50 rounded-lg p-3 border border-sky-100">
                  <h4 className="font-semibold text-sky-900">Field {index + 1}</h4>
                  <Button 
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
                    <Label className="text-sky-800 font-medium">Field Type</Label>                    <select 
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      className="w-full p-3 border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-colors bg-white text-sky-900"
                    >
                      <option value="text">Text Input</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                    <div className="space-y-2">
                    <Label className="text-sky-800 font-medium">Field Label</Label>
                    <Input 
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Field label"
                      className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                    />
                  </div>
                </div>
                  <div className="grid grid-cols-2 gap-4">                  <div className="space-y-2">
                    <Label className="text-sky-800 font-medium">Placeholder Text</Label>
                    <Input 
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                      className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                    />
                  </div>                    <div className="flex items-center gap-2 pt-6">
                    <div 
                      onClick={() => updateField(index, { required: !field.required })}
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
                    <Label className="text-sky-800 font-medium cursor-pointer" onClick={() => updateField(index, { required: !field.required })}>Required Field</Label>
                  </div>
                </div>
                  {/* Scoring Options */}
                <div className="space-y-4 bg-sky-50/20 rounded-lg p-3 border border-sky-100">
                  <h5 className="text-sm font-medium text-sky-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Scoring Options
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sky-800 font-medium">Weightage (optional)</Label>                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        value={field.weightage || ""}
                        onChange={(e) => updateField(index, { weightage: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="e.g., 10, 5.5"
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                      />
                      <p className="text-xs text-sky-600">Numerical weight for scoring</p>
                    </div>                      <div className="flex items-center gap-2 pt-6">
                      <div 
                        onClick={() => updateField(index, { autoFail: !field.autoFail })}
                        className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                          field.autoFail 
                            ? 'bg-sky-600 border-sky-600' 
                            : 'bg-white border-sky-300 hover:border-sky-400'
                        }`}
                      >
                        {field.autoFail && (
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="cursor-pointer" onClick={() => updateField(index, { autoFail: !field.autoFail })}>
                        <Label className="text-sky-800 font-medium cursor-pointer">Auto-fail</Label>
                        <p className="text-xs text-sky-600">Failing this field fails entire audit</p>
                      </div>
                    </div>
                  </div>
                </div>
                  {(field.type === "select" || field.type === "radio") && (                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sky-800 font-medium">
                        Options
                        {shouldUseEnhancedOptions(field) && (
                          <span className="text-xs text-sky-600 ml-2 bg-sky-100 px-2 py-1 rounded-full">(Enhanced)</span>
                        )}
                      </Label>
                      <Button 
                        type="button" 
                        onClick={() => shouldUseEnhancedOptions(field) ? addEnhancedOption(index) : addOption(index)}
                        variant="outline"
                        size="sm"
                        className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-800 bg-white font-medium"
                      >
                        <Plus size={16} className="mr-1 text-sky-600" />
                        Add Option
                      </Button>
                    </div>
                      {shouldUseEnhancedOptions(field) ? (
                      // Enhanced options with scoring and pass/fail
                      field.enhancedOptions?.map((option, optIndex) => (
                        <div key={optIndex} className="border border-sky-200 rounded-lg p-3 space-y-2 bg-white/80">
                          <div className="flex gap-2">                            <Input 
                              value={option.value}
                              onChange={(e) => updateEnhancedOption(index, optIndex, { value: e.target.value })}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                            />
                            <Button 
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
                                <Label className="text-xs text-sky-800 font-medium">Points</Label>                                <Input 
                                  type="number"
                                  value={option.points || ""}
                                  onChange={(e) => updateEnhancedOption(index, optIndex, { 
                                    points: e.target.value ? parseFloat(e.target.value) : 0 
                                  })}
                                  placeholder="0"
                                  className="text-xs border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                                />
                              </div>
                            </div>
                          )}                            {field.autoFail && (
                            <div className="flex items-center gap-2">
                              <div
                                onClick={() => updateEnhancedOption(index, optIndex, { isFailOption: !option.isFailOption })}
                                className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                  option.isFailOption 
                                    ? 'bg-sky-600 border-sky-600' 
                                    : 'bg-white border-sky-300 hover:border-sky-400'
                                }`}
                              >
                                {option.isFailOption && (
                                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <Label className="text-xs text-red-600 font-medium">
                                Auto-fail option (selecting this fails the audit)
                              </Label>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (                      // Simple options (backward compatibility)
                      field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2">                          <Input 
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400"
                          />
                          <Button 
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
                )}
              </div>
            </Card>
          ))}
            {fields.length === 0 && (
            <div className="text-center py-12 px-6 border-2 border-dashed border-sky-200 bg-sky-50/30 rounded-lg">
              <div className="bg-sky-100 p-3 rounded-full mx-auto w-fit mb-4">
                <Plus className="h-6 w-6 text-sky-600" />
              </div>
              <p className="text-sky-600 mb-4 font-medium">No fields added yet</p>
              <p className="text-sky-500 text-sm mb-6">Start building your form by adding your first field</p>
              <Button 
                type="button" 
                onClick={addField}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Field
              </Button>
            </div>
          )}
        </div>
        
        {renderPreview()}
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
