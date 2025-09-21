import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Property from "../models/property.model";
import { UserModel } from "../models/User.model";

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/properties');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `property-${req.params.propertyId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
});

export const uploadPropertyImages = upload.array('images', 10); // Allow up to 10 images

// Add debugging middleware
export const debugMulter = (req: any, res: any, next: any) => {
  console.log('🔍 Multer debug middleware:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
    hasFiles: !!req.files,
    filesCount: req.files ? (req.files as Express.Multer.File[]).length : 0
  });
  next();
};

export const handleImageUpload = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;
    
    console.log('🔍 Image upload request:', {
      userId,
      propertyId,
      filesCount: req.files ? (req.files as Express.Multer.File[]).length : 0,
      files: req.files ? (req.files as Express.Multer.File[]).map(f => ({ name: f.originalname, size: f.size })) : []
    });
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      console.log('❌ No files uploaded');
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Find the property
    const property = await Property.findOne({
      id: parseInt(propertyId)
    });

    if (!property) {
      // Clean up uploaded files if property not found
      (req.files as Express.Multer.File[]).forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ message: "Property not found" });
    }

    // Check ownership/permissions
    if (property.owner && property.owner.toString() !== userId) {
      // Check if user is admin
      const user = await UserModel.findById(userId);
      if (!user || user.role !== 'admin') {
        // Clean up uploaded files if no permission
        (req.files as Express.Multer.File[]).forEach(file => {
          fs.unlinkSync(file.path);
        });
        return res.status(403).json({ message: "You don't have permission to upload images to this property" });
      }
    }
    
    // If property has no owner (admin-owned) or user is admin, allow upload

    // Generate URLs for the uploaded images
    const imageUrls = (req.files as Express.Multer.File[]).map(file => {
      return `/uploads/properties/${file.filename}`;
    });

    console.log('🔍 Generated image URLs:', imageUrls);

    // Update property with new images (replace existing images)
    const updatedProperty = await Property.findOneAndUpdate(
      { _id: property._id },
      { 
        images: imageUrls, // Replace the entire images array
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    console.log('🔍 Updated property images:', updatedProperty?.images);

    if (!updatedProperty) {
      return res.status(500).json({ message: "Failed to update property with images" });
    }

    console.log(`✅ Property ${propertyId} updated with ${imageUrls.length} new images`);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: imageUrls,
      property: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        images: updatedProperty.images
      }
    });

  } catch (error: any) {
    console.error('Error uploading images:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }
    
    res.status(500).json({
      message: error.message || "Failed to upload images",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const deletePropertyImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId, imageUrl } = req.params;
    
    console.log('🔍 deletePropertyImage called with:', { userId, propertyId, imageUrl });
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the property
    const property = await Property.findOne({
      id: parseInt(propertyId)
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check ownership/permissions
    console.log('🔍 Checking ownership:', { 
      propertyOwner: property.owner, 
      userId, 
      isAdminOwned: property.isAdminOwned 
    });
    
    if (property.isAdminOwned) {
      // For admin-owned properties, only admin can delete
      const user = await UserModel.findById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Only admin can delete images from admin-owned properties" });
      }
    } else if (property.owner && property.owner.toString() !== userId) {
      // For regular properties, check if user is admin
      const user = await UserModel.findById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to delete images from this property" });
      }
    }

    // Find the full image path in the property's images array
    const fullImagePath = property.images.find(img => img.includes(imageUrl));
    console.log('🔍 Found image path:', { imageUrl, fullImagePath, allImages: property.images });
    
    if (!fullImagePath) {
      return res.status(404).json({ message: "Image not found in property" });
    }

    // Remove image from property using the full path
    const updatedProperty = await Property.findOneAndUpdate(
      { _id: property._id },
      { 
        $pull: { images: fullImagePath },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(500).json({ message: "Failed to remove image from property" });
    }

    // Delete the actual file
    const imagePath = path.join(__dirname, '../../uploads/properties', path.basename(imageUrl));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    console.log(`✅ Image removed from property ${propertyId}`);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      property: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        images: updatedProperty.images
      }
    });

  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      message: error.message || "Failed to delete image",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
