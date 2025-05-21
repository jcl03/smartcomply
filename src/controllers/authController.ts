import { signupWithEmail, loginWithEmail, logout, resetPassword, verifySession, updateUserPassword, processAuthCode } from '@/models/authModel';

export async function handleSignupController(email: string, password: string) {
  // You can add controller-specific logic here if needed
  return await signupWithEmail(email, password);
}

export async function handleLoginController(email: string, password: string) {
  // You can add controller-specific logic here if needed
  return await loginWithEmail(email, password);
}

export async function handleLogoutController() {
  // You can add controller-specific logic here if needed
  return await logout();
}

export async function handlePasswordResetController(email: string) {
  // You can add controller-specific logic here if needed
  return await resetPassword(email);
}

export async function verifyResetTokenController() {
  // Controller for verifying if a reset token/session is valid
  return await verifySession();
}

export async function updatePasswordController(password: string) {
  // Validation in controller layer
  if (password.length < 6) {
    return { error: { message: 'Password must be at least 6 characters' } };
  }
  
  // Controller passes validated data to model
  return await updateUserPassword(password);
}

export async function processAuthCodeController() {
  try {
    // Process auth code through the model
    await processAuthCode();
    return { success: true };
  } catch (error: any) {
    return { success: false, error };
  }
}

