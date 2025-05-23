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
exports.deleteUser = exports.updateProfile = exports.getUserProfile = exports.getAllUsers = exports.inviteUser = void 0;
const userManagementModel = __importStar(require("../models/userManagementModel"));
/**
 * Invite a user to the application
 */
const inviteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, role } = req.body;
        // Validation
        if (!email || !email.includes('@')) {
            res.status(400).json({ error: 'Please provide a valid email address.' });
            return;
        }
        const validRoles = ['user', 'manager', 'admin', 'external_auditor'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ error: 'Invalid role.' });
            return;
        }
        // Perform invitation
        const { data, error } = yield userManagementModel.inviteUser(email, role);
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
exports.inviteUser = inviteUser;
/**
 * Get all users (admin only)
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // This should be protected by middleware that checks admin role
        const { data, error } = yield userManagementModel.getAllUsers();
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
exports.getAllUsers = getAllUsers;
/**
 * Get user profile
 */
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const userIdToFetch = req.params.id || req.user.id; // Use req.params.id if available
        // Check if requesting user has permission to view this profile
        // req.user.id is the authenticated user's ID
        // req.user.user_metadata?.role is the authenticated user's role
        if (userIdToFetch !== req.user.id && ((_a = req.user.user_metadata) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Permission denied to view this profile' });
            return;
        }
        const { data, error } = yield userManagementModel.getUserProfile(userIdToFetch);
        if (error) {
            res.status(404).json({ error: error.message || 'User profile not found' }); // 404 if not found
            return;
        }
        // If an admin is fetching another user's profile, req.user is the admin, data is the fetched profile
        // If a user is fetching their own profile, req.user is the user, data is their profile
        res.status(200).json({
            // Clarify what req.user represents here vs the profile data
            // For now, returning the fetched profile data directly
            profile: data
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 */
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const userIdToUpdate = req.params.id || req.user.id; // Use req.params.id if available
        // Check if requesting user has permission to update this profile
        if (userIdToUpdate !== req.user.id && ((_a = req.user.user_metadata) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Permission denied to update this profile' });
            return;
        }
        const { data, error } = yield userManagementModel.updateProfile(userIdToUpdate, req.body);
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
exports.updateProfile = updateProfile;
/**
 * Delete a user (admin only or self-deletion - adjust logic as needed)
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const userIdToDelete = req.params.id;
        if (!userIdToDelete) {
            res.status(400).json({ error: 'User ID is required for deletion.' });
            return;
        }
        // Authorization: Allow admin to delete any user, or user to delete themselves.
        // Adjust this logic based on your application's requirements.
        // For Supabase, deleting a user from auth schema often requires admin privileges.
        if (((_a = req.user.user_metadata) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' && req.user.id !== userIdToDelete) {
            res.status(403).json({ error: 'Permission denied to delete this user.' });
            return;
        }
        // If it's not an admin deleting someone else, and the user is trying to delete themselves
        // ensure they are not trying to delete another user if they are not an admin.
        if (((_b = req.user.user_metadata) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && req.user.id !== userIdToDelete) {
            res.status(403).json({ error: 'You can only delete your own account.' });
            return;
        }
        const { error } = yield userManagementModel.deleteUser(userIdToDelete, req.user.id, ((_c = req.user.user_metadata) === null || _c === void 0 ? void 0 : _c.role) === 'admin');
        if (error) {
            res.status(400).json({ error: error.message || 'Failed to delete user.' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message || 'An unexpected error occurred while deleting the user.' });
    }
});
exports.deleteUser = deleteUser;
