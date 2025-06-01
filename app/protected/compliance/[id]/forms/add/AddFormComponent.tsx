"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye } from "lucide-react";
import type { ActionResult } from "@/lib/types";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Form"}
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formTitle && <h3 className="text-lg font-semibold">{formTitle}</h3>}
            {formDescription && <p className="text-muted-foreground">{formDescription}</p>}
            
            {fields.map((field, index) => (              <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label>
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
                )}
                
                {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled />
                    <span>{field.label}</span>
                  </div>
                )}
                
                {field.type === "radio" && (
                  <div className="space-y-2">
                    {shouldUseEnhancedOptions(field) ? (
                      field.enhancedOptions?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input type="radio" name={field.id} disabled />
                          <span className="flex items-center gap-2">
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
                    ) : (
                      field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input type="radio" name={field.id} disabled />
                          <span>{option}</span>
                        </div>
                      ))
                    )}
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
    <form action={clientAction}>
      <CardContent className="space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}
        
        {/* Form Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Form Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input 
              id="title" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., SOX Controls Assessment" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Form Description</Label>
            <textarea 
              id="description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of what this form is for"
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Form Fields</h3>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setShowPreview(!showPreview)} variant="outline">
                <Eye size={16} className="mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button type="button" onClick={addField} variant="outline">
                <Plus size={16} className="mr-2" />
                Add Field
              </Button>
            </div>
          </div>
          
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Field {index + 1}</h4>
                  <Button 
                    type="button" 
                    onClick={() => removeField(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Minus size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <select 
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      className="w-full p-2 border rounded-md"
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
                    <Label>Field Label</Label>
                    <Input 
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Field label"
                    />
                  </div>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Placeholder Text</Label>
                    <Input 
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-6">
                    <input 
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    <Label>Required Field</Label>
                  </div>
                </div>
                
                {/* Scoring Options */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-muted-foreground">Scoring Options</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weightage (optional)</Label>
                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        value={field.weightage || ""}
                        onChange={(e) => updateField(index, { weightage: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="e.g., 10, 5.5"
                      />
                      <p className="text-xs text-muted-foreground">Numerical weight for scoring</p>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox"
                        checked={field.autoFail || false}
                        onChange={(e) => updateField(index, { autoFail: e.target.checked })}
                      />
                      <div>
                        <Label>Auto-fail</Label>
                        <p className="text-xs text-muted-foreground">Failing this field fails entire audit</p>
                      </div>
                    </div>
                  </div>
                </div>
                  {(field.type === "select" || field.type === "radio") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        Options
                        {shouldUseEnhancedOptions(field) && (
                          <span className="text-xs text-blue-600 ml-2">(Enhanced)</span>
                        )}
                      </Label>
                      <Button 
                        type="button" 
                        onClick={() => shouldUseEnhancedOptions(field) ? addEnhancedOption(index) : addOption(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Option
                      </Button>
                    </div>
                    
                    {shouldUseEnhancedOptions(field) ? (
                      // Enhanced options with scoring and pass/fail
                      field.enhancedOptions?.map((option, optIndex) => (
                        <div key={optIndex} className="border rounded-md p-3 space-y-2">
                          <div className="flex gap-2">
                            <Input 
                              value={option.value}
                              onChange={(e) => updateEnhancedOption(index, optIndex, { value: e.target.value })}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              onClick={() => removeEnhancedOption(index, optIndex)}
                              variant="outline"
                              size="sm"
                            >
                              <Minus size={16} />
                            </Button>
                          </div>
                          
                          {field.weightage !== undefined && field.weightage > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Points</Label>
                                <Input 
                                  type="number"
                                  value={option.points || ""}
                                  onChange={(e) => updateEnhancedOption(index, optIndex, { 
                                    points: e.target.value ? parseFloat(e.target.value) : 0 
                                  })}
                                  placeholder="0"
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          )}
                          
                          {field.autoFail && (
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={option.isFailOption || false}
                                onChange={(e) => updateEnhancedOption(index, optIndex, { isFailOption: e.target.checked })}
                                className="text-xs"
                              />
                              <Label className="text-xs text-red-600">
                                Auto-fail option (selecting this fails the audit)
                              </Label>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      // Simple options (backward compatibility)
                      field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2">
                          <Input 
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          <Button 
                            type="button" 
                            onClick={() => removeOption(index, optIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Minus size={16} />
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
            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground mb-4">No fields added yet</p>
              <Button type="button" onClick={addField}>
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