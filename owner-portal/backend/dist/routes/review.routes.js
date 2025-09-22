"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_service_1 = require("../services/review.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Get reviews for all properties - owners only
router.get("/all", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const { limit } = req.query;
        // Get all active property mappings
        const { getAllActiveMappings } = await Promise.resolve().then(() => __importStar(require("../services/propertyMapping.service")));
        const properties = getAllActiveMappings();
        const allReviews = [];
        for (const property of properties) {
            const reviews = await (0, review_service_1.getReviews)(property.internalId, limit ? Number(limit) : 50);
            allReviews.push(...reviews);
        }
        // Sort by date (newest first)
        allReviews.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
        res.json(allReviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get review statistics for all properties - owners only
router.get("/all/stats", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        // Get all active property mappings
        const { getAllActiveMappings } = await Promise.resolve().then(() => __importStar(require("../services/propertyMapping.service")));
        const properties = getAllActiveMappings();
        const allReviews = [];
        for (const property of properties) {
            const reviews = await (0, review_service_1.getReviews)(property.internalId, 100);
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
            dist[review.rating]++;
            return dist;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        const platformBreakdown = allReviews.reduce((breakdown, review) => {
            breakdown[review.platform] = (breakdown[review.platform] || 0) + 1;
            return breakdown;
        }, {});
        res.json({
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
            platformBreakdown
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Sync reviews for all properties - owners only
router.post("/sync-all", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        // Get all active property mappings
        const { getAllActiveMappings } = await Promise.resolve().then(() => __importStar(require("../services/propertyMapping.service")));
        const properties = getAllActiveMappings();
        let totalSynced = 0;
        for (const property of properties) {
            const syncedCount = await (0, review_service_1.syncReviewsFromPlatforms)(property.internalId);
            totalSynced += syncedCount;
        }
        res.json({
            message: `Successfully synced reviews for ${properties.length} properties`,
            syncedCount: totalSynced,
            propertiesSynced: properties.length
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get reviews for a property - owners only
router.get("/:propertyId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { limit } = req.query;
        const reviews = await (0, review_service_1.getReviews)(Number(propertyId), limit ? Number(limit) : 10);
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get review statistics - owners only
router.get("/:propertyId/stats", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const stats = await (0, review_service_1.getReviewStats)(Number(propertyId));
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Add response to review - owners only
router.post("/:reviewId/response", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { responseText } = req.body;
        const respondedBy = req.user?.id;
        const review = await (0, review_service_1.addReviewResponse)(reviewId, responseText, respondedBy);
        res.json(review);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Sync reviews from platforms - owners only
router.post("/:propertyId/sync", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const syncedCount = await (0, review_service_1.syncReviewsFromPlatforms)(Number(propertyId));
        res.json({ message: `Synced ${syncedCount} reviews`, syncedCount });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
