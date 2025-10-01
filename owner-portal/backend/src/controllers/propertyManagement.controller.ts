import { Request, Response } from "express";
import mongoose from "mongoose";
import { getPropertiesService } from "../services/property.service";
import Property from "../models/property.model";
import { UserModel } from "../models/User.model";
import { getHostawayListingDetails } from "../integrations/hostaway.api";

export const getProperties = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await getPropertiesService(userId, userRole);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: error.message || "Failed to fetch properties" });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;
    const updateData = req.body;
    
    console.log('🔍 Update Property Request:', {
      userId,
      propertyId,
      updateData: Object.keys(updateData),
      bodyPropertyId: updateData.propertyId
    });
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Handle property ID from params or body
    let actualPropertyId = propertyId;
    if (!actualPropertyId && updateData.propertyId) {
      actualPropertyId = updateData.propertyId.toString();
    }
    
    if (!actualPropertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Validate allowed fields for update
    const allowedFields = [
      'name', 'address', 'type', 'bedrooms', 'bathrooms', 
      'maxGuests', 'status', 'requiresCommission', 'images', 'amenities', 'owner'
    ];
    
    const filteredUpdateData: any = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    // Handle owner assignment
    if (filteredUpdateData.owner !== undefined) {
      if (filteredUpdateData.owner === 'admin') {
        filteredUpdateData.owner = null;
        filteredUpdateData.isAdminOwned = true;
      } else if (filteredUpdateData.owner === '' || filteredUpdateData.owner === null) {
        filteredUpdateData.owner = null;
        filteredUpdateData.isAdminOwned = false;
      } else {
        // Convert to ObjectId for regular owner assignment
        filteredUpdateData.owner = new mongoose.Types.ObjectId(filteredUpdateData.owner);
        filteredUpdateData.isAdminOwned = false;
      }
    }

    // Add validation for specific fields
    if (filteredUpdateData.bedrooms !== undefined && filteredUpdateData.bedrooms < 0) {
      return res.status(400).json({ message: "Bedrooms must be 0 or greater" });
    }
    
    if (filteredUpdateData.bathrooms !== undefined && filteredUpdateData.bathrooms < 0) {
      return res.status(400).json({ message: "Bathrooms must be 0 or greater" });
    }
    
    if (filteredUpdateData.maxGuests !== undefined && filteredUpdateData.maxGuests < 1) {
      return res.status(400).json({ message: "Max guests must be 1 or greater" });
    }

    if (filteredUpdateData.type && !['Apartment', 'House', 'Villa', 'Condominium', 'Penthouse', 'Studio'].includes(filteredUpdateData.type)) {
      return res.status(400).json({ message: "Invalid property type" });
    }

    if (filteredUpdateData.status && !['active', 'inactive', 'maintenance'].includes(filteredUpdateData.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the property and verify ownership
    // Try to find by numeric ID first, then by MongoDB _id
    let property = await Property.findOne({ 
      id: parseInt(actualPropertyId)
    });
    
    if (!property) {
      // Try finding by MongoDB _id
      property = await Property.findOne({ 
        _id: actualPropertyId
      });
    }
    
    // Check ownership/permissions after finding the property
    if (property) {
      // If property is admin-owned, only admin can update it
      if (property.isAdminOwned) {
        const user = await UserModel.findById(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Only admin can update admin-owned properties" });
        }
      }
      // If property has an owner, check if user is the owner or admin
      else if (property.owner && property.owner.toString() !== userId) {
        const user = await UserModel.findById(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "You don't have permission to update this property" });
        }
      }
    }

    if (!property) {
      return res.status(404).json({ message: "Property not found or you don't have permission to update it" });
    }

    console.log('✅ Found property:', {
      id: property.id,
      name: property.name,
      _id: property._id
    });

    // Update the property using the found property's ID
    const updatedProperty = await Property.findOneAndUpdate(
      { _id: property._id },
      { 
        ...filteredUpdateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(500).json({ message: "Failed to update property" });
    }

    console.log(`✅ Property ${actualPropertyId} updated successfully:`, {
      updatedFields: Object.keys(filteredUpdateData),
      propertyName: updatedProperty.name,
      propertyId: updatedProperty.id
    });

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        address: updatedProperty.address,
        type: updatedProperty.type,
        bedrooms: updatedProperty.bedrooms,
        bathrooms: updatedProperty.bathrooms,
        maxGuests: updatedProperty.maxGuests,
        status: updatedProperty.status,
        requiresCommission: updatedProperty.requiresCommission,
        images: updatedProperty.images,
        amenities: updatedProperty.amenities,
        updatedAt: updatedProperty.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error updating property:', error);
    res.status(500).json({
      message: error.message || "Failed to update property",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Fetch property details from Hostaway by listing ID
 * Auto-populates property form fields
 */
export const fetchHostawayPropertyDetails = async (req: Request, res: Response) => {
  try {
    const { hostawayListingId } = req.params;
    
    if (!hostawayListingId) {
      return res.status(400).json({ message: "Hostaway listing ID is required" });
    }

    const listingId = parseInt(hostawayListingId);
    
    if (isNaN(listingId)) {
      return res.status(400).json({ message: "Invalid Hostaway listing ID format" });
    }

    console.log(`🔍 Fetching Hostaway property details for listing ID: ${listingId}`);

    const propertyDetails = await getHostawayListingDetails(listingId);

    res.status(200).json({
      success: true,
      data: propertyDetails,
      message: "Property details fetched successfully from Hostaway"
    });

  } catch (error: any) {
    console.error('❌ Error fetching Hostaway property details:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch property details from Hostaway",
      details: error.details
    });
  }
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get properties based on user role
    let properties;
    if (userRole === 'accountant') {
      // Accountants can see all properties
      properties = await Property.find({});
    } else {
      // Owners and other roles see only their properties (exclude admin properties)
      properties = await Property.find({ owner: userId, isAdminOwned: false });
    }
    
    // For now, return basic metrics with mock data
    // In a real application, you would calculate these from actual booking/revenue data
    const metrics = {
      totalRevenue: 0,
      totalBookings: 0,
      totalNights: 0,
      averageOccupancy: 0,
      averageDailyRate: 0,
      properties: properties.map(property => ({
        id: property.id,
        name: property.name,
        revenue: 0,
        bookings: 0,
        occupancy: 0,
        nights: 0
      })),
      recentBookings: []
    };

    res.status(200).json(metrics);
  } catch (error: any) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      message: error.message || "Failed to fetch dashboard metrics",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
