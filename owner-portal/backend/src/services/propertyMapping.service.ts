// Property mapping service to map internal property IDs to platform-specific IDs
// This would typically be stored in a database, but for now we'll use a configuration object

export interface PropertyMapping {
  internalId: number;
  platformMappings: {
    hostaway?: string;
  };
  propertyName: string;
  isActive: boolean;
}

// Mock property mappings - in production, this would come from a database
const propertyMappings: PropertyMapping[] = [
  {
    internalId: 392776,
    platformMappings: {
      hostaway: '392776'
    },
    propertyName: 'Piece of Heaven',
    isActive: true
  },
  {
    internalId: 392777,
    platformMappings: {
      hostaway: '392777'
    },
    propertyName: 'Cozy Downtown Apartment',
    isActive: true
  },
  {
    internalId: 392778,
    platformMappings: {
      hostaway: '392778'
    },
    propertyName: 'Luxury Beach House',
    isActive: true
  },
  {
    internalId: 392780,
    platformMappings: {
      hostaway: '392780'
    },
    propertyName: 'Lote 16 Pt1 4-B',
    isActive: true
  },
  {
    internalId: 392779,
    platformMappings: {
      hostaway: '392779'
    },
    propertyName: 'Lote 12 4-A',
    isActive: true
  },
  {
    internalId: 392781,
    platformMappings: {
      hostaway: '392781'
    },
    propertyName: 'Lote 7 3-A',
    isActive: true
  }
];

export const getPropertyMapping = (internalId: number): PropertyMapping | null => {
  return propertyMappings.find(mapping => mapping.internalId === internalId) || null;
};

export const getPlatformId = (internalId: number, platform: 'hostaway'): string | null => {
  const mapping = getPropertyMapping(internalId);
  return mapping?.platformMappings[platform] || null;
};

export const getAllActiveMappings = (): PropertyMapping[] => {
  return propertyMappings.filter(mapping => mapping.isActive);
};

export const getPropertyMappings = (): PropertyMapping[] => {
  return propertyMappings;
};

export const addPropertyMapping = (mapping: PropertyMapping): void => {
  const existingIndex = propertyMappings.findIndex(m => m.internalId === mapping.internalId);
  if (existingIndex >= 0) {
    propertyMappings[existingIndex] = mapping;
  } else {
    propertyMappings.push(mapping);
  }
};

export const updatePropertyMapping = (internalId: number, platform: 'hostaway', platformId: string): boolean => {
  const mapping = getPropertyMapping(internalId);
  if (mapping) {
    mapping.platformMappings[platform] = platformId;
    return true;
  }
  return false;
};
