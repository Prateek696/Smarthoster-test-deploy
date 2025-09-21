"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirbnbListing = exports.respondToAirbnbReview = exports.getAirbnbReviews = void 0;
const axios_1 = __importDefault(require("axios"));
const AIRBNB_API_URL = process.env.AIRBNB_API_URL || 'https://api.airbnb.com/v2';
const AIRBNB_API_KEY = process.env.AIRBNB_API_KEY;
// Get reviews for a specific listing
const getAirbnbReviews = async (listingId, limit = 50, cursor) => {
    try {
        if (!AIRBNB_API_KEY) {
            console.log('[AIRBNB API] No API key set, returning mock data');
            return {
                reviews: [
                    {
                        id: `airbnb-mock-${Date.now()}`,
                        listing_id: listingId,
                        reviewer_id: 'mock-reviewer-123',
                        reviewer_name: 'John Smith',
                        reviewer_avatar: 'https://example.com/avatar.jpg',
                        rating: 5,
                        comment: 'Amazing stay! The property was perfect and the host was very responsive.',
                        created_at: new Date().toISOString(),
                        response: null,
                        response_created_at: null,
                        language: 'en',
                        is_verified: true
                    }
                ],
                pagination: {
                    has_next_page: false,
                    next_cursor: null
                },
                summary: {
                    total_reviews: 1,
                    average_rating: 5,
                    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
                }
            };
        }
        console.log('Fetching Airbnb reviews:', {
            listingId,
            limit,
            cursor,
            url: `${AIRBNB_API_URL}/listings/${listingId}/reviews`
        });
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(cursor && { cursor })
        });
        const { data } = await axios_1.default.get(`${AIRBNB_API_URL}/listings/${listingId}/reviews?${params}`, {
            headers: {
                'Authorization': `Bearer ${AIRBNB_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error fetching Airbnb reviews:', error.response?.data || error.message);
        throw error;
    }
};
exports.getAirbnbReviews = getAirbnbReviews;
// Post a response to a review
const respondToAirbnbReview = async (reviewId, responseText) => {
    try {
        if (!AIRBNB_API_KEY) {
            throw new Error("AIRBNB_API_KEY environment variable is not set");
        }
        console.log('Responding to Airbnb review:', {
            reviewId,
            responseText,
            url: `${AIRBNB_API_URL}/reviews/${reviewId}/respond`
        });
        const { data } = await axios_1.default.post(`${AIRBNB_API_URL}/reviews/${reviewId}/respond`, {
            response: responseText
        }, {
            headers: {
                'Authorization': `Bearer ${AIRBNB_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error responding to Airbnb review:', error.response?.data || error.message);
        throw error;
    }
};
exports.respondToAirbnbReview = respondToAirbnbReview;
// Get listing details
const getAirbnbListing = async (listingId) => {
    try {
        if (!AIRBNB_API_KEY) {
            throw new Error("AIRBNB_API_KEY environment variable is not set");
        }
        const { data } = await axios_1.default.get(`${AIRBNB_API_URL}/listings/${listingId}`, {
            headers: {
                'Authorization': `Bearer ${AIRBNB_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error fetching Airbnb listing:', error.response?.data || error.message);
        throw error;
    }
};
exports.getAirbnbListing = getAirbnbListing;
