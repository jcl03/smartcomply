import { Check, X, Upload, CheckCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string; // The title/name of the item (e.g., "Water filter replacement record")
  type: 'document' | 'yesno'; // Document upload or yes/no
  autoFail?: boolean;
}

interface ChecklistSchema {
  title?: string;
  description?: string;
  items?: ChecklistItem[];
  sections?: ChecklistSection[];
}

interface ChecklistSection {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface ChecklistPreviewProps {
  schema: ChecklistSchema;
  className?: string;
}

export function ChecklistPreview({ schema, className = "" }: ChecklistPreviewProps) {  // Handle both old format (items) and new format (sections)
  const sectionsToDisplay = schema.sections || [];
  const itemsToDisplay = schema.items || [];

  return (
    <div className={`space-y-4 ${className}`}>
      {schema.title && (
        <h3 className="text-lg font-medium">{schema.title}</h3>
      )}
      {schema.description && (
        <p className="text-muted-foreground text-sm">{schema.description}</p>
      )}
        {/* Display sections if available */}
      {sectionsToDisplay.length > 0 ? (
        <div className="space-y-6">
          {sectionsToDisplay.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className="space-y-3">
              <h4 className="text-md font-medium text-primary border-b pb-1">
                {section.name || `Section ${sectionIndex + 1}`}
              </h4>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div 
                    key={item.id || index} 
                    className="flex items-start gap-3 p-2 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {item.type === 'document' ? (
                        <Upload className="w-4 h-4 text-green-600" />
                      ) : item.type === 'yesno' ? (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          item.type === 'document' ? 'bg-green-100 text-green-800' :
                          item.type === 'yesno' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'document' ? 'Upload Document' : 
                           item.type === 'yesno' ? 'Yes/No' : 
                           'Multiple Choice'}
                        </span>
                      </div>
                      
                      {/* Preview how it will look for users */}
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {item.type === 'document' ? (
                          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
                            <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                            <p className="text-gray-600">Click to upload or drag file here</p>
                          </div>
                        ) : item.type === 'yesno' ? (
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`item-${item.id}`} value="yes" className="text-green-600" />
                              <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`item-${item.id}`} value="no" className="text-red-600" />
                              <span>No</span>
                            </label>
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {item.autoFail && (
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
          ))}
        </div>
      ) : itemsToDisplay.length > 0 ? (
        // Fallback for old format with items only  
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-md font-medium text-primary border-b pb-1">General</h4>
            <div className="space-y-2">
              {itemsToDisplay.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className="flex items-start gap-3 p-2 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.type === 'document' ? (
                      <Upload className="w-4 h-4 text-green-600" />
                    ) : item.type === 'yesno' ? (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        item.type === 'document' ? 'bg-green-100 text-green-800' :
                        item.type === 'yesno' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type === 'document' ? 'Upload Document' : 
                         item.type === 'yesno' ? 'Yes/No' : 
                         'Multiple Choice'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {item.autoFail && (
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
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No checklist items found</p>
      )}
    </div>
  );
}
