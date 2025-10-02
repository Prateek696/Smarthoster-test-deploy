"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.generateOwnerStatement = exports.createProperty = exports.assignPropertyToOwner = exports.updateOwnerApiKeys = exports.getOwnerApiKeys = exports.getAllProperties = exports.deleteAccountant = exports.updateAccountantProperties = exports.updateAccountant = exports.deleteOwner = exports.updateOwner = exports.createOwner = exports.getAccountantCompanies = exports.getAllAccountants = exports.getAllOwners = exports.getAdminDashboardStats = exports.checkAdminSetup = exports.createFirstAdmin = exports.checkAdminExists = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_model_1 = require("../models/User.model");
const property_model_1 = __importDefault(require("../models/property.model"));
const OwnerApiKeys_model_1 = __importDefault(require("../models/OwnerApiKeys.model"));
const otp_service_1 = require("../services/otp.service");
const invoice_service_1 = require("../services/invoice.service");
/**
 * @desc Check if admin user already exists
 */
const checkAdminExists = async (req, res) => {
    try {
        console.log('🔍 checkAdminExists called');
        const adminExists = await User_model_1.UserModel.findOne({ role: 'admin' });
        console.log('🔍 Admin found:', !!adminExists);
        console.log('🔍 Admin details:', adminExists ? { id: adminExists._id, email: adminExists.email } : 'No admin found');
        res.json({ exists: !!adminExists });
    }
    catch (error) {
        console.error('❌ Error in checkAdminExists:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.checkAdminExists = checkAdminExists;
/**
 * @desc Create the first admin user (one-time only)
 */
const createFirstAdmin = async (req, res) => {
    try {
        // Check if any admin already exists
        const existingAdmin = await User_model_1.UserModel.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin user already exists. This endpoint can only be used once."
            });
        }
        const { name, email, phone, password } = req.body;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }
        // Check if email already exists
        const existingUser = await User_model_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create admin user
        const admin = new User_model_1.UserModel({
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            role: 'admin',
            isVerified: false // Will be verified via OTP
        });
        await admin.save();
        // Send OTP for verification
        const otpSent = await (0, otp_service_1.sendOTP)(email, 'signup');
        if (!otpSent) {
            return res.status(500).json({
                message: "Admin created but failed to send verification OTP"
            });
        }
        res.status(201).json({
            message: "First admin user created successfully! Please verify your email with the OTP sent.",
            email: email
        });
    }
    catch (error) {
        console.error('Error creating first admin:', error);
        res.status(500).json({
            message: error.message || "Failed to create admin user"
        });
    }
};
exports.createFirstAdmin = createFirstAdmin;
/**
 * @desc Check if admin setup is needed
 */
const checkAdminSetup = async (req, res) => {
    try {
        const adminExists = await User_model_1.UserModel.findOne({ role: 'admin' });
        res.json({
            adminExists: !!adminExists,
            message: adminExists
                ? "Admin user already exists"
                : "No admin user found. Setup required."
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message || "Failed to check admin setup"
        });
    }
};
exports.checkAdminSetup = checkAdminSetup;
/**
 * @desc Get admin dashboard statistics
 */
