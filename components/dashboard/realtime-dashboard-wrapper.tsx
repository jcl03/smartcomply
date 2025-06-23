'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Database, Activity, TestTube } from 'lucide-react';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import RealtimeStatus from './realtime-status';
import { 
  processComplianceSummaryData,
  processComplianceTrendsData
} from "@/utils/dashboard-utils";
import ComplianceSummary from './compliance-summary';
import ComplianceTrendsChart from './compliance-trends-chart';

interface RealtimeDashboardWrapperProps {
  initialDashboardData: any;
  userRole: string;
  userProfile: any;
}

export default function RealtimeDashboardWrapper({ 
  initialDashboardData, 
  userRole, 
  userProfile 
}: RealtimeDashboardWrapperProps) {
  const { data, isConnected } = useRealtimeData(initialDashboardData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  // Process real-time data
  const complianceSummaryData = processComplianceSummaryData(
    data.audits, 
    data.checklistResponses, 
    data.compliance
  );

  const complianceTrendsData = processComplianceTrendsData(
    data.audits, 
    data.checklistResponses
  );

  // Test functions to add sample data
  const addTestCompliance = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase
        .from('compliance')
        .insert([
          {
            name: `Test Framework ${Date.now()}`,
            description: 'Real-time test framework',
            status: 'active',
          }
        ]);

      if (error) throw error;
      setMessage('✅ Test compliance framework added! Check real-time updates.');
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Failed to add test data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addTestAudit = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Get a compliance framework first
      const { data: compliance } = await supabase
        .from('compliance')
        .select('id')
        .limit(1);

      if (!compliance || compliance.length === 0) {
        throw new Error('No compliance frameworks found. Add one first.');
      }

      const { error } = await supabase
        .from('audit')
        .insert([
          {
            compliance_id: compliance[0].id,
            status: 'pending',
            notes: 'Real-time test audit',
          }
        ]);

      if (error) throw error;
      setMessage('✅ Test audit added! Check real-time updates.');
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Failed to add test audit: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Real-time Status Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Real-time Dashboard</h3>
            <p className="text-sm text-blue-600">Live data updates from Supabase</p>
          </div>
        </div>
        <RealtimeStatus isConnected={isConnected} lastUpdated={data.lastUpdated || new Date()} />
      </div>

      {/* Test Panel for Demo */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <TestTube className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">Real-time Test Panel</h3>
            <p className="text-sm text-emerald-600">Add test data to see live updates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Button
            onClick={addTestCompliance}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Test Framework
          </Button>

          <Button
            onClick={addTestAudit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Test Audit
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </Card>

      {/* Live Dashboard Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ComplianceSummary data={complianceSummaryData} userRole={userRole} />
        <ComplianceTrendsChart data={complianceTrendsData} />
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{data.compliance.length}</p>
              <p className="text-sm text-blue-600">Frameworks</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{data.audits.length}</p>
              <p className="text-sm text-emerald-600">Audits</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TestTube className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{data.checklistResponses.length}</p>
              <p className="text-sm text-purple-600">Responses</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">
                {Math.round(complianceSummaryData.complianceRate)}%
              </p>
              <p className="text-sm text-amber-600">Compliance Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
