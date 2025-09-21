"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOwnerApiKeys = exports.deleteApiKeysForOwner = exports.updateApiKeysForOwner = exports.createApiKeysForOwner = exports.getApiKeyForOwner = void 0;
const OwnerApiKeys_model_1 = __importDefault(require("../models/OwnerApiKeys.model"));
const getApiKeyForOwner = async (ownerId) => {
    try {
        const apiKeys = await OwnerApiKeys_model_1.default.findOne({
            ownerId,
            isActive: true
        });
        if (!apiKeys) {
            return null;
        }
        return {
            hostkitApiKey: apiKeys.hostkitApiKey,
            hostkitApiSecret: apiKeys.hostkitApiSecret
        };
    }
    catch (error) {
        console.error('Error fetching API keys for owner:', error);
        return null;
    }
};
exports.getApiKeyForOwner = getApiKeyForOwner;
const createApiKeysForOwner = async (ownerId, hostkitApiKey, hostkitApiSecret) => {
    try {
        await OwnerApiKeys_model_1.default.create({
            ownerId,
            hostkitApiKey,
            hostkitApiSecret,
            isActive: true
        });
        return true;
    }
    catch (error) {
        console.error('Error creating API keys for owner:', error);
        return false;
    }
};
exports.createApiKeysForOwner = createApiKeysForOwner;
const updateApiKeysForOwner = async (ownerId, hostkitApiKey, hostkitApiSecret) => {
    try {
        await OwnerApiKeys_model_1.default.findOneAndUpdate({ ownerId }, {
            hostkitApiKey,
            hostkitApiSecret,
            updatedAt: new Date()
        }, { upsert: true });
        return true;
    }
    catch (error) {
        console.error('Error updating API keys for owner:', error);
        return false;
    }
};
exports.updateApiKeysForOwner = updateApiKeysForOwner;
const deleteApiKeysForOwner = async (ownerId) => {
    try {
        await OwnerApiKeys_model_1.default.findOneAndUpdate({ ownerId }, { isActive: false });
        return true;
    }
    catch (error) {
        console.error('Error deleting API keys for owner:', error);
        return false;
    }
};
exports.deleteApiKeysForOwner = deleteApiKeysForOwner;
const getAllOwnerApiKeys = async () => {
    try {
        return await OwnerApiKeys_model_1.default.find({ isActive: true });
    }
    catch (error) {
        console.error('Error fetching all owner API keys:', error);
        return [];
    }
};
exports.getAllOwnerApiKeys = getAllOwnerApiKeys;
