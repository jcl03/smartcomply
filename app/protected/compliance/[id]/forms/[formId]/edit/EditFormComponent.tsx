"use client";

import { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye } from "lucide-react";
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
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Update Form"}
    </Button>
  );
}

type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
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
      placeholder: ""
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formTitle && <h3 className="text-lg font-semibold">{formTitle}</h3>}
            {formDescription && <p className="text-muted-foreground">{formDescription}</p>}
            
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                
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
                    {field.options?.map((option, optIndex) => (
                      <option key={optIndex} value={option}>{option}</option>
                    ))}
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
                    {field.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input type="radio" name={field.id} disabled />
                        <span>{option}</span>
                      </div>
                    ))}
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
                
                {(field.type === "select" || field.type === "radio") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      <Button 
                        type="button" 
                        onClick={() => addOption(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Option
                      </Button>
                    </div>
                    
                    {field.options?.map((option, optIndex) => (
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
                    ))}
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
