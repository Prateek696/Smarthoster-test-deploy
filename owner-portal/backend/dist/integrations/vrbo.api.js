"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVRBOProperty = exports.respondToVRBOReview = exports.getVRBOReviews = void 0;
const axios_1 = __importDefault(require("axios"));
const VRBO_API_URL = process.env.VRBO_API_URL || 'https://api.vrbo.com/v1';
const VRBO_API_KEY = process.env.VRBO_API_KEY;
// Get reviews for a specific property
const getVRBOReviews = async (propertyId, limit = 50, page = 1) => {
    try {
        if (!VRBO_API_KEY) {
            console.log('[VRBO API] No API key set, returning mock data');
            return {
                reviews: [
                    {
                        id: `vrbo-mock-${Date.now()}`,
                        property_id: propertyId,
                        guest_name: 'David Chen',
                        guest_location: 'USA',
                        rating: 5,
                        title: 'Perfect family vacation!',
                        comment: 'Perfect for our family vacation! Spacious, well-equipped kitchen, and amazing views. The kids loved the balcony.',
                        review_date: new Date().toISOString(),
                        response: null,
                        response_date: null,
                        language: 'en',
                        is_verified: true,
                        helpful_count: 0
                    }
                ],
                pagination: {
                    has_next: false,
                    next_page: null
                },
                summary: {
                    total_reviews: 1,
                    average_rating: 5,
                    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
                }
            };
        }
        console.log('Fetching VRBO reviews:', {
            propertyId,
            limit,
            page,
            url: `${VRBO_API_URL}/properties/${propertyId}/reviews`
        });
        const params = new URLSearchParams({
            limit: limit.toString(),
            page: page.toString(),
            language: 'en'
        });
        const { data } = await axios_1.default.get(`${VRBO_API_URL}/properties/${propertyId}/reviews?${params}`, {
            headers: {
                'Authorization': `Bearer ${VRBO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error fetching VRBO reviews:', error.response?.data || error.message);
        throw error;
    }
};
exports.getVRBOReviews = getVRBOReviews;
// Post a response to a review
const respondToVRBOReview = async (reviewId, responseText) => {
    try {
        if (!VRBO_API_KEY) {
            throw new Error("VRBO_API_KEY environment variable is not set");
        }
        console.log('Responding to VRBO review:', {
            reviewId,
            responseText,
            url: `${VRBO_API_URL}/reviews/${reviewId}/respond`
        });
        const { data } = await axios_1.default.post(`${VRBO_API_URL}/reviews/${reviewId}/respond`, {
            response: responseText
        }, {
            headers: {
                'Authorization': `Bearer ${VRBO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error responding to VRBO review:', error.response?.data || error.message);
        throw error;
    }
};
exports.respondToVRBOReview = respondToVRBOReview;
// Get property details
const getVRBOProperty = async (propertyId) => {
    try {
        if (!VRBO_API_KEY) {
            throw new Error("VRBO_API_KEY environment variable is not set");
        }
        const { data } = await axios_1.default.get(`${VRBO_API_URL}/properties/${propertyId}`, {
            headers: {
                'Authorization': `Bearer ${VRBO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error fetching VRBO property:', error.response?.data || error.message);
        throw error;
    }
};
exports.getVRBOProperty = getVRBOProperty;
