"use strict";
// Property mapping service to map internal property IDs to platform-specific IDs
// This would typically be stored in a database, but for now we'll use a configuration object
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePropertyMapping = exports.addPropertyMapping = exports.getPropertyMappings = exports.getAllActiveMappings = exports.getPlatformId = exports.getPropertyMapping = void 0;
// Mock property mappings - in production, this would come from a database
const propertyMappings = [
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
const getPropertyMapping = (internalId) => {
    return propertyMappings.find(mapping => mapping.internalId === internalId) || null;
};
exports.getPropertyMapping = getPropertyMapping;
const getPlatformId = (internalId, platform) => {
    const mapping = (0, exports.getPropertyMapping)(internalId);
    return mapping?.platformMappings[platform] || null;
};
exports.getPlatformId = getPlatformId;
const getAllActiveMappings = () => {
    return propertyMappings.filter(mapping => mapping.isActive);
};
exports.getAllActiveMappings = getAllActiveMappings;
const getPropertyMappings = () => {
    return propertyMappings;
};
exports.getPropertyMappings = getPropertyMappings;
const addPropertyMapping = (mapping) => {
    const existingIndex = propertyMappings.findIndex(m => m.internalId === mapping.internalId);
    if (existingIndex >= 0) {
        propertyMappings[existingIndex] = mapping;
    }
    else {
        propertyMappings.push(mapping);
    }
};
exports.addPropertyMapping = addPropertyMapping;
const updatePropertyMapping = (internalId, platform, platformId) => {
    const mapping = (0, exports.getPropertyMapping)(internalId);
    if (mapping) {
        mapping.platformMappings[platform] = platformId;
        return true;
    }
    return false;
};
exports.updatePropertyMapping = updatePropertyMapping;
