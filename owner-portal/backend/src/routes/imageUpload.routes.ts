import { Router } from "express";
import { handleImageUpload, deletePropertyImage, uploadPropertyImages, debugMulter } from "../controllers/imageUpload.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Upload images for a property - owners and admins can upload
router.post("/:propertyId", 
  authMiddleware,
  requireRole(['owner', 'admin']),
  (req, res, next) => {
    console.log('🔍 Image upload route hit:', req.params.propertyId);
    next();
  },
  debugMulter,
  uploadPropertyImages,
  handleImageUpload
);

// Delete a specific image from a property - owners and admins can delete
router.delete("/:propertyId/:imageUrl", 
  authMiddleware,
  requireRole(['owner', 'admin']),
  deletePropertyImage
);

export default router;
