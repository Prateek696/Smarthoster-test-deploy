import axios from 'axios';

const BOOKING_API_URL = process.env.BOOKING_API_URL || 'https://distribution-xml.booking.com/2.5/json';
const BOOKING_API_KEY = process.env.BOOKING_API_KEY;

export interface BookingReview {
  id: string;
  hotel_id: string;
  guest_name: string;
  guest_country: string;
  rating: number;
  title: string;
  comment: string;
  review_date: string;
  response: string | null;
  response_date: string | null;
  language: string;
  is_verified: boolean;
  helpful_votes: number;
}

export interface BookingReviewsResponse {
  reviews: BookingReview[];
  pagination: {
    has_more: boolean;
    offset: number;
  };
  summary: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
  };
}

// Get reviews for a specific hotel
export const getBookingReviews = async (
  hotelId: string,
  limit: number = 50,
  offset: number = 0
): Promise<BookingReviewsResponse> => {
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

    const { data } = await axios.get(
      `${BOOKING_API_URL}/hotelReviews?${params}`,
      {
        headers: {
          'X-API-Key': BOOKING_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching Booking.com reviews:', error.response?.data || error.message);
    throw error;
  }
};

// Post a response to a review
export const respondToBookingReview = async (
  reviewId: string,
  responseText: string
): Promise<any> => {
  try {
    if (!BOOKING_API_KEY) {
      throw new Error("BOOKING_API_KEY environment variable is not set");
    }

    console.log('Responding to Booking.com review:', {
      reviewId,
      responseText,
      url: `${BOOKING_API_URL}/reviewResponse`
    });

    const { data } = await axios.post(
      `${BOOKING_API_URL}/reviewResponse`,
      {
        review_id: reviewId,
        response: responseText
      },
      {
        headers: {
          'X-API-Key': BOOKING_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error responding to Booking.com review:', error.response?.data || error.message);
    throw error;
  }
};

// Get hotel details
export const getBookingHotel = async (hotelId: string): Promise<any> => {
  try {
    if (!BOOKING_API_KEY) {
      throw new Error("BOOKING_API_KEY environment variable is not set");
    }

    const { data } = await axios.get(
      `${BOOKING_API_URL}/hotels?hotel_ids=${hotelId}`,
      {
        headers: {
          'X-API-Key': BOOKING_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching Booking.com hotel:', error.response?.data || error.message);
    throw error;
  }
};