import AiChatbot from '@/components/ai-chatbot';
import CompactAiChat from '@/components/compact-ai-chat';
import AuditRecommendations from '@/components/audit/audit-recommendations';
import { Card } from '@/components/ui/card';

export default function AiDemoPage() {
  const sampleAuditData = {
    title: "Information Security Compliance Audit",
    status: "rejected",
    findings: [
      "Weak password policy implementation",
      "Missing multi-factor authentication",
      "Incomplete security logging",
      "Outdated access control procedures"
    ],
    riskLevel: "high",
    complianceArea: "Information Security"
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sky-900">AI Chatbot Demo</h1>
        <p className="text-sky-700 mt-2">
          This page demonstrates the AI chatbot and audit recommendations features.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-sky-900 mb-4">Global AI Chatbot</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              The AI chatbot is available on all protected pages via the floating chat button 
              in the bottom right corner. It provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>General compliance guidance</li>
              <li>Audit preparation assistance</li>
              <li>Risk assessment support</li>
              <li>Best practices recommendations</li>
              <li>Context-aware responses based on user role and page</li>
            </ul>
            <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
              <p className="text-sm text-sky-700">
                <strong>Try it now:</strong> Click the large chat button in the bottom right corner 
                and ask about compliance best practices!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-sky-900 mb-4">Compact AI Assistant</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              The compact AI assistant can be embedded directly into specific pages 
              for focused assistance. Try the live demo below:
            </p>
            <CompactAiChat 
              context="AI Demo Page - Compliance guidance"
              placeholder="Ask about compliance best practices..."
              height="300px"
              title="Live AI Demo"
            />
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-sky-900 mb-4">Audit Recommendations Demo</h2>
        <div className="mb-4">
          <Card className="p-4 bg-sky-50 border-sky-200">
            <p className="text-sm text-sky-700">
              <strong>About:</strong> The audit recommendations component can be integrated into audit detail pages 
              to provide AI-generated remediation suggestions for rejected audits. Below is a live demo with sample data.
            </p>
          </Card>
        </div>
        <AuditRecommendations auditData={sampleAuditData} />
      </div>

      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
          <h3 className="text-lg font-semibold text-sky-900 mb-2">Setup Required</h3>
          <p className="text-sky-700 mb-4">
            To use the AI features, you need to set up your Gemini API key:
          </p>
          <ol className="list-decimal list-inside text-sky-700 space-y-2">
            <li>Get your API key from <a href="https://aistudio.google.com/app/apikey" className="text-sky-600 hover:text-sky-800 underline" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Add it to your <code className="bg-sky-100 px-2 py-1 rounded text-sm">.env.local</code> file as <code className="bg-sky-100 px-2 py-1 rounded text-sm">GEMINI_API_KEY=your_key_here</code></li>
            <li>Restart your development server</li>
          </ol>
          <p className="text-sm text-sky-600 mt-4">
            See <code className="bg-sky-100 px-2 py-1 rounded">AI_CHATBOT_SETUP.md</code> for detailed instructions.
          </p>
        </Card>
      </div>
    </div>
  );
}
