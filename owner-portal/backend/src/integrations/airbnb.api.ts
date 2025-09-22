import axios from 'axios';

const AIRBNB_API_URL = process.env.AIRBNB_API_URL || 'https://api.airbnb.com/v2';
const AIRBNB_API_KEY = process.env.AIRBNB_API_KEY;

export interface AirbnbReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
  response: string | null;
  response_created_at: string | null;
  language: string;
  is_verified: boolean;
}

export interface AirbnbReviewsResponse {
  reviews: AirbnbReview[];
  pagination: {
    has_next_page: boolean;
    next_cursor: string | null;
  };
  summary: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
  };
}

// Get reviews for a specific listing
export const getAirbnbReviews = async (
  listingId: string,
  limit: number = 50,
  cursor?: string
): Promise<AirbnbReviewsResponse> => {
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

    const { data } = await axios.get(
      `${AIRBNB_API_URL}/listings/${listingId}/reviews?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRBNB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching Airbnb reviews:', error.response?.data || error.message);
    throw error;
  }
};

// Post a response to a review
export const respondToAirbnbReview = async (
  reviewId: string,
  responseText: string
): Promise<any> => {
  try {
    if (!AIRBNB_API_KEY) {
      throw new Error("AIRBNB_API_KEY environment variable is not set");
    }

    console.log('Responding to Airbnb review:', {
      reviewId,
      responseText,
      url: `${AIRBNB_API_URL}/reviews/${reviewId}/respond`
    });

    const { data } = await axios.post(
      `${AIRBNB_API_URL}/reviews/${reviewId}/respond`,
      {
        response: responseText
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRBNB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error responding to Airbnb review:', error.response?.data || error.message);
    throw error;
  }
};

// Get listing details
export const getAirbnbListing = async (listingId: string): Promise<any> => {
  try {
    if (!AIRBNB_API_KEY) {
      throw new Error("AIRBNB_API_KEY environment variable is not set");
    }

    const { data } = await axios.get(
      `${AIRBNB_API_URL}/listings/${listingId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRBNB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching Airbnb listing:', error.response?.data || error.message);
    throw error;
  }
};

