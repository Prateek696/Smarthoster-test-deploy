"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingHotel = exports.respondToBookingReview = exports.getBookingReviews = void 0;
const axios_1 = __importDefault(require("axios"));
const BOOKING_API_URL = process.env.BOOKING_API_URL || 'https://distribution-xml.booking.com/2.5/json';
const BOOKING_API_KEY = process.env.BOOKING_API_KEY;
// Get reviews for a specific hotel
const getBookingReviews = async (hotelId, limit = 50, offset = 0) => {
    try {
        if (!BOOKING_API_KEY) {
            console.log('[BOOKING API] No API key set, returning mock data');
            return {
                reviews: [
                    {
                        id: `booking-mock-${Date.now()}`,
                        hotel_id: hotelId,
                        guest_name: 'Maria Garcia',
                        guest_country: 'Spain',
                        rating: 4,
                        title: 'Great stay!',
                        comment: 'The hotel was clean and comfortable. Great location with easy access to public transport.',
                        review_date: new Date().toISOString(),
                        response: null,
                        response_date: null,
                        language: 'en',
                        is_verified: true,
                        helpful_votes: 0
                    }
                ],
                pagination: {
                    has_more: false,
                    offset: 0
                },
                summary: {
                    total_reviews: 1,
                    average_rating: 4,
                    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 }
                }
            };
        }
        console.log('Fetching Booking.com reviews:', {
            hotelId,
            limit,
            offset,
            url: `${BOOKING_API_URL}/hotelReviews`
        });
        const params = new URLSearchParams({
            hotel_ids: hotelId,
            rows: limit.toString(),
            offset: offset.toString(),
            language: 'en'
        });
        const { data } = await axios_1.default.get(`${BOOKING_API_URL}/hotelReviews?${params}`, {
            headers: {
                'X-API-Key': BOOKING_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error fetching Booking.com reviews:', error.response?.data || error.message);
        throw error;
    }
};
exports.getBookingReviews = getBookingReviews;
// Post a response to a review
const respondToBookingReview = async (reviewId, responseText) => {
    try {
        if (!BOOKING_API_KEY) {
            throw new Error("BOOKING_API_KEY environment variable is not set");
        }
        console.log('Responding to Booking.com review:', {
            reviewId,
            responseText,
            url: `${BOOKING_API_URL}/reviewResponse`
        });
        const { data } = await axios_1.default.post(`${BOOKING_API_URL}/reviewResponse`, {
            review_id: reviewId,
            response: responseText
        }, {
            headers: {
                'X-API-Key': BOOKING_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error responding to Booking.com review:', error.response?.data || error.message);
        throw error;
    }
};
exports.respondToBookingReview = respondToBookingReview;
// Get hotel details
const getBookingHotel = async (hotelId) => {
    try {
        if (!BOOKING_API_KEY) {
            throw new Error("BOOKING_API_KEY environment variable is not set");
        }
        const { data } = await axios_1.default.get(`${BOOKING_API_URL}/hotels?hotel_ids=${hotelId}`, {
            headers: {
                'X-API-Key': BOOKING_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return data;
    }
    catch (error) {
        console.error('Error fetching Booking.com hotel:', error.response?.data || error.message);
        throw error;
    }
};
exports.getBookingHotel = getBookingHotel;
