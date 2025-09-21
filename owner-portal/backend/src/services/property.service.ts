import Property from '../models/property.model';

// Get properties for a specific owner or all properties for accountants/admin
export const getPropertiesService = async (ownerId: string, userRole?: string, selectedOwnerId?: string) => {
  try {
    let properties;
    
    // If user is admin and has selected a specific owner, show only that owner's properties
    if (userRole === 'admin' && selectedOwnerId) {
      if (selectedOwnerId === 'admin') {
        // Show only admin-owned properties
        properties = await Property.find({ isAdminOwned: true });
      } else {
        // Show only properties owned by the selected owner (exclude admin properties)
        properties = await Property.find({ owner: selectedOwnerId, isAdminOwned: false });
      }
    }
    // If user is admin and no specific owner selected, show all properties
    else if (userRole === 'admin') {
      properties = await Property.find({});
    }
    // If user is accountant, show all properties
    else if (userRole === 'accountant') {
      properties = await Property.find({});
    } else {
      // For owners and other roles, show only their properties (exclude admin properties)
      properties = await Property.find({ owner: ownerId, isAdminOwned: false });
    }

    console.log('🔍 getPropertiesService returning:', {
      userRole,
      selectedOwnerId,
      propertiesCount: properties.length,
      propertyIds: properties.map(p => p.id),
      propertyNames: properties.map(p => p.name),
      adminProperties: properties.filter(p => p.isAdminOwned).length
    });

    return {
      properties,
      total: properties.length
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const getCompanyNameByPropertyId = async (propertyId: number, field: string) => {
  try {
    const property = await Property.findOne({ id: propertyId });
    if (!property) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    return (property as any)[field] || property.name || `Property ${propertyId}`;
  } catch (error) {
    console.error('Error fetching company name:', error);
    throw error;
  }
};