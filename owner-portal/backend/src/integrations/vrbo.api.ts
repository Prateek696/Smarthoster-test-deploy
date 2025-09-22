import axios from 'axios';

const VRBO_API_URL = process.env.VRBO_API_URL || 'https://api.vrbo.com/v1';
const VRBO_API_KEY = process.env.VRBO_API_KEY;

export interface VRBOReview {
  id: string;
  property_id: string;
  guest_name: string;
  guest_location: string;
  rating: number;
  title: string;
  comment: string;
  review_date: string;
  response: string | null;
  response_date: string | null;
  language: string;
  is_verified: boolean;
  helpful_count: number;
}

export interface VRBOReviewsResponse {
  reviews: VRBOReview[];
  pagination: {
    has_next: boolean;
    next_page: number | null;
  };
  summary: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
  };
}

// Get reviews for a specific property
export const getVRBOReviews = async (
  propertyId: string,
  limit: number = 50,
  page: number = 1
): Promise<VRBOReviewsResponse> => {
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

    const { data } = await axios.get(
      `${VRBO_API_URL}/properties/${propertyId}/reviews?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${VRBO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching VRBO reviews:', error.response?.data || error.message);
    throw error;
  }
};

// Post a response to a review
export const respondToVRBOReview = async (
  reviewId: string,
  responseText: string
): Promise<any> => {
  try {
    if (!VRBO_API_KEY) {
      throw new Error("VRBO_API_KEY environment variable is not set");
    }

    console.log('Responding to VRBO review:', {
      reviewId,
      responseText,
      url: `${VRBO_API_URL}/reviews/${reviewId}/respond`
    });

    const { data } = await axios.post(
      `${VRBO_API_URL}/reviews/${reviewId}/respond`,
      {
        response: responseText
      },
      {
        headers: {
          'Authorization': `Bearer ${VRBO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error responding to VRBO review:', error.response?.data || error.message);
    throw error;
  }
};

// Get property details
export const getVRBOProperty = async (propertyId: string): Promise<any> => {
  try {
    if (!VRBO_API_KEY) {
      throw new Error("VRBO_API_KEY environment variable is not set");
    }

    const { data } = await axios.get(
      `${VRBO_API_URL}/properties/${propertyId}`,
      {
        headers: {
          'Authorization': `Bearer ${VRBO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching VRBO property:', error.response?.data || error.message);
    throw error;
  }
};

