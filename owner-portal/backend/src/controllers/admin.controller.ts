import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel } from "../models/User.model";
import PropertyModel from "../models/property.model";
import OwnerApiKeysModel from "../models/OwnerApiKeys.model";
import { sendOTP } from "../services/otp.service";
import { getInvoicesService } from "../services/invoice.service";

/**
 * @desc Check if admin user already exists
 */
export const checkAdminExists = async (req: Request, res: Response) => {
  try {
    console.log('🔍 checkAdminExists called');
    const adminExists = await UserModel.findOne({ role: 'admin' });
    console.log('🔍 Admin found:', !!adminExists);
    console.log('🔍 Admin details:', adminExists ? { id: adminExists._id, email: adminExists.email } : 'No admin found');
    res.json({ exists: !!adminExists });
  } catch (error: any) {
    console.error('❌ Error in checkAdminExists:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create the first admin user (one-time only)
 */
export const createFirstAdmin = async (req: Request, res: Response) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await UserModel.findOne({ role: 'admin' });
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
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = new UserModel({
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role: 'admin',
      isVerified: false // Will be verified via OTP
    });

    await admin.save();

    // Send OTP for verification
    const otpSent = await sendOTP(email, 'signup');
    if (!otpSent) {
      return res.status(500).json({ 
        message: "Admin created but failed to send verification OTP" 
      });
    }

    res.status(201).json({ 
      message: "First admin user created successfully! Please verify your email with the OTP sent.",
      email: email
    });

  } catch (error: any) {
    console.error('Error creating first admin:', error);
    res.status(500).json({ 
      message: error.message || "Failed to create admin user" 
    });
  }
};

/**
 * @desc Check if admin setup is needed
 */
export const checkAdminSetup = async (req: Request, res: Response) => {
  try {
    const adminExists = await UserModel.findOne({ role: 'admin' });
    
    res.json({ 
      adminExists: !!adminExists,
      message: adminExists 
        ? "Admin user already exists" 
        : "No admin user found. Setup required."
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || "Failed to check admin setup" 
    });
  }
};

/**
 * @desc Get admin dashboard statistics
 */
export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('getAdminDashboardStats called');
    console.log('UserModel available:', !!UserModel);
    console.log('PropertyModel available:', !!PropertyModel);
    console.log('OwnerApiKeysModel available:', !!OwnerApiKeysModel);
    
    const totalOwners = await UserModel.countDocuments({ role: 'owner' });
    console.log('Total owners:', totalOwners);
    
    const totalAccountants = await UserModel.countDocuments({ role: 'accountant' });
    console.log('Total accountants:', totalAccountants);
    
    const totalProperties = await PropertyModel.countDocuments();
    console.log('Total properties:', totalProperties);
    
    const ownersWithApiKeys = await OwnerApiKeysModel.countDocuments({ isActive: true });
    console.log('Owners with API keys:', ownersWithApiKeys);
    
    const recentProperties = await PropertyModel.find().sort({ createdAt: -1 }).limit(5);
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
  } catch (error: any) {
    console.error('Error in getAdminDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all owners
 */
export const getAllOwners = async (req: Request, res: Response) => {
  try {
    console.log('getAllOwners called');
    console.log('UserModel available:', !!UserModel);
    console.log('OwnerApiKeysModel available:', !!OwnerApiKeysModel);
    
    const owners = await UserModel.find({ role: 'owner' });
    console.log('Found owners:', owners.length);
    
    // Check which owners have API keys
    const ownersWithApiKeys = await Promise.all(
      owners.map(async (owner) => {
        const apiKeys = await OwnerApiKeysModel.findOne({ ownerId: (owner as any)._id.toString() });
        return {
          _id: (owner as any)._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          role: owner.role,
          isVerified: owner.isVerified,
          hasApiKeys: !!apiKeys,
          apiKeysActive: apiKeys?.isActive || false,
          companies: owner.companies,
          createdAt: (owner as any).createdAt,
          updatedAt: (owner as any).updatedAt
        };
      })
    );

    console.log('Sending owners data:', ownersWithApiKeys);
    res.json({ data: ownersWithApiKeys });
  } catch (error: any) {
    console.error('Error in getAllOwners:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all accountants
 */
export const getAllAccountants = async (req: Request, res: Response) => {
  try {
    console.log('getAllAccountants called');
    console.log('UserModel available:', !!UserModel);
    console.log('PropertyModel available:', !!PropertyModel);
    
    const accountants = await UserModel.find({ role: 'accountant' });
    console.log('Found accountants:', accountants.length);
    
    // Get assigned properties for each accountant
    const accountantsWithProperties = await Promise.all(
      accountants.map(async (accountant) => {
        const assignedProperties = await PropertyModel.find({ accountants: accountant._id }).populate('owner', 'name email');
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
          createdAt: (accountant as any).createdAt,
          updatedAt: (accountant as any).updatedAt
        };
      })
    );

    console.log('Sending accountants data:', accountantsWithProperties);
    res.json({ data: accountantsWithProperties });
  } catch (error: any) {
    console.error('Error in getAllAccountants:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create new owner
 */
export const createOwner = async (req: Request, res: Response) => {
  try {
    console.log('createOwner called with data:', req.body);
    const { 
      name, 
      email, 
      phone, 
      password,
      role = 'owner', // Default to owner if not specified
      hostkitApiId,
      hostkitApiKey, 
      hostkitApiSecret,
      // Property data (optional)
      propertyData,
      // Assigned properties for accountants
      assignedProperties
    } = req.body;

    // Check if UserModel is available
    if (!UserModel) {
      console.error('UserModel is undefined');
      return res.status(500).json({ message: "Database model not available" });
    }

    // Check if email already exists
    console.log('Checking if email exists:', email);
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (owner or accountant)
    console.log('Creating user with data:', { name, email, phone, role, isVerified: true });
    const owner = await UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role,
      isVerified: true
    });
    console.log('Owner created successfully:', owner);

    // Create API keys if provided
    if (hostkitApiId && hostkitApiKey) {
      console.log('Creating API keys for owner:', (owner as any)._id);
      console.log('OwnerApiKeysModel available:', !!OwnerApiKeysModel);
      try {
        const apiKeyResult = await OwnerApiKeysModel.create({
          ownerId: (owner as any)._id.toString(),
          hostkitApiKey: hostkitApiId, // Use API ID as the API key
          hostkitApiSecret: hostkitApiKey, // Use API Key as the secret
          isActive: true
        });
        console.log('API keys created successfully:', apiKeyResult);
      } catch (apiKeyError) {
        console.error('Error creating API keys:', apiKeyError);
        // Don't fail the whole request if API keys fail
      }
    }

    // Create property if propertyData is provided (only for owners)
    let createdProperty = null;
    if (role === 'owner' && propertyData && propertyData.name && propertyData.id) {
      console.log('Creating property for owner:', propertyData);
      try {
        createdProperty = await PropertyModel.create({
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
          amenities: propertyData.amenities ? propertyData.amenities.split(',').map((a: string) => a.trim()) : [],
          owner: (owner as any)._id,
          requiresCommission: false
        });
        console.log('Property created successfully:', createdProperty);
      } catch (propertyError) {
        console.error('Error creating property:', propertyError);
        // Don't fail the whole request if property creation fails
      }
    }

    // Assign properties to accountant if provided
    if (role === 'accountant' && assignedProperties && assignedProperties.length > 0) {
      console.log('Assigning properties to accountant:', assignedProperties);
      try {
        // Update properties to assign them to the accountant
        await PropertyModel.updateMany(
          { _id: { $in: assignedProperties } },
          { $addToSet: { accountants: (owner as any)._id } }
        );
        console.log('Properties assigned to accountant successfully');
      } catch (assignmentError) {
        console.error('Error assigning properties to accountant:', assignmentError);
        // Don't fail the whole request if property assignment fails
      }
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
        createdAt: (owner as any).createdAt,
        updatedAt: (owner as any).updatedAt,
        property: createdProperty // Include the created property
      }
    };
    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error: any) {
    console.error('Error in createOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update owner
 */
export const updateOwner = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { name, email, phone, password, role, companies } = req.body;

    // Prepare update data
    const updateData: any = { name, email, phone, role };
    
    // Add companies if provided
    if (companies) {
      updateData.companies = companies;
    }
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    // Update owner
    const owner = await UserModel.findByIdAndUpdate(
      ownerId,
      updateData,
      { new: true }
    );

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
        createdAt: (owner as any).createdAt,
        updatedAt: (owner as any).updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error in updateOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete owner
 */
export const deleteOwner = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;

    // Delete owner
    await UserModel.findByIdAndDelete(ownerId);
    
    // Delete API keys
    await OwnerApiKeysModel.deleteOne({ ownerId });

    res.json({ message: "Owner deleted successfully" });
  } catch (error: any) {
    console.error('Error in createOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update accountant
 */
export const updateAccountant = async (req: Request, res: Response) => {
  try {
    const { accountantId } = req.params;
    const { name, email, phone, password } = req.body;

    // Prepare update data
    const updateData: any = { name, email, phone };
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    // Update accountant
    const accountant = await UserModel.findByIdAndUpdate(
      accountantId,
      updateData,
      { new: true }
    );

    if (!accountant) {
      return res.status(404).json({ message: "Accountant not found" });
    }

    // Get assigned properties for the updated accountant
    const assignedProperties = await PropertyModel.find({ accountants: accountant._id }).populate('owner', 'name email');

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
        createdAt: (accountant as any).createdAt,
        updatedAt: (accountant as any).updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error in updateAccountant:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update accountant property assignments
 */
export const updateAccountantProperties = async (req: Request, res: Response) => {
  try {
    const { accountantId } = req.params;
    const { assignedProperties } = req.body;

    console.log('Updating accountant properties:', { accountantId, assignedProperties });

    // First, remove accountant from all properties
    await PropertyModel.updateMany(
      { accountants: accountantId },
      { $pull: { accountants: accountantId } }
    );

    // Then, add accountant to selected properties
    if (assignedProperties && assignedProperties.length > 0) {
      await PropertyModel.updateMany(
        { _id: { $in: assignedProperties } },
        { $addToSet: { accountants: accountantId } }
      );
    }

    // Get updated accountant with assigned properties
    const accountant = await UserModel.findById(accountantId);
    if (!accountant) {
      return res.status(404).json({ message: "Accountant not found" });
    }

    const assignedPropertiesData = await PropertyModel.find({ accountants: accountantId }).populate('owner', 'name email');

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
        createdAt: (accountant as any).createdAt,
        updatedAt: (accountant as any).updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error in updateAccountantProperties:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete accountant
 */
export const deleteAccountant = async (req: Request, res: Response) => {
  try {
    const { accountantId } = req.params;

    // Remove accountant from all properties
    await PropertyModel.updateMany(
      { accountants: accountantId },
      { $pull: { accountants: accountantId } }
    );

    // Delete accountant
    await UserModel.findByIdAndDelete(accountantId);

    res.json({ message: "Accountant deleted successfully" });
  } catch (error: any) {
    console.error('Error in deleteAccountant:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all properties (admin view)
 */
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.query;
    const ownerIdString = Array.isArray(ownerId) ? ownerId[0] : ownerId as string;
    console.log('🔍 getAllProperties called with ownerId:', ownerIdString);
    console.log('🔍 ownerIdString type:', typeof ownerIdString);
    console.log('🔍 ownerIdString value:', JSON.stringify(ownerIdString));
    
    let query = {};
    if (ownerIdString && ownerIdString !== 'all') {
      if (ownerIdString === 'admin') {
        // For admin properties, find properties where isAdminOwned is true
        query = { isAdminOwned: true };
        console.log('🔍 Filtering properties by admin ownership');
      } else {
        // For regular owners, find properties where owner matches and isAdminOwned is false
        const ownerObjectId = new mongoose.Types.ObjectId(ownerIdString as string);
        query = { owner: ownerObjectId, isAdminOwned: { $ne: true } };
        console.log('🔍 Filtering properties by owner:', ownerIdString);
        console.log('🔍 Query:', query);
        console.log('🔍 Owner ObjectId created:', ownerObjectId.toString());
      }
    } else {
      console.log('🔍 Getting all properties (no filter)');
    }

    console.log('🔍 Executing query:', query);
    console.log('🔍 Query owner field type:', typeof (query as any).owner);
    console.log('🔍 Query owner field value:', (query as any).owner);
    
    // Execute the MongoDB query
    const properties = await PropertyModel.find(query).populate('owner', 'name email');
    console.log('🔍 Found properties:', properties.length);
    console.log('🔍 Properties found:', properties.map(p => ({ id: p.id, name: p.name, owner: p.owner, isAdminOwned: p.isAdminOwned })));
    console.log('🔍 Property details:', properties.map(p => ({ 
      id: p.id, 
      name: p.name, 
      owner: (p.owner as any)?._id || p.owner,
      ownerName: (p.owner as any)?.name || 'No owner',
      isAdminOwned: p.isAdminOwned
    })));
    
    // Additional debugging - let's try a direct query to see what's happening
    if (ownerIdString && ownerIdString !== 'all' && ownerIdString !== 'admin') {
      console.log('🔍 DEBUG: Trying direct query with ObjectId...');
      const directQuery = { owner: new mongoose.Types.ObjectId(ownerIdString as string) };
      const directResults = await PropertyModel.find(directQuery);
      console.log('🔍 DEBUG: Direct query results:', directResults.length);
      console.log('🔍 DEBUG: Direct query property details:', directResults.map(p => ({ 
        id: p.id, 
        name: p.name, 
        owner: p.owner,
        isAdminOwned: p.isAdminOwned
      })));
      
      // Let's also check if the ObjectId is valid
      console.log('🔍 DEBUG: Is ObjectId valid?', mongoose.Types.ObjectId.isValid(ownerIdString as string));
      console.log('🔍 DEBUG: Created ObjectId:', new mongoose.Types.ObjectId(ownerIdString as string).toString());
      
      // Test query with just isAdminOwned condition
      const isAdminOwnedQuery = { isAdminOwned: false };
      const isAdminOwnedResults = await PropertyModel.find(isAdminOwnedQuery);
      console.log('🔍 DEBUG: isAdminOwned=false query results:', isAdminOwnedResults.length);
      console.log('🔍 DEBUG: isAdminOwned=false properties:', isAdminOwnedResults.map(p => ({ 
        id: p.id, 
        name: p.name, 
        isAdminOwned: p.isAdminOwned,
        isAdminOwnedType: typeof p.isAdminOwned
      })));
      
      // Check what the actual isAdminOwned value is in the database
      const allProps = await PropertyModel.find({});
      console.log('🔍 DEBUG: All properties isAdminOwned values:', allProps.map(p => ({ 
        id: p.id, 
        name: p.name, 
        isAdminOwned: p.isAdminOwned,
        isAdminOwnedType: typeof p.isAdminOwned,
        isAdminOwnedRaw: JSON.stringify(p.isAdminOwned)
      })));
    }
    
    // Also log all properties to see what's in the database
    const allProperties = await PropertyModel.find({}).populate('owner', 'name email');
    console.log('🔍 All properties in database:', allProperties.map(p => ({
      id: p.id,
      name: p.name,
      owner: (p.owner as any)?._id || p.owner,
      ownerName: (p.owner as any)?.name || 'No owner',
      isAdminOwned: p.isAdminOwned
    })));
    
    res.json({ data: properties });
  } catch (error: any) {
    console.error('Error in getAllProperties:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get owner API keys
 */
export const getOwnerApiKeys = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    
    const apiKeys = await OwnerApiKeysModel.findOne({ ownerId });
    
    res.json({ 
      data: apiKeys ? {
        hostkitApiKey: apiKeys.hostkitApiKey,
        hostkitApiSecret: apiKeys.hostkitApiSecret,
        isActive: apiKeys.isActive
      } : null
    });
  } catch (error: any) {
    console.error('Error in createOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update owner API keys
 */
export const updateOwnerApiKeys = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { hostkitApiKey, hostkitApiSecret } = req.body;

    await OwnerApiKeysModel.findOneAndUpdate(
      { ownerId },
      { hostkitApiKey, hostkitApiSecret, isActive: true },
      { upsert: true }
    );

    res.json({ message: "API keys updated successfully" });
  } catch (error: any) {
    console.error('Error in createOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Assign property to owner
 */
export const assignPropertyToOwner = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { propertyId } = req.body;

    if (!ownerId || !propertyId) {
      return res.status(400).json({ message: "Owner ID and Property ID are required" });
    }

    // Find the property
    const property = await PropertyModel.findOne({ id: propertyId });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Handle admin assignment
    if (ownerId === 'admin') {
      // For admin properties, set owner to null and add isAdminOwned flag
      property.owner = null as any;
      property.isAdminOwned = true;
    } else {
      // For regular owner assignment
      property.owner = new mongoose.Types.ObjectId(ownerId);
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
  } catch (error: any) {
    console.error('Error assigning property to owner:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create property
 */
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { 
      id, 
      name, 
      address, 
      type, 
      bedrooms, 
      bathrooms, 
      maxGuests, 
      hostkitId, 
      hostkitApiKey, 
      status = 'active',
      amenities = [],
      owner 
    } = req.body;

    // Validate required fields
    if (!id || !name || !address || !type || !hostkitId || !hostkitApiKey || !owner) {
      return res.status(400).json({ 
        message: "Missing required fields: id, name, address, type, hostkitId, hostkitApiKey, owner are required" 
      });
    }

    // Check if property with this ID already exists
    const existingProperty = await PropertyModel.findOne({ id: parseInt(id) });
    if (existingProperty) {
      return res.status(400).json({ message: "Property with this ID already exists" });
    }

    // Handle owner assignment
    let ownerId = null;
    let isAdminOwned = false;
    
    if (owner === 'admin') {
      isAdminOwned = true;
    } else {
      ownerId = new mongoose.Types.ObjectId(owner);
    }

    // Create property
    const property = await PropertyModel.create({
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
      amenities: Array.isArray(amenities) ? amenities : amenities.split(',').map((a: string) => a.trim()),
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
  } catch (error: any) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Generate Owner Statement for a property
 */
export const generateOwnerStatement = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Property ID, start date, and end date are required" 
      });
    }

    // Find the property
    const property = await PropertyModel.findOne({ id: parseInt(propertyId) });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Get invoices for the property
    const invoices = await getInvoicesService(
      parseInt(propertyId), 
      startDate as string, 
      endDate as string
    );

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
        owner: property.isAdminOwned ? 'Admin' : (property.owner as any)?.name || 'Unassigned',
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

  } catch (error: any) {
    console.error('Error in generateOwnerStatement:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete property
 */
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Find and delete the property
    const property = await PropertyModel.findOneAndDelete({ 
      $or: [
        { id: parseInt(propertyId) },
        { _id: propertyId }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    console.log(`Property ${property.id} (${property.name}) deleted successfully`);

    res.json({ 
      message: "Property deleted successfully",
      deletedProperty: {
        id: property.id,
        name: property.name
      }
    });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: error.message });
  }
};