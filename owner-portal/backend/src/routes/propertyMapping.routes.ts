import { Router } from 'express';
import { 
  getPropertyMappings, 
  getPropertyMapping, 
  addPropertyMapping, 
  updatePropertyMapping 
} from '../services/propertyMapping.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOwner, requireOwnerOrAccountant } from '../middlewares/role.middleware';
import { USER_ROLES } from '../constants/roles';

const router = Router();

// Get all property mappings - owners and accountants
router.get('/', 
  authMiddleware, 
  requireOwnerOrAccountant, 
  async (req, res) => {
    try {
      const mappings = getPropertyMappings();
      res.json({ mappings });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get specific property mapping - owners and accountants
router.get('/:propertyId', 
  authMiddleware, 
  requireOwnerOrAccountant, 
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      const mapping = getPropertyMapping(Number(propertyId));
      
      if (!mapping) {
        return res.status(404).json({ message: 'Property mapping not found' });
      }
      
      res.json({ mapping });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Add new property mapping - owners only
router.post('/', 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const mappingData = req.body;
      addPropertyMapping(mappingData);
      res.json({ message: 'Property mapping added successfully', mapping: mappingData });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update property mapping - owners only
router.put('/:propertyId', 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { platform, platformId } = req.body;
      
      const success = updatePropertyMapping(Number(propertyId), platform, platformId);
      
      if (!success) {
        return res.status(404).json({ message: 'Property mapping not found' });
      }
      
      res.json({ message: 'Property mapping updated successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;





