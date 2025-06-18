import { Check, X, Upload, CheckCircle, FileText, Mail, Calendar, Image, Hash } from "lucide-react";

interface FormFieldOption {
  value: string;
  points?: number;
  isFailOption?: boolean;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  enhancedOptions?: FormFieldOption[];
  weightage?: number;
  autoFail?: boolean;
  isSection?: boolean;
}

interface FormSchema {
  title?: string;
  description?: string;
  fields?: FormField[];
}

interface FormPreviewProps {
  schema: FormSchema;
  className?: string;
}

export function FormPreview({ schema, className = "" }: FormPreviewProps) {
  const fields = schema.fields || [];

  // Group fields by sections
  const sections: { [key: string]: FormField[] } = {};
  let currentSection = '';
  
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

  // If no sections exist, create a default section for orphaned fields
  if (Object.keys(sections).length === 0 && fields.filter(f => !f.isSection).length > 0) {
    sections['default'] = fields.filter(f => !f.isSection);
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-600" />;
      case 'number':
        return <Hash className="w-4 h-4 text-purple-600" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case 'image':
        return <Image className="w-4 h-4 text-pink-600" />;
      case 'select':
      case 'radio':
        return <CheckCircle className="w-4 h-4 text-indigo-600" />;
      case 'checkbox':
        return <Check className="w-4 h-4 text-teal-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text Input';
      case 'textarea':
        return 'Text Area';
      case 'email':
        return 'Email';
      case 'number':
        return 'Number';
      case 'date':
        return 'Date';
      case 'image':
        return 'Image Upload';
      case 'select':
        return 'Dropdown';
      case 'radio':
        return 'Radio Buttons';
      case 'checkbox':
        return 'Checkbox';
      default:
        return 'Input';
    }
  };

  const renderFieldPreview = (field: FormField) => {
    const options = field.enhancedOptions || field.options?.map(opt => ({ value: opt })) || [];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <input 
              type={field.type} 
              placeholder={field.placeholder || `Enter ${field.type}`}
              className="w-full p-2 border border-gray-200 rounded text-sm"
              disabled
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <textarea 
              placeholder={field.placeholder || "Enter text"}
              className="w-full p-2 border border-gray-200 rounded text-sm"
              rows={3}
              disabled
            />
          </div>
        );
      
      case 'date':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <input 
              type="date" 
              className="w-full p-2 border border-gray-200 rounded text-sm"
              disabled
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
            <p className="text-gray-600 text-xs">Click to upload or drag image here</p>
          </div>
        );
      
      case 'select':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <select className="w-full p-2 border border-gray-200 rounded text-sm" disabled>
              <option>Select an option...</option>
              {options.map((option, index) => {
                const enhancedOption = option as FormFieldOption;
                return (
                  <option key={index} value={enhancedOption.value}>
                    {enhancedOption.value}
                    {enhancedOption.points !== undefined && ` (${enhancedOption.points} pts)`}
                    {enhancedOption.isFailOption && ' [FAIL]'}
                  </option>
                );
              })}
            </select>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const enhancedOption = option as FormFieldOption;
              return (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name={`field-${field.id}`} 
                    value={enhancedOption.value}
                    className="text-blue-600"
                    disabled
                  />
                  <span className="text-sm">{enhancedOption.value}</span>
                  {enhancedOption.points !== undefined && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                      {enhancedOption.points} pts
                    </span>
                  )}
                  {enhancedOption.isFailOption && (
                    <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                      Auto-fail
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      
      case 'checkbox':
        if (options.length === 0) {
          return (
            <div className="flex items-center gap-2">
              <input type="checkbox" className="text-blue-600" disabled />
              <span className="text-sm">{field.label}</span>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              {options.map((option, index) => {
                const enhancedOption = option as FormFieldOption;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      value={enhancedOption.value}
                      className="text-blue-600"
                      disabled
                    />
                    <span className="text-sm">{enhancedOption.value}</span>
                    {enhancedOption.points !== undefined && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        {enhancedOption.points} pts
                      </span>
                    )}
                    {enhancedOption.isFailOption && (
                      <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                        Auto-fail
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
      
      default:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <p className="text-gray-600 text-xs">Input field</p>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {schema.title && (
        <h3 className="text-lg font-medium">{schema.title}</h3>
      )}
      {schema.description && (
        <p className="text-muted-foreground text-sm">{schema.description}</p>
      )}
      
      {/* Display sections if available */}
      {Object.keys(sections).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(sections).map(([sectionId, sectionFields]) => {
            const sectionField = fields.find(f => f.id === sectionId);
            return (
              <div key={sectionId} className="space-y-3">
                {sectionField && (
                  <h4 className="text-md font-medium text-primary border-b pb-1">
                    {sectionField.label || 'Section'}
                  </h4>
                )}
                <div className="space-y-2">
                  {sectionFields.map((field, index) => (
                    <div 
                      key={field.id || index} 
                      className="flex items-start gap-3 p-2 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getFieldIcon(field.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </p>
                          <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                            {getFieldTypeLabel(field.type)}
                          </span>
                        </div>
                        
                        {/* Preview how it will look for users */}
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          {renderFieldPreview(field)}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {field.weightage && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                              Weight: {field.weightage}
                            </span>
                          )}
                          {field.autoFail && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                              <X size={10} />
                              Auto-fail
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No form fields found</p>
      )}
    </div>
  );
} 