const getAdminDashboardStats = async (req, res) => {
    try {
        console.log('getAdminDashboardStats called');
        console.log('UserModel available:', !!User_model_1.UserModel);
        console.log('PropertyModel available:', !!property_model_1.default);
        console.log('OwnerApiKeysModel available:', !!OwnerApiKeys_model_1.default);
        const totalOwners = await User_model_1.UserModel.countDocuments({ role: 'owner' });
        console.log('Total owners:', totalOwners);
        const totalAccountants = await User_model_1.UserModel.countDocuments({ role: 'accountant' });
        console.log('Total accountants:', totalAccountants);
        const totalProperties = await property_model_1.default.countDocuments();
        console.log('Total properties:', totalProperties);
        const ownersWithApiKeys = await OwnerApiKeys_model_1.default.countDocuments({ isActive: true });
        console.log('Owners with API keys:', ownersWithApiKeys);
        const recentProperties = await property_model_1.default.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent properties:', recentProperties.length);
        const responseData = {
            data: {
                totalOwners,
                totalAccountants,
                totalProperties,
                ownersWithApiKeys,
                recentProperties
            }
        };
        console.log('Sending dashboard stats:', responseData);
        res.json(responseData);
    }
    catch (error) {
        console.error('Error in getAdminDashboardStats:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminDashboardStats = getAdminDashboardStats;
/**
 * @desc Get all owners
 */
const getAllOwners = async (req, res) => {
    try {
        console.log('getAllOwners called');
        console.log('UserModel available:', !!User_model_1.UserModel);
        console.log('OwnerApiKeysModel available:', !!OwnerApiKeys_model_1.default);
        const owners = await User_model_1.UserModel.find({ role: 'owner' });
        console.log('Found owners:', owners.length);
        // Check which owners have API keys
        const ownersWithApiKeys = await Promise.all(owners.map(async (owner) => {
            const apiKeys = await OwnerApiKeys_model_1.default.findOne({ ownerId: owner._id.toString() });
            return {
                _id: owner._id,
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                role: owner.role,
                isVerified: owner.isVerified,
                hasApiKeys: !!apiKeys,
                apiKeysActive: apiKeys?.isActive || false,
                companies: owner.companies,
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt
            };
        }));
        console.log('Sending owners data:', ownersWithApiKeys);
        res.json({ data: ownersWithApiKeys });
    }
    catch (error) {
        console.error('Error in getAllOwners:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllOwners = getAllOwners;
/**
 * @desc Get all accountants
 */
const getAllAccountants = async (req, res) => {
    try {
        console.log('getAllAccountants called');
        console.log('UserModel available:', !!User_model_1.UserModel);
        console.log('PropertyModel available:', !!property_model_1.default);
        const accountants = await User_model_1.UserModel.find({ role: 'accountant' });
        console.log('Found accountants:', accountants.length);
        // Get assigned properties for each accountant
        const accountantsWithProperties = await Promise.all(accountants.map(async (accountant) => {
            const assignedProperties = await property_model_1.default.find({ accountants: accountant._id }).populate('owner', 'name email');
            return {
                _id: accountant._id,
                name: accountant.name,
                email: accountant.email,
                phone: accountant.phone,
                role: accountant.role,
                isVerified: accountant.isVerified,
                assignedProperties: assignedProperties.map(prop => ({
                    _id: prop._id,
                    id: prop.id,
                    name: prop.name,
                    owner: prop.owner
                })),
                assignedPropertiesCount: assignedProperties.length,
                createdAt: accountant.createdAt,
                updatedAt: accountant.updatedAt
            };
        }));
        console.log('Sending accountants data:', accountantsWithProperties);
        res.json({ data: accountantsWithProperties });
    }
    catch (error) {
        console.error('Error in getAllAccountants:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllAccountants = getAllAccountants;
/**
 * @desc Get companies from accountant's assigned properties
 */
const getAccountantCompanies = async (req, res) => {
    try {
        const accountantId = req.user?.id;
        console.log('📋 getAccountantCompanies called for accountant:', accountantId);
        // Get all properties assigned to this accountant
        const assignedProperties = await property_model_1.default.find({ accountants: accountantId })
            .populate('owner', 'name email companies');
        console.log('✅ Found assigned properties:', assignedProperties.length);
        console.log('📋 Property details:', assignedProperties.map(p => ({
            id: p.id,
            name: p.name,
            isAdminOwned: p.isAdminOwned,
            owner: p.owner?.name,
            ownerCompanies: p.owner?.companies
        })));
        // Get admin user for admin-owned properties
        const adminUser = await User_model_1.UserModel.findOne({ role: 'admin' });
        console.log('👨‍💼 Admin user found:', adminUser?.name, 'Companies:', adminUser?.companies);
        // Extract unique companies from all assigned properties' owners
        const companiesSet = new Map();
        for (const property of assignedProperties) {
            let owner = property.owner;
            // If property is admin-owned, use the admin user
            if (property.isAdminOwned && !owner && adminUser) {
                owner = adminUser;
                console.log('🔄 Using admin user for admin-owned property:', property.name);
            }
            if (owner && owner.companies && Array.isArray(owner.companies)) {
                owner.companies.forEach((company) => {
                    const key = `${company.name}-${company.nif}`;
                    if (!companiesSet.has(key)) {
                        companiesSet.set(key, {
                            name: company.name,
                            nif: company.nif,
                            ownerId: owner._id.toString(),
                            ownerName: owner.name
                        });
                    }
                });
            }
        }
        const uniqueCompanies = Array.from(companiesSet.values());
        console.log('📊 Unique companies found:', uniqueCompanies.length, uniqueCompanies);
        res.json({
            success: true,
            companies: uniqueCompanies
        });
    }
    catch (error) {
        console.error('❌ Error in getAccountantCompanies:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAccountantCompanies = getAccountantCompanies;
/**
 * @desc Create new owner
 */
const createOwner = async (req, res) => {
    try {
        console.log('createOwner called with data:', req.body);
        const { name, email, phone, password, role = 'owner', // Default to owner if not specified
        hostkitApiId, hostkitApiKey, hostkitApiSecret, 
        // Property data (optional)
        propertyData, 
        // Assigned properties for accountants
        assignedProperties, 
        // Company information for SAFT
        companies } = req.body;
        // Check if UserModel is available
        if (!User_model_1.UserModel) {
            console.error('UserModel is undefined');
            return res.status(500).json({ message: "Database model not available" });
        }
        // Check if email already exists
        console.log('Checking if email exists:', email);
        const existingUser = await User_model_1.UserModel.findOne({ email });
        if (existingUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({ message: "Email already exists" });
        }
        // Validate password
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }
        // Hash the provided password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user (owner or accountant)
        console.log('Creating user with data:', { name, email, phone, role, isVerified: true, companies });
        const owner = await User_model_1.UserModel.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role,
            isVerified: true,
            companies: companies || [] // Include companies for SAFT
        });
        console.log('Owner created successfully:', owner);
        console.log('Owner companies saved:', owner.companies);
        // Create API keys if provided
        if (hostkitApiId && hostkitApiKey) {
            console.log('Creating API keys for owner:', owner._id);
            console.log('OwnerApiKeysModel available:', !!OwnerApiKeys_model_1.default);
            try {
                const apiKeyResult = await OwnerApiKeys_model_1.default.create({
                    ownerId: owner._id.toString(),
                    hostkitApiKey: hostkitApiId, // Use API ID as the API key
                    hostkitApiSecret: hostkitApiKey, // Use API Key as the secret
                    isActive: true
                });
                console.log('API keys created successfully:', apiKeyResult);
            }
            catch (apiKeyError) {
                console.error('Error creating API keys:', apiKeyError);
                // Don't fail the whole request if API keys fail
            }
        }
        // Create property if propertyData is provided (only for owners)
        let createdProperty = null;
        if (role === 'owner' && propertyData && propertyData.name && propertyData.id) {
            console.log('Creating property for owner:', propertyData);
            try {
                createdProperty = await property_model_1.default.create({
                    id: parseInt(propertyData.id),
                    name: propertyData.name,
                    address: propertyData.address,
                    type: propertyData.type,
                    bedrooms: propertyData.bedrooms,
                    bathrooms: propertyData.bathrooms,
                    maxGuests: propertyData.maxGuests,
                    hostkitId: propertyData.hostkitId,
                    hostkitApiKey: hostkitApiKey || '', // Use owner's API key
                    status: 'active',
                    images: [],
                    amenities: propertyData.amenities ? propertyData.amenities.split(',').map((a) => a.trim()) : [],
                    owner: owner._id,
                    requiresCommission: false
                });
                console.log('Property created successfully:', createdProperty);
            }
            catch (propertyError) {
                console.error('Error creating property:', propertyError);
                // Don't fail the whole request if property creation fails
            }
        }
        // Assign properties to accountant if provided
        if (role === 'accountant' && assignedProperties && assignedProperties.length > 0) {
            console.log('Assigning properties to accountant:', assignedProperties);
            try {
                // Update properties to assign them to the accountant
                await property_model_1.default.updateMany({ _id: { $in: assignedProperties } }, { $addToSet: { accountants: owner._id } });
                console.log('Properties assigned to accountant successfully');
            }
            catch (assignmentError) {
                console.error('Error assigning properties to accountant:', assignmentError);
                // Don't fail the whole request if property assignment fails
            }
        }
        // Send welcome email based on role (via Vercel deployment for SMTP)
        try {
            const emailEndpoint = role === 'accountant'
                ? 'https://smarthoster-test-deploy.vercel.app/welcome-email/send-accountant-welcome'
                : 'https://smarthoster-test-deploy.vercel.app/welcome-email/send-owner-welcome';
            console.log(`📧 Calling Vercel email endpoint for new ${role}:`, emailEndpoint);
            const axios = require('axios');
            const emailResponse = await axios.post(emailEndpoint, {
                name,
                email,
                password, // Plain text password (before hashing)
                portalUrl: process.env.PORTAL_URL || 'https://smarthoster-test-deploy-final.vercel.app'
            }, {
                timeout: 10000 // 10 second timeout
            });
            console.log(`✅ ${role === 'accountant' ? 'Accountant' : 'Owner'} welcome email sent successfully to:`, email);
            console.log('Email response:', emailResponse.data);
        }
        catch (emailError) {
            console.error('⚠️  Error sending welcome email (continuing anyway):', emailError.message);
            if (emailError.response) {
                console.error('⚠️  Email error response:', emailError.response.status, emailError.response.data);
            }
            // Don't fail the user creation if email fails - user is already created
        }
        const responseData = {
            data: {
                _id: owner._id,
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                role: owner.role,
                isVerified: owner.isVerified,
                hasApiKeys: !!(hostkitApiId && hostkitApiKey),
                apiKeysActive: !!(hostkitApiId && hostkitApiKey),
                companies: owner.companies || [], // Include companies in response
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt,
                property: createdProperty // Include the created property
            }
        };
        console.log('Sending response:', responseData);
        res.json(responseData);
    }
    catch (error) {
        console.error('Error in createOwner:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createOwner = createOwner;
/**
 * @desc Update owner
 */
const updateOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { name, email, phone, password, role, companies } = req.body;
        // Prepare update data
        const updateData = { name, email, phone, role };
        // Add companies if provided
        if (companies) {
            updateData.companies = companies;
        }
        // Only update password if provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            updateData.password = hashedPassword;
        }
        // Update owner
        const owner = await User_model_1.UserModel.findByIdAndUpdate(ownerId, updateData, { new: true });
        if (!owner) {
            return res.status(404).json({ message: "Owner not found" });
        }
        res.json({
            data: {
                _id: owner._id,
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                role: owner.role,
                isVerified: owner.isVerified,
                companies: owner.companies,
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error in updateOwner:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateOwner = updateOwner;
/**
 * @desc Delete owner
 */
const deleteOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        console.log(`🗑️  Deleting owner and all associated data: ${ownerId}`);
        // Find all properties owned by this owner
        const ownerProperties = await property_model_1.default.find({ owner: ownerId });
        console.log(`📋 Found ${ownerProperties.length} properties to delete`);
        // Delete all properties owned by this owner
        const deletedProperties = await property_model_1.default.deleteMany({ owner: ownerId });
        console.log(`✅ Deleted ${deletedProperties.deletedCount} properties`);
        // Delete API keys associated with this owner
        const deletedApiKeys = await OwnerApiKeys_model_1.default.deleteOne({ ownerId });
        console.log(`✅ Deleted API keys for owner`);
        // Finally, delete the owner
        const deletedOwner = await User_model_1.UserModel.findByIdAndDelete(ownerId);
        if (!deletedOwner) {
            return res.status(404).json({ message: "Owner not found" });
        }
        console.log(`✅ Owner deleted successfully: ${deletedOwner.name}`);
        res.json({
            message: "Owner and all associated properties deleted successfully",
            deletedProperties: deletedProperties.deletedCount,
            deletedOwner: {
                name: deletedOwner.name,
                email: deletedOwner.email
            }
        });
    }
    catch (error) {
        console.error('❌ Error deleting owner:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteOwner = deleteOwner;
/**
 * @desc Update accountant
 */
const updateAccountant = async (req, res) => {
    try {
        const { accountantId } = req.params;
        const { name, email, phone, password } = req.body;
        // Prepare update data
        const updateData = { name, email, phone };
        // Only update password if provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            updateData.password = hashedPassword;
        }
        // Update accountant
        const accountant = await User_model_1.UserModel.findByIdAndUpdate(accountantId, updateData, { new: true });
        if (!accountant) {
            return res.status(404).json({ message: "Accountant not found" });
        }
        // Get assigned properties for the updated accountant
        const assignedProperties = await property_model_1.default.find({ accountants: accountant._id }).populate('owner', 'name email');
        res.json({
            data: {
                _id: accountant._id,
                name: accountant.name,
                email: accountant.email,
                phone: accountant.phone,
                role: accountant.role,
                isVerified: accountant.isVerified,
                assignedProperties: assignedProperties.map(prop => ({
                    _id: prop._id,
                    id: prop.id,
                    name: prop.name,
                    owner: prop.owner
                })),
                assignedPropertiesCount: assignedProperties.length,
                createdAt: accountant.createdAt,
                updatedAt: accountant.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error in updateAccountant:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateAccountant = updateAccountant;
/**
 * @desc Update accountant property assignments
 */
const updateAccountantProperties = async (req, res) => {
    try {
        const { accountantId } = req.params;
        const { assignedProperties } = req.body;
        console.log('Updating accountant properties:', { accountantId, assignedProperties });
        // First, remove accountant from all properties
        await property_model_1.default.updateMany({ accountants: accountantId }, { $pull: { accountants: accountantId } });
        // Then, add accountant to selected properties
        if (assignedProperties && assignedProperties.length > 0) {
            await property_model_1.default.updateMany({ _id: { $in: assignedProperties } }, { $addToSet: { accountants: accountantId } });
        }
        // Get updated accountant with assigned properties
        const accountant = await User_model_1.UserModel.findById(accountantId);
        if (!accountant) {
            return res.status(404).json({ message: "Accountant not found" });
        }
        const assignedPropertiesData = await property_model_1.default.find({ accountants: accountantId }).populate('owner', 'name email');
        res.json({
            message: "Accountant property assignments updated successfully",
            data: {
                _id: accountant._id,
                name: accountant.name,
                email: accountant.email,
                phone: accountant.phone,
                role: accountant.role,
                isVerified: accountant.isVerified,
                assignedProperties: assignedPropertiesData.map(prop => ({
                    _id: prop._id,
                    id: prop.id,
                    name: prop.name,
                    owner: prop.owner
                })),
                assignedPropertiesCount: assignedPropertiesData.length,
                createdAt: accountant.createdAt,
                updatedAt: accountant.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error in updateAccountantProperties:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateAccountantProperties = updateAccountantProperties;
/**
 * @desc Delete accountant
 */
const deleteAccountant = async (req, res) => {
    try {
        const { accountantId } = req.params;
        // Remove accountant from all properties
        await property_model_1.default.updateMany({ accountants: accountantId }, { $pull: { accountants: accountantId } });
        // Delete accountant
        await User_model_1.UserModel.findByIdAndDelete(accountantId);
        res.json({ message: "Accountant deleted successfully" });
    }
    catch (error) {
        console.error('Error in deleteAccountant:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAccountant = deleteAccountant;
/**
 * @desc Get all properties (admin view)
 */
const getAllProperties = async (req, res) => {
    try {
        const { ownerId } = req.query;
        const ownerIdString = Array.isArray(ownerId) ? ownerId[0] : ownerId;
        console.log('🔍 getAllProperties called with ownerId:', ownerIdString);
        console.log('🔍 ownerIdString type:', typeof ownerIdString);
        console.log('🔍 ownerIdString value:', JSON.stringify(ownerIdString));
        let query = {};
        if (ownerIdString && ownerIdString !== 'all') {
            if (ownerIdString === 'admin') {
                // For admin properties, find properties where isAdminOwned is true
                query = { isAdminOwned: true };
                console.log('🔍 Filtering properties by admin ownership');
            }
            else {
                // For regular owners, find properties where owner matches and isAdminOwned is false
                const ownerObjectId = new mongoose_1.default.Types.ObjectId(ownerIdString);
                query = { owner: ownerObjectId, isAdminOwned: { $ne: true } };
                console.log('🔍 Filtering properties by owner:', ownerIdString);
                console.log('🔍 Query:', query);
                console.log('🔍 Owner ObjectId created:', ownerObjectId.toString());
            }
        }
        else {
            console.log('🔍 Getting all properties (no filter)');
        }
        console.log('🔍 Executing query:', query);
        console.log('🔍 Query owner field type:', typeof query.owner);
        console.log('🔍 Query owner field value:', query.owner);
        // Execute the MongoDB query
        const properties = await property_model_1.default.find(query).populate('owner', 'name email');
        console.log('🔍 Found properties:', properties.length);
        console.log('🔍 Properties found:', properties.map(p => ({ id: p.id, name: p.name, owner: p.owner, isAdminOwned: p.isAdminOwned })));
        console.log('🔍 Property details:', properties.map(p => ({
            id: p.id,
            name: p.name,
            owner: p.owner?._id || p.owner,
            ownerName: p.owner?.name || 'No owner',
            isAdminOwned: p.isAdminOwned
        })));
        // Additional debugging - let's try a direct query to see what's happening
        if (ownerIdString && ownerIdString !== 'all' && ownerIdString !== 'admin') {
            console.log('🔍 DEBUG: Trying direct query with ObjectId...');
            const directQuery = { owner: new mongoose_1.default.Types.ObjectId(ownerIdString) };
            const directResults = await property_model_1.default.find(directQuery);
            console.log('🔍 DEBUG: Direct query results:', directResults.length);
            console.log('🔍 DEBUG: Direct query property details:', directResults.map(p => ({
                id: p.id,
                name: p.name,
                owner: p.owner,
                isAdminOwned: p.isAdminOwned
            })));
            // Let's also check if the ObjectId is valid
            console.log('🔍 DEBUG: Is ObjectId valid?', mongoose_1.default.Types.ObjectId.isValid(ownerIdString));
            console.log('🔍 DEBUG: Created ObjectId:', new mongoose_1.default.Types.ObjectId(ownerIdString).toString());
            // Test query with just isAdminOwned condition
            const isAdminOwnedQuery = { isAdminOwned: false };
            const isAdminOwnedResults = await property_model_1.default.find(isAdminOwnedQuery);
            console.log('🔍 DEBUG: isAdminOwned=false query results:', isAdminOwnedResults.length);
            console.log('🔍 DEBUG: isAdminOwned=false properties:', isAdminOwnedResults.map(p => ({
                id: p.id,
                name: p.name,
                isAdminOwned: p.isAdminOwned,
                isAdminOwnedType: typeof p.isAdminOwned
            })));
            // Check what the actual isAdminOwned value is in the database
            const allProps = await property_model_1.default.find({});
            console.log('🔍 DEBUG: All properties isAdminOwned values:', allProps.map(p => ({
                id: p.id,
                name: p.name,
                isAdminOwned: p.isAdminOwned,
                isAdminOwnedType: typeof p.isAdminOwned,
                isAdminOwnedRaw: JSON.stringify(p.isAdminOwned)
            })));
        }
        // Also log all properties to see what's in the database
        const allProperties = await property_model_1.default.find({}).populate('owner', 'name email');
        console.log('🔍 All properties in database:', allProperties.map(p => ({
            id: p.id,
            name: p.name,
            owner: p.owner?._id || p.owner,
            ownerName: p.owner?.name || 'No owner',
            isAdminOwned: p.isAdminOwned
        })));
        res.json({ data: properties });
    }
    catch (error) {
        console.error('Error in getAllProperties:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllProperties = getAllProperties;
/**
 * @desc Get owner API keys
 */
const getOwnerApiKeys = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const apiKeys = await OwnerApiKeys_model_1.default.findOne({ ownerId });
        res.json({
            data: apiKeys ? {
                hostkitApiKey: apiKeys.hostkitApiKey,
                hostkitApiSecret: apiKeys.hostkitApiSecret,
                isActive: apiKeys.isActive
            } : null
        });
    }
    catch (error) {
        console.error('Error in createOwner:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getOwnerApiKeys = getOwnerApiKeys;
/**
 * @desc Update owner API keys
 */
const updateOwnerApiKeys = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { hostkitApiKey, hostkitApiSecret } = req.body;
        await OwnerApiKeys_model_1.default.findOneAndUpdate({ ownerId }, { hostkitApiKey, hostkitApiSecret, isActive: true }, { upsert: true });
        res.json({ message: "API keys updated successfully" });
    }
    catch (error) {
        console.error('Error in createOwner:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateOwnerApiKeys = updateOwnerApiKeys;
/**
 * @desc Assign property to owner
 */
const assignPropertyToOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { propertyId } = req.body;
        if (!ownerId || !propertyId) {
            return res.status(400).json({ message: "Owner ID and Property ID are required" });
        }
        // Find the property
        const property = await property_model_1.default.findOne({ id: propertyId });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        // Handle admin assignment
        if (ownerId === 'admin') {
            // For admin properties, set owner to null and add isAdminOwned flag
            property.owner = null;
            property.isAdminOwned = true;
        }
        else {
            // For regular owner assignment
            property.owner = new mongoose_1.default.Types.ObjectId(ownerId);
            property.isAdminOwned = false;
        }
        await property.save();
        res.json({
            message: ownerId === 'admin' ? "Property assigned to admin successfully" : "Property assigned to owner successfully",
            property: {
                id: property.id,
                name: property.name,
                owner: property.owner,
                isAdminOwned: property.isAdminOwned
            }
        });
    }
    catch (error) {
        console.error('Error assigning property to owner:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.assignPropertyToOwner = assignPropertyToOwner;
/**
 * @desc Create property
 */
const createProperty = async (req, res) => {
    try {
        const { id, name, address, type, bedrooms, bathrooms, maxGuests, hostkitId, hostkitApiKey, status = 'active', amenities = [], owner } = req.body;
        // Validate required fields
        if (!id || !name || !address || !type || !hostkitId || !hostkitApiKey || !owner) {
            return res.status(400).json({
                message: "Missing required fields: id, name, address, type, hostkitId, hostkitApiKey, owner are required"
            });
        }
        // Check if property with this ID already exists
        const existingProperty = await property_model_1.default.findOne({ id: parseInt(id) });
        if (existingProperty) {
            return res.status(400).json({ message: "Property with this ID already exists" });
        }
        // Handle owner assignment
        let ownerId = null;
        let isAdminOwned = false;
        if (owner === 'admin') {
            isAdminOwned = true;
        }
        else {
            ownerId = new mongoose_1.default.Types.ObjectId(owner);
        }
        // Create property
        const property = await property_model_1.default.create({
            id: parseInt(id),
            name,
            address,
            type,
            bedrooms: parseInt(bedrooms) || 0,
            bathrooms: parseInt(bathrooms) || 0,
            maxGuests: parseInt(maxGuests) || 0,
            hostkitId,
            hostkitApiKey,
            status,
            amenities: Array.isArray(amenities) ? amenities : amenities.split(',').map((a) => a.trim()),
            owner: ownerId,
            isAdminOwned,
            images: []
        });
        res.json({
            message: "Property created successfully",
            property: {
                _id: property._id,
                id: property.id,
                name: property.name,
                address: property.address,
                type: property.type,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                maxGuests: property.maxGuests,
                hostkitId: property.hostkitId,
                status: property.status,
                amenities: property.amenities,
                images: property.images,
                owner: property.owner,
                isAdminOwned: property.isAdminOwned,
                createdAt: property.createdAt,
                updatedAt: property.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error in createProperty:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createProperty = createProperty;
/**
 * @desc Generate Owner Statement for a property
 */
const generateOwnerStatement = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate } = req.query;
        if (!propertyId || !startDate || !endDate) {
            return res.status(400).json({
                message: "Property ID, start date, and end date are required"
            });
        }
        // Find the property
        const property = await property_model_1.default.findOne({ id: parseInt(propertyId) });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        // Get invoices for the property
        const invoices = await (0, invoice_service_1.getInvoicesService)(parseInt(propertyId), startDate, endDate);
        // Calculate statement components
        const grossAmount = invoices.reduce((sum, invoice) => {
            const value = parseFloat(invoice.value) || 0;
            return sum + value;
        }, 0);
        const portalCommission = grossAmount * 0.15; // 15% of gross
        const cleaningFee = invoices.length * 75; // €75 per invoice (NOT the cleaning fees from reservations)
        const managementCommission = property.isAdminOwned
            ? 0 // 0% for admin-owned properties
            : (grossAmount - cleaningFee - portalCommission) * 0.25; // 25% of (gross - cleaning fee - portal commission) for owner-owned properties
        const finalOwnerAmount = grossAmount - portalCommission - cleaningFee - managementCommission;
        // Prepare statement data
        const statement = {
            property: {
                id: property.id,
                name: property.name,
                owner: property.isAdminOwned ? 'Admin' : property.owner?.name || 'Unassigned',
                isAdminOwned: property.isAdminOwned
            },
            period: {
                startDate,
                endDate
            },
            calculations: {
                grossAmount: Math.round(grossAmount * 100) / 100,
                portalCommission: Math.round(portalCommission * 100) / 100,
                cleaningFee: Math.round(cleaningFee * 100) / 100,
                managementCommission: Math.round(managementCommission * 100) / 100,
                finalOwnerAmount: Math.round(finalOwnerAmount * 100) / 100
            },
            invoiceCount: invoices.length,
            invoices: invoices.map(invoice => ({
                id: invoice.id,
                name: invoice.name,
                value: parseFloat(invoice.value) || 0,
                date: invoice.date,
                series: invoice.series
            }))
        };
        res.json({
            message: "Owner statement generated successfully",
            statement
        });
    }
    catch (error) {
        console.error('Error in generateOwnerStatement:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.generateOwnerStatement = generateOwnerStatement;
/**
 * @desc Delete property
 */
const deleteProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        console.log(`🗑️  Attempting to delete property: ${propertyId}`);
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }
        // First, find the property to get its details
        // Check if propertyId is a valid MongoDB ObjectId or a numeric ID
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(propertyId);
        const query = isObjectId
            ? { _id: propertyId } // If it's an ObjectId format, use _id
            : { id: parseInt(propertyId) }; // Otherwise, use the numeric id field
        const property = await property_model_1.default.findOne(query);
        if (!property) {
            console.log(`❌ Property not found: ${propertyId}`);
            return res.status(404).json({ message: "Property not found" });
        }
        console.log(`📋 Found property: ${property.id} (${property.name})`);
        // Clean up related data before deleting the property
        try {
            // Remove property from any accountants who have it assigned
            // Use both _id (ObjectId) and id (number) to ensure we catch all references
            const propertyObjectId = property._id;
            const accountantsUpdated = await User_model_1.UserModel.updateMany({ role: 'accountant' }, {
                $pull: {
                    assignedProperties: {
                        $in: [propertyObjectId.toString(), propertyObjectId, property.id, property.id.toString()]
                    }
                }
            });
            console.log(`✅ Removed property from ${accountantsUpdated.modifiedCount} accountants`);
            // Note: Bookings and other related data might need cleanup too
            // For now, we'll just delete the property and let MongoDB handle orphaned references
        }
        catch (cleanupError) {
            console.error('⚠️  Error during cleanup (continuing with deletion):', cleanupError.message);
            // Continue with deletion even if cleanup fails
        }
        // Now delete the property using the same query logic
        await property_model_1.default.findOneAndDelete(query);
        console.log(`✅ Property ${property.id} (${property.name}) deleted successfully`);
        res.json({
            message: "Property deleted successfully",
            deletedProperty: {
                id: property.id,
                name: property.name
            }
        });
    }
    catch (error) {
        console.error('❌ Error deleting property:', {
            error: error.message,
            stack: error.stack,
            propertyId: req.params.propertyId
        });
        res.status(500).json({
            message: error.message || "Failed to delete property",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.deleteProperty = deleteProperty;
