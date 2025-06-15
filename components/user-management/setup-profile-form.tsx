'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { updateUserProfile } from '@/app/protected/setup/actions';

type Profile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  company?: string;
  department?: string;
  status?: string;
};

export default function SetupProfileForm({ user, profile }: { user: User; profile: Profile | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await updateUserProfile(formData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        });
        
        // Redirect to the main protected page after successful setup
        router.push('/protected');
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={user.id} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter your first name"
            defaultValue={profile?.first_name || ''}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter your last name"
            defaultValue={profile?.last_name || ''}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ''}
            disabled
            className="bg-gray-100 dark:bg-slate-700"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Email cannot be changed
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            placeholder="Enter your company name"
            defaultValue={profile?.company || ''}
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            placeholder="Enter your department"
            defaultValue={profile?.department || ''}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save and Continue"}
        </Button>
      </div>
    </form>
  );
}
