import { apiClient } from './apiClient';

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  images: string[];
  property: {
    id: number;
    name: string;
    images: string[];
  };
}

export interface ImageDeleteResponse {
  success: boolean;
  message: string;
  property: {
    id: number;
    name: string;
    images: string[];
  };
}

// Upload images for a property
export const uploadPropertyImages = async (
  propertyId: string,
  images: File[]
): Promise<ImageUploadResponse> => {
  console.log('🔍 uploadPropertyImages called with:', {
    propertyId,
    imagesCount: images.length,
    images: images.map(img => ({ name: img.name, size: img.size, type: img.type }))
  });

  const formData = new FormData();
  
  images.forEach((image, index) => {
    console.log(`🔍 Appending image ${index}:`, { name: image.name, size: image.size, type: image.type });
    formData.append('images', image);
  });

  console.log('🔍 FormData entries:', Array.from(formData.entries()));

  const response = await apiClient.post(`/image-upload/${propertyId}`, formData, {
    headers: {
      'Content-Type': undefined, // Let Axios set the correct multipart boundary
    },
  });

  return response;
};

// Delete a specific image from a property
export const deletePropertyImage = async (
  propertyId: string,
  imageUrl: string
): Promise<ImageDeleteResponse> => {
  console.log('🔍 deletePropertyImage called with:', { propertyId, imageUrl });
  // Don't double-encode the URL - it's already encoded
  const response = await apiClient.delete(`/image-upload/${propertyId}/${imageUrl}`);
  return response;
};
