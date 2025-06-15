'use server';

export async function updateUserProfile(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const company = formData.get('company') as string;
  const department = formData.get('department') as string;
  const userId = formData.get('userId') as string;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/user-management/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        company,
        department,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Failed to update profile' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'An unexpected error occurred' };
  }
}
