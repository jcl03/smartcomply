"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabase = exports.supabaseAdmin = exports.supabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}
// Create Supabase client with anon key (for client-side operations)
exports.supabaseClient = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Create Supabase admin client with service role key (for admin operations)
exports.supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;
// Helper function to get appropriate client based on operation
const getSupabase = (useAdmin = false) => {
    if (useAdmin && !exports.supabaseAdmin) {
        throw new Error('Service role key not configured for admin operations');
    }
    return useAdmin ? exports.supabaseAdmin : exports.supabaseClient;
};
exports.getSupabase = getSupabase;
