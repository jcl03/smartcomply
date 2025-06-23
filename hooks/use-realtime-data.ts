'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface RealtimeData {
  audits: any[];
  checklistResponses: any[];
  compliance: any[];
  userProfiles: any[];
  lastUpdated: Date;
}

export function useRealtimeData(initialData: any) {
  const [data, setData] = useState<RealtimeData>({
    ...initialData,
    lastUpdated: new Date() // Ensure we always have a valid date
  });
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Set up real-time subscriptions
    const auditChannel = supabase
      .channel('audit_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'audit' }, 
        (payload) => {
          console.log('Audit change:', payload);
          setData(prev => ({
            ...prev,
            audits: updateArray(prev.audits, payload),
            lastUpdated: new Date()
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    const complianceChannel = supabase
      .channel('compliance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'compliance' }, 
        (payload) => {
          console.log('Compliance change:', payload);
          setData(prev => ({
            ...prev,
            compliance: updateArray(prev.compliance, payload),
            lastUpdated: new Date()
          }));
        }
      )
      .subscribe();

    const checklistChannel = supabase
      .channel('checklist_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'checklist_responses' }, 
        (payload) => {
          console.log('Checklist change:', payload);
          setData(prev => ({
            ...prev,
            checklistResponses: updateArray(prev.checklistResponses, payload),
            lastUpdated: new Date()
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(auditChannel);
      supabase.removeChannel(complianceChannel);
      supabase.removeChannel(checklistChannel);
    };
  }, []);

  const updateArray = (array: any[], payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        return [newRecord, ...array];
      case 'UPDATE':
        return array.map(item => 
          item.id === newRecord.id ? { ...item, ...newRecord } : item
        );
      case 'DELETE':
        return array.filter(item => item.id !== oldRecord.id);
      default:
        return array;
    }
  };

  return { data, isConnected };
}
