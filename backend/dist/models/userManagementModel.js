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
exports.getUserProfile = getUserProfile;
exports.updateProfile = updateProfile;
exports.updateUserMetadata = updateUserMetadata;
exports.inviteUser = inviteUser;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;
const supabase_1 = require("../config/supabase");
/**
 * Get the user's profile data including data from profiles table
 */
function getUserProfile(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get profile data from profiles table
        const { data: profileData, error: profileError } = yield supabase_1.supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (profileError) {
            return { data: null, error: profileError };
        }
        return { data: profileData, error: null };
    });
}
/**
 * Update profile record in the profiles table
 */
function updateProfile(userId, profileData) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield supabase_1.supabaseClient
            .from('profiles')
            .update(profileData)
            .eq('user_id', userId);
    });
}
/**
 * Update user metadata (part of auth profile)
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
/**
 * Invite a user to the application
 */
function inviteUser(email, role) {
    return __awaiter(this, void 0, void 0, function* () {
        // This typically requires admin privileges to create a user
        const supabase = (0, supabase_1.getSupabase)(true); // Use admin client
        // Generate a random password - the user will reset this
        const tempPassword = Math.random().toString(36).slice(-10);
        // Create the user with the service role
        const { data, error } = yield supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true, // Auto-confirm the email
            user_metadata: { role }
        });
        if (error) {
            return { error };
        }
        // If user creation was successful, create a profile
        if (data === null || data === void 0 ? void 0 : data.user) {
            // Create a profile record
            const { error: profileError } = yield supabase
                .from('profiles')
                .insert({
                user_id: data.user.id,
                role: role,
                full_name: '', // This can be updated by the user later
            });
            if (profileError) {
                return { data, error: profileError };
            }
            // Send a password reset email so they can set their own password
            const { error: resetError } = yield supabase.auth.admin.generateLink({
                type: 'recovery',
                email: email
            });
            if (resetError) {
                return { data, error: resetError };
            }
        }
        return { data, error: null };
    });
}
/**
 * Get all users (typically an admin function)
 */
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        // This requires admin privileges
        const supabase = (0, supabase_1.getSupabase)(true); // Use admin client
        // Get all users from auth.users
        const { data: authUsers, error: authError } = yield supabase.auth.admin.listUsers();
        if (authError) {
            return { data: null, error: authError };
        }
        // Get all profiles
        const { data: profiles, error: profilesError } = yield supabase
            .from('profiles')
            .select('*');
        if (profilesError) {
            return { data: { users: authUsers.users }, error: profilesError };
        }
        // Merge the data
        const users = authUsers.users.map(user => {
            const profile = profiles.find(p => p.user_id === user.id);
            return Object.assign(Object.assign({}, user), { profile: profile || null });
        });
        return { data: { users }, error: null };
    });
}
/**
 * Delete a user by ID
 * This is a sensitive operation and requires careful implementation,
 * especially regarding Supabase Auth user deletion and data integrity.
 */
function deleteUser(userIdToDelete, currentUserId, isAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Attempting to delete user: ${userIdToDelete} by user: ${currentUserId}, isAdmin: ${isAdmin}`);
        try {
            // Authorization should be handled primarily in the controller.
            // This model function assumes authorization has been confirmed.
            // IMPORTANT: Deleting a user in Supabase Auth requires the service_role key
            // and should be done from a secure backend environment.
            // const { data: adminData, error: adminError } = await supabaseClient.auth.admin.deleteUser(userIdToDelete);
            // if (adminError) {
            //   console.error('Error deleting user from Supabase Auth:', adminError.message);
            //   return { error: { message: adminError.message || 'Failed to delete user from auth system.' } };
            // }
            // If you also have a public users table, delete the profile from there.
            // const { error: profileError } = await supabaseClient
            //   .from('users')
            //   .delete()
            //   .match({ id: userIdToDelete });
            // if (profileError) {
            //   console.error('Error deleting user profile:', profileError.message);
            //   // Consider the implications if auth user is deleted but profile deletion fails.
            //   return { error: { message: profileError.message || 'Failed to delete user profile.' } };
            // }
            // Placeholder until actual Supabase admin delete is implemented
            return { error: { message: 'User deletion not fully implemented in model.' } };
        }
        catch (error) {
            console.error('Unexpected error in deleteUser model:', error.message);
            return { error: { message: error.message || 'Failed to delete user due to an unexpected error.' } };
        }
    });
}
