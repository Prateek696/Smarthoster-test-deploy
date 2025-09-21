import { Router } from "express";
import { getReviews, getReviewStats, addReviewResponse, syncReviewsFromPlatforms } from "../services/review.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwner } from "../middlewares/role.middleware";

const router = Router();

// Get reviews for all properties - owners only
router.get("/all", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const { limit } = req.query;
      
      // Get all active property mappings
      const { getAllActiveMappings } = await import("../services/propertyMapping.service");
      const properties = getAllActiveMappings();
      
      const allReviews = [];
      for (const property of properties) {
        const reviews = await getReviews(property.internalId, limit ? Number(limit) : 50);
        allReviews.push(...reviews);
      }
      
      // Sort by date (newest first)
      allReviews.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
      
      res.json(allReviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get review statistics for all properties - owners only
router.get("/all/stats", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      // Get all active property mappings
      const { getAllActiveMappings } = await import("../services/propertyMapping.service");
      const properties = getAllActiveMappings();
      
      const allReviews = [];
      for (const property of properties) {
        const reviews = await getReviews(property.internalId, 100);
        allReviews.push(...reviews);
      }
      
      // Calculate stats from all reviews
      if (allReviews.length === 0) {
        return res.json({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          platformBreakdown: {}
        });
      }
      
      const totalReviews = allReviews.length;
      const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution = allReviews.reduce((dist, review) => {
        dist[review.rating as keyof typeof dist]++;
        return dist;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      
      const platformBreakdown = allReviews.reduce((breakdown, review) => {
        breakdown[review.platform] = (breakdown[review.platform] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>);
      
      res.json({
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        platformBreakdown
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Sync reviews for all properties - owners only
router.post("/sync-all", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      // Get all active property mappings
      const { getAllActiveMappings } = await import("../services/propertyMapping.service");
      const properties = getAllActiveMappings();
      
      let totalSynced = 0;
      for (const property of properties) {
        const syncedCount = await syncReviewsFromPlatforms(property.internalId);
        totalSynced += syncedCount;
      }
      
      res.json({ 
        message: `Successfully synced reviews for ${properties.length} properties`,
        syncedCount: totalSynced,
        propertiesSynced: properties.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get reviews for a property - owners only
router.get("/:propertyId", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { limit } = req.query;
      
      const reviews = await getReviews(Number(propertyId), limit ? Number(limit) : 10);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get review statistics - owners only
router.get("/:propertyId/stats", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      
      const stats = await getReviewStats(Number(propertyId));
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Add response to review - owners only
router.post("/:reviewId/response", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { responseText } = req.body;
      const respondedBy = req.user?.id;
      
      const review = await addReviewResponse(reviewId, responseText, respondedBy);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Sync reviews from platforms - owners only
router.post("/:propertyId/sync", 
  authMiddleware, 
  requireOwner, 
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      
      const syncedCount = await syncReviewsFromPlatforms(Number(propertyId));
      res.json({ message: `Synced ${syncedCount} reviews`, syncedCount });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;





