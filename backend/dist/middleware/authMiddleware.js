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
exports.authMiddleware = void 0;
const supabase_1 = require("../config/supabase");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided'
            });
            return; // Ensure void return
        }
        const { data, error } = yield supabase_1.supabaseClient.auth.getUser(token);
        if (error || !data.user) {
            res.status(401).json({
                error: 'Authentication failed',
                message: (error === null || error === void 0 ? void 0 : error.message) || 'Invalid token'
            });
            return; // Ensure void return
        }
        req.user = data.user;
        next();
    }
    catch (error) {
        // Ensure a response is sent and then return void
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Server error during authentication',
                message: error.message
            });
        }
        // Do not proceed further by calling next() in case of error here, response is sent.
    }
});
exports.authMiddleware = authMiddleware;
