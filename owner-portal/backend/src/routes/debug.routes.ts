import express from 'express';
import Property from '../models/property.model';

const router = express.Router();

// Debug endpoint to test property lookup
router.get('/property/:id', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    console.log(`🔍 Debug: Looking up property ${propertyId}`);
    
    const property = await Property.findOne({ id: propertyId });
    
    if (property) {
      console.log(`✅ Property found: ${property.name}, requiresCommission: ${property.requiresCommission}`);
      res.json({
        success: true,
        property: {
          id: property.id,
          name: property.name,
          requiresCommission: property.requiresCommission
        }
      });
    } else {
      console.log(`❌ Property ${propertyId} not found`);
      res.json({
        success: false,
        message: `Property ${propertyId} not found`
      });
    }
  } catch (error: any) {
    console.error('❌ Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
});

export default router;



