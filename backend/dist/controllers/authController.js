"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.resetPasswordWithToken = exports.updateUserProfile = exports.processAuthCode = exports.updatePassword = exports.verifyResetToken = exports.requestPasswordReset = exports.logout = exports.login = exports.signup = void 0;
const authModel = __importStar(require("../models/authModel"));
const userManagementModel = __importStar(require("../models/userManagementModel"));
/**
 * Handle user signup
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, displayName, role, fullName, confirmPassword } = req.body;
        // Validation
        if (!email || !email.includes('@')) {
            res.status(400).json({ error: 'Please provide a valid email address.' });
            return;
        }
        if (!password || password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters.' });
            return;
        }
        if (confirmPassword && password !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match.' });
            return;
        }
        if (!(displayName === null || displayName === void 0 ? void 0 : displayName.trim())) {
            res.status(400).json({ error: 'Display name is required.' });
            return;
        }
        // Validate role (optional security measure)
        const validRoles = ['user', 'manager', 'admin', 'external_auditor'];
        let finalRole = role;
        if (!validRoles.includes(role)) {
            finalRole = 'user'; // Default to user role if invalid role provided
        }
        // Call model function
        const { data, error } = yield authModel.signupWithEmail(email, password, displayName, finalRole, fullName);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(200).json({ data });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.signup = signup;
/**
 * Handle user login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !email.includes('@')) {
            res.status(400).json({ error: 'Please provide a valid email address.' });
            return;
        }
        if (!password) {
            res.status(400).json({ error: 'Password is required.' });
            return;
        }
        // Process login
        const { data, error } = yield authModel.loginWithEmail(email, password);
        if (error) {
            res.status(401).json({ error: error.message });
            return;
        }
        if (!data || !data.session) {
            res.status(401).json({
                error: 'Login failed. Please check your credentials or confirm your email.'
            });
            return;
        }
        res.status(200).json({ data });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.login = login;
/**
 * Handle user logout
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        const { error } = yield authModel.logout(token);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.logout = logout;
/**
 * Handle password reset request
 */
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Validation
        if (!email || !email.includes('@')) {
            res.status(400).json({ error: 'Please provide a valid email address.' });
            return;
        }
        // Get the redirect URL from frontend
        const redirectUrl = req.body.redirectUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
        // Process request
        const { error } = yield authModel.resetPassword(email, redirectUrl);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(200).json({
            message: 'Password reset email sent. Please check your inbox.'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.requestPasswordReset = requestPasswordReset;
/**
 * Verify reset token
 */
const verifyResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get authenticated user using the token in the authorization header
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        const { data, error } = yield authModel.getAuthenticatedUser(token);
        if (error) {
            res.status(401).json({ error: error.message, isValid: false });
            return;
        }
        res.status(200).json({
            data,
            isValid: !!(data === null || data === void 0 ? void 0 : data.user)
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.verifyResetToken = verifyResetToken;
/**
 * Update user password
 */
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { password, confirmPassword } = req.body;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        // Validation
        if (confirmPassword && password !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match.' });
            return;
        }
        if (!password || password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters.' });
            return;
        }
        // Update password
        const { data, error } = yield authModel.updateUserPassword(password, token);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(200).json({ data });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updatePassword = updatePassword;
/**
 * Process authentication code
 */
const processAuthCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({
                success: false,
                error: 'No authentication code provided'
            });
            return;
        }
        // Process auth code through model
        const { data, error } = yield authModel.processAuthCode(code);
        if (error) {
            res.status(400).json({
                success: false,
                error: (error === null || error === void 0 ? void 0 : error.message) || 'Authentication code processing failed'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.processAuthCode = processAuthCode;
/**
 * Update user profile
 */
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const userId = req.user.id;
        const { displayName, fullName } = req.body;
        // Validation
        if (!displayName || !displayName.trim()) {
            res.status(400).json({ error: 'Display name is required.' });
            return;
        }
        // Full name defaults to display name if not provided
        const actualFullName = fullName || displayName;
        // Update both the auth metadata and profile table
        const [metadataResult, profileResult] = yield Promise.all([
            // Update auth metadata
            userManagementModel.updateUserMetadata({ display_name: displayName }, (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]),
            // Update profile table
            userManagementModel.updateProfile(userId, { full_name: actualFullName })
        ]);
        // Return error from either operation
        if (metadataResult.error) {
            res.status(400).json({ error: metadataResult.error.message });
            return;
        }
        if (profileResult.error) {
            res.status(400).json({ error: profileResult.error.message });
            return;
        }
        res.status(200).json({
            data: {
                user: metadataResult.data.user,
                profile: profileResult.data
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateUserProfile = updateUserProfile;
/**
 * Handle password reset with a token
 */
const resetPasswordWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Reset token is required.' });
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match.' });
            return;
        }
        // It seems Supabase does not directly support password reset with a custom token via client library like this.
        // Password reset is typically handled by the user clicking a link sent to their email,
        // which takes them to a page where they can enter a new password.
        // The actual update happens via `supabase.auth.updateUser({ password: newPassword })`
        // AFTER the user has been authenticated through that reset link (which sets a session).
        // For an API-driven flow using a token you manage:
        // 1. Verify the token's validity (e.g., check against a database table where you stored it with an expiry).
        // 2. If valid, find the user associated with the token.
        // 3. Programmatically update the user's password. This might require admin privileges
        //    or a different Supabase method if not operating within the user's authenticated session.
        // Placeholder for the logic to verify the custom token and update the password.
        // This will likely involve a custom model function.
        // For now, let's assume authModel.performPasswordResetWithToken handles this.
        const { error } = yield authModel.performPasswordResetWithToken(token, newPassword);
        if (error) {
            res.status(400).json({ error: error.message || 'Failed to reset password.' });
            return;
        }
        res.status(200).json({ message: 'Password has been reset successfully.' });
    }
    catch (error) {
        console.error('Error in resetPasswordWithToken:', error);
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
});
exports.resetPasswordWithToken = resetPasswordWithToken;
