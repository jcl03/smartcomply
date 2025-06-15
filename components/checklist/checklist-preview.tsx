import { Check, X, Upload, CheckCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string; // The title/name of the item (e.g., "Water filter replacement record")
  type: 'document' | 'yesno' | 'checkbox'; // Either document upload, yes/no selection, or checkbox options
  required: boolean;
  category?: string;
  options?: string[];
}

interface ChecklistSchema {
  title?: string;
  description?: string;
  items: ChecklistItem[];
}

interface ChecklistPreviewProps {
  schema: ChecklistSchema;
  className?: string;
}

export function ChecklistPreview({ schema, className = "" }: ChecklistPreviewProps) {
  // Group items by category if they have categories
  const groupedItems = schema.items?.reduce((acc: any, item: ChecklistItem) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className={`space-y-4 ${className}`}>
      {schema.title && (
        <h3 className="text-lg font-medium">{schema.title}</h3>
      )}
      {schema.description && (
        <p className="text-muted-foreground text-sm">{schema.description}</p>
      )}
      
      {Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium text-primary border-b pb-1">
                {category}
              </h4>              <div className="space-y-2">
                {(items as ChecklistItem[]).map((item, index) => (
                  <div 
                    key={item.id || index} 
                    className="flex items-start gap-3 p-2 border rounded hover:bg-muted/50 transition-colors"
                  >                    <div className="flex-shrink-0 mt-0.5">
                      {item.type === 'document' ? (
                        <Upload className="w-4 h-4 text-green-600" />
                      ) : item.type === 'checkbox' ? (
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          item.type === 'document' ? 'bg-green-100 text-green-800' :
                          item.type === 'checkbox' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type === 'document' ? 'Upload Document' : 
                           item.type === 'checkbox' ? 'Multiple Choice' : 'Yes/No'}
                        </span>
                      </div>
                        {/* Preview how it will look for users */}
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {item.type === 'document' ? (
                          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
                            <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                            <p className="text-gray-600">Click to upload or drag file here</p>
                          </div>
                        ) : item.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {item.options && item.options.length > 0 ? (
                              item.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" className="text-purple-600" />
                                  <span>{option || `Option ${optionIndex + 1}`}</span>
                                </label>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">No options defined</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`preview_${item.id}`} className="text-blue-600" />
                              <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`preview_${item.id}`} className="text-blue-600" />
                              <span>No</span>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {item.required ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            <X size={10} />
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            <Check size={10} />
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No checklist items found</p>
      )}
    </div>
  );
}
