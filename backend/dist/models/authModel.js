"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupWithEmail = signupWithEmail;
exports.loginWithEmail = loginWithEmail;
exports.logout = logout;
exports.resetPassword = resetPassword;
exports.updateUserPassword = updateUserPassword;
exports.processAuthCode = processAuthCode;
exports.getSession = getSession;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.updateUserMetadata = updateUserMetadata;
exports.performPasswordResetWithToken = performPasswordResetWithToken;
const supabase_1 = require("../config/supabase");
/**
 * Authentication Model
 * Handles direct interactions with Supabase Auth
 */
/**
 * Create a new user account
 */
function signupWithEmail(email_1, password_1) {
    return __awaiter(this, arguments, void 0, function* (email, password, displayName = '', role = 'user', fullName = '') {
        try {
            // Create user in Supabase Auth
            const { data: authData, error: authError } = yield supabase_1.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                        role: role, // Add role to user metadata during signup
                    },
                },
            });
            if (authError) {
                console.error('Error signing up:', authError.message);
                return { data: null, error: { message: authError.message || 'Error during sign up' } };
            }
            if (!authData.user) {
                return { data: null, error: { message: 'User data not returned after sign up' } };
            }
            // Create a corresponding user profile in the public.users table
            const actualFullName = fullName.trim() ? fullName : displayName;
            const { error: profileError } = yield supabase_1.supabaseClient
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email: authData.user.email,
                    display_name: displayName,
                    full_name: actualFullName, // Use actualFullName
                    role: role, // Persist role in users table
                }]);
            if (profileError) {
                console.error('Error creating user profile:', profileError.message);
                // Optionally, handle rollback or cleanup if profile creation fails
                return { data: null, error: { message: profileError.message || 'Error creating user profile' } };
            }
            return { data: authData, error: null };
        }
        catch (error) {
            console.error('Unexpected error in signupWithEmail:', error.message);
            return { data: null, error: { message: error.message || 'Failed to sign up' } };
        }
    });
}
/**
 * Log in with email and password
 */
function loginWithEmail(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supabase_1.supabaseClient.auth.signInWithPassword({ email, password });
    });
}
/**
 * Log out current session
 */
function logout(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token) {
            return yield supabase_1.supabaseClient.auth.signOut({ scope: 'global' });
        }
        return yield supabase_1.supabaseClient.auth.signOut();
    });
}
/**
 * Request password reset email
 */
function resetPassword(email, redirectUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supabase_1.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${redirectUrl}/auth/reset-password`
        });
    });
}
/**
 * Update user's password
 */
function updateUserPassword(password, token) {
    return __awaiter(this, void 0, void 0, function* () {
        // If token is provided, use it to authenticate the request
        if (token) {
            // Set the auth token for this request
            const supabase = supabase_1.supabaseClient;
            // Update the user's password
            return yield supabase.auth.updateUser({ password });
        }
        // Without token, this will use the current session
        return yield supabase_1.supabaseClient.auth.updateUser({ password });
    });
}
/**
 * Process authentication code from URL
 */
function processAuthCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield supabase_1.supabaseClient.auth.exchangeCodeForSession(code);
        }
        catch (error) {
            return { data: null, error: { message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to process authentication code' } };
        }
    });
}
/**
 * Get the current session
 */
function getSession(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token) {
            // Get session using the token
            return yield supabase_1.supabaseClient.auth.getSession();
        }
        // Without token, use the current session
        return yield supabase_1.supabaseClient.auth.getSession();
    });
}
/**
 * Get authenticated user
 */
function getAuthenticatedUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token) {
            // Get user using the token
            return yield supabase_1.supabaseClient.auth.getUser(token);
        }
        // Without token, use the current session
        return yield supabase_1.supabaseClient.auth.getUser();
    });
}
/**
 * Update user metadata
 */
function updateUserMetadata(metadata, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token) {
            // Set the auth token for this request
            const supabase = supabase_1.supabaseClient;
            // Update the user's metadata
            return yield supabase.auth.updateUser({ data: metadata });
        }
        // Without token, this will use the current session
        return yield supabase_1.supabaseClient.auth.updateUser({ data: metadata });
    });
}
// This function is a placeholder for resetting password with a custom token.
// Supabase's primary password reset flow involves an email link that authenticates the user.
// If you are managing custom tokens, you'll need to implement the verification
// and user update logic, possibly using Supabase admin privileges if not in user context.
function performPasswordResetWithToken(token, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        console.warn('performPasswordResetWithToken is a placeholder. Supabase password reset via API with a custom token requires specific implementation for token validation and user update, potentially using admin rights.');
        // Example: If you had a table `password_reset_tokens` with `token`, `user_id`, `expires_at`
        // 1. Verify token: SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()
        // 2. If valid, update user: supabaseClient.auth.admin.updateUserById(user_id, { password: newPassword })
        //    (This requires service_role key and running on the backend)
        // 3. Invalidate or delete the token.
        // For now, returning a dummy success to allow controller to compile.
        // Replace with actual implementation.
        try {
            // Simulate an update or call a non-existent admin function for structure
            // const { data, error } = await supabaseClient.auth.admin.updateUserById(USER_ID_FROM_TOKEN, { password: newPassword });
            // if (error) return { error: { message: error.message } };
            // return { error: null };
            console.log(`Attempting to reset password with token: ${token} and new password.`);
            // This is where you would integrate with a custom token verification and password update mechanism.
            // Since Supabase client SDK doesn't directly support this for a generic token without an active session from a reset link,
            // this function would typically involve backend logic interacting with your database (for token verification)
            // and potentially Supabase Admin API for updating the user password if not in an authenticated user session context.
            return { error: { message: 'Password reset with custom token not fully implemented.' } }; // Placeholder response
        }
        catch (e) {
            return { error: { message: e.message || 'Error performing password reset with token.' } };
        }
    });
}
