import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  AlertCircle,
  Loader,
  Upload,
  X
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { getImageUrl } from '../../utils/imageUtils';
import {
  fetchPropertiesAsync,
  createPropertyAsync,
  updatePropertyAsync,
  deletePropertyAsync,
  testHostkitConnectionAsync,
  clearError,
  clearHostkitTestResult,
  setSelectedProperty
} from '../../store/propertyManagement.slice';
import { CreatePropertyData } from '../../services/properties.api';
import { uploadPropertyImages, deletePropertyImage } from '../../services/imageUpload.api';
import { canUpdateProperties } from '../../utils/roleUtils';

interface PropertyManagementProps {
  filteredProperties?: any[]; // Properties filtered by admin dashboard
  onPropertyUpdate?: () => void; // Callback to refresh properties in parent component
  owners?: any[]; // Available owners for assignment
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({ filteredProperties, onPropertyUpdate, owners = [] }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    properties: reduxProperties,
    selectedProperty,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
    error,
    hostkitTestResult
  } = useSelector((state: RootState) => state.propertyManagement);
  
  // Use filtered properties if provided, otherwise use Redux properties
  const properties = filteredProperties || reduxProperties;
  
  const canUpdate = canUpdateProperties(user?.role || null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [localSelectedProperty, setLocalSelectedProperty] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState<CreatePropertyData>({
    id: 0,
    name: '',
    address: '',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    hostkitId: '',
    hostkitApiKey: '',
    status: 'active',
    images: [],
    amenities: [],
    owner: '' // Add owner field
  });

  useEffect(() => {
    dispatch(fetchPropertiesAsync());
  }, [dispatch]);

  // Listen for edit events from AdminDashboard
  useEffect(() => {
    const handleEditPropertyEvent = (event: CustomEvent) => {
      const property = event.detail.property;
      if (property) {
        handleEdit(property);
      }
    };

    window.addEventListener('editProperty', handleEditPropertyEvent as EventListener);
    
    return () => {
      window.removeEventListener('editProperty', handleEditPropertyEvent as EventListener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'id' || name === 'bedrooms' || name === 'bathrooms' || name === 'maxGuests' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenities = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleTestConnection = async () => {
    if (formData.hostkitId && formData.hostkitApiKey) {
      await dispatch(testHostkitConnectionAsync({
        hostkitId: formData.hostkitId,
        apiKey: formData.hostkitApiKey
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('🔍 Files selected:', files.length, files.map(f => f.name));
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async () => {
    console.log('🔍 handleImageUpload called with:', {
      localSelectedProperty: localSelectedProperty,
      selectedImages: selectedImages,
      selectedImagesLength: selectedImages.length,
      selectedImagesDetails: selectedImages.map(img => ({ name: img.name, size: img.size, type: img.type }))
    });

    if (!localSelectedProperty || selectedImages.length === 0) {
      console.log('❌ No property selected or no images selected');
      return;
    }

    console.log('🔍 Starting image upload:', {
      propertyId: localSelectedProperty.id,
      selectedImages: selectedImages.length,
      imageNames: selectedImages.map(img => img.name)
    });

    setIsUploadingImages(true);
    try {
      const response = await uploadPropertyImages(localSelectedProperty.id.toString(), selectedImages);
      console.log('✅ Images uploaded successfully:', response);
      console.log('🔍 Response property images:', response.property?.images);
      console.log('🔍 Current localSelectedProperty images:', localSelectedProperty.images);
      
      // Update local state immediately to reflect the new images
      if (response.property && response.property.images) {
        const updatedProperty = {
          ...localSelectedProperty,
          images: response.property.images
        };
        console.log('🔍 Setting localSelectedProperty to:', updatedProperty.images);
        setLocalSelectedProperty(updatedProperty);
      }
      
      // Refresh the property list to show updated images
      dispatch(fetchPropertiesAsync());
      // Also refresh properties in parent component if callback provided
      if (onPropertyUpdate) {
        console.log('🔄 Calling onPropertyUpdate callback to refresh parent properties');
        onPropertyUpdate();
      } else {
        console.log('⚠️ No onPropertyUpdate callback provided');
      }
      setSelectedImages([]);
      
      // Clear the file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('❌ Error uploading images:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!localSelectedProperty) return;

    try {
      // Extract just the filename from the full path
      const filename = imageUrl.split('/').pop();
      console.log('🔍 Deleting image:', { imageUrl, filename });
      const response = await deletePropertyImage(localSelectedProperty.id.toString(), filename || imageUrl);
      console.log('✅ Image deleted successfully:', response);
      
      // Update local state immediately to reflect the change
      const updatedImages = localSelectedProperty.images.filter((img: string) => img !== imageUrl);
      setLocalSelectedProperty({
        ...localSelectedProperty,
        images: updatedImages
      });
      
      // Refresh the property list to show updated images
      dispatch(fetchPropertiesAsync());
      // Also refresh properties in parent component if callback provided
      if (onPropertyUpdate) {
        onPropertyUpdate();
      }
      
    } catch (error) {
      console.error('❌ Error deleting image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Form submission debug:', {
      showEditForm,
      selectedProperty: selectedProperty ? selectedProperty.id : null,
      selectedPropertyId: selectedProperty?._id,
      localSelectedProperty: localSelectedProperty ? localSelectedProperty.id : null,
      localSelectedPropertyId: localSelectedProperty?._id,
      formData: Object.keys(formData)
    });
    
    if (showEditForm && localSelectedProperty) {
      // Don't include images field if it's empty to preserve existing images
      const updateData = { ...formData };
      console.log('🔍 Original formData:', formData);
      
      if (!updateData.images || updateData.images.length === 0) {
        delete updateData.images;
        console.log('🔄 Excluding empty images field from update to preserve existing images');
      }
      
      console.log('🔍 Final updateData:', updateData);
      
      console.log('✅ Calling updatePropertyAsync with:', {
        propertyId: localSelectedProperty._id,
        propertyData: updateData
      });
      
      const result = await dispatch(updatePropertyAsync({
        propertyId: localSelectedProperty._id!, // Use MongoDB _id for the API call
        propertyData: updateData
      }));
      
      console.log('🔍 Update result:', result);
      
      if (updatePropertyAsync.fulfilled.match(result)) {
        console.log('✅ Property update successful');
        setShowEditForm(false);
        resetForm();
        // Refresh the property list to show the updated property
        dispatch(fetchPropertiesAsync());
        // Also refresh properties in parent component if callback provided
        if (onPropertyUpdate) {
          onPropertyUpdate();
        }
      } else if (updatePropertyAsync.rejected.match(result)) {
        console.error('❌ Property update failed:', result.payload);
        console.error('❌ Update error details:', result.error);
        console.error('❌ Full result object:', result);
        
        // Show error to user
        alert(`Property update failed: ${result.payload || result.error || 'Unknown error'}`);
      }
    } else {
      console.log('❌ Calling createPropertyAsync instead of update - this is the problem!');
      console.log('showEditForm:', showEditForm);
      console.log('selectedProperty:', selectedProperty);
      console.log('localSelectedProperty:', localSelectedProperty);
      try {
        const result = await dispatch(createPropertyAsync(formData));
        if (createPropertyAsync.fulfilled.match(result)) {
          // Upload images if any were selected
          if (selectedImages.length > 0) {
            try {
              setIsUploadingImages(true);
              await uploadPropertyImages(formData.id.toString(), selectedImages);
              console.log('✅ Images uploaded successfully for new property:', formData.id);
              setSelectedImages([]); // Clear selected images
            } catch (imageError) {
              console.error('❌ Error uploading images:', imageError);
              // Don't fail the entire operation if image upload fails
            } finally {
              setIsUploadingImages(false);
            }
          }
          
          setShowCreateForm(false);
          resetForm();
          // Refresh the property list to show the new property
          await dispatch(fetchPropertiesAsync());
          // Also refresh properties in parent component if callback provided
          if (onPropertyUpdate) {
            onPropertyUpdate();
          }
        }
      } catch (error) {
        console.error('Error creating property:', error);
      }
    }
  };

  const handleEdit = (property: any) => {
    console.log('🔍 handleEdit called with property:', {
      id: property.id,
      _id: property._id,
      name: property.name,
      hostkitApiKey: property.hostkitApiKey ? 'Present' : 'Missing',
      hostkitApiKeyLength: property.hostkitApiKey ? property.hostkitApiKey.length : 0,
      allPropertyKeys: Object.keys(property)
    });
    setLocalSelectedProperty(property);
    setSelectedProperty(property);
    const newFormData = {
      id: property.id,
      name: property.name,
      address: property.address,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      hostkitId: property.hostkitId,
      hostkitApiKey: property.hostkitApiKey || '', // Show API key if available
      status: property.status,
      images: property.images || [],
      amenities: property.amenities || [],
      owner: property.isAdminOwned ? 'admin' : (property.owner?._id || '') // Set owner field
    };
    
    console.log('🔍 Setting form data with hostkitApiKey:', newFormData.hostkitApiKey ? 'Present' : 'Empty');
    console.log('🔍 hostkitApiKey value:', newFormData.hostkitApiKey);
    
    setFormData(newFormData);
    setShowEditForm(true);
    console.log('✅ showEditForm set to true, localSelectedProperty set');
  };

  const handleDelete = async () => {
    if (selectedProperty) {
      await dispatch(deletePropertyAsync(selectedProperty._id!));
      if (!error) {
        setShowDeleteConfirm(false);
        setSelectedProperty(null);
        // Dispatch global event to refresh all property lists
        window.dispatchEvent(new CustomEvent('propertyDeleted', { 
          detail: { 
            propertyId: selectedProperty.id || selectedProperty._id, 
            propertyName: selectedProperty.name 
          } 
        }));
        // Also refresh properties in parent component if callback provided
        if (onPropertyUpdate) {
          onPropertyUpdate();
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      name: '',
      address: '',
      type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      hostkitId: '',
      hostkitApiKey: '',
      status: 'active',
      images: [],
      amenities: []
    });
    setLocalSelectedProperty(null);
    setSelectedImages([]);
    dispatch(clearHostkitTestResult());
  };

  const toggleApiKeyVisibility = (propertyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const PropertyCard = ({ property }: { property: any }) => {
    // Use localSelectedProperty if it's the same property and has more recent data
    const currentProperty = localSelectedProperty && localSelectedProperty.id === property.id 
      ? localSelectedProperty 
      : property;
    
    const imageUrl = currentProperty.images && currentProperty.images.length > 0 ? getImageUrl(currentProperty.images[0]) : 'No images';
    console.log('🔍 PropertyCard rendering:', {
      propertyName: currentProperty.name,
      propertyId: currentProperty.id,
      images: currentProperty.images,
      imageUrl: imageUrl,
      usingLocalState: localSelectedProperty && localSelectedProperty.id === property.id,
      fullProperty: currentProperty
    });
    
    return (
      <div className="group bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {currentProperty.images && currentProperty.images.length > 0 ? (
            <img
              src={getImageUrl(currentProperty.images[0])}
              alt={currentProperty.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Image failed to load:', e.currentTarget.src);
              }}
              onLoad={(e) => {
                console.log('✅ Image loaded successfully:', e.currentTarget.src);
              }}
            />
          ) : (
            <div className="text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Property Image</p>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
              currentProperty.status === 'active' ? 'bg-green-500' : 
              currentProperty.status === 'inactive' ? 'bg-gray-500' : 'bg-yellow-500'
            }`}>
              {currentProperty.status || 'Active'}
            </span>
          </div>
          <div className="absolute bottom-2 left-2">
            <div className="bg-black/70 backdrop-blur-sm rounded px-1 py-0.5">
              <h3 className="font-bold mb-0 text-white" style={{fontSize: '7px'}}>{currentProperty.name}</h3>
              <p className="text-white/90" style={{fontSize: '9px'}}>{currentProperty.address}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 font-semibold">Type</p>
              <p className="text-sm font-bold text-gray-900">{property.type}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 font-semibold">ID</p>
              <p className="text-sm font-bold text-gray-900">{property.hostkitId}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 font-semibold">Status</p>
              <p className="text-sm font-bold text-gray-900">{property.status}</p>
            </div>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">Amenities:</div>
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity: string, index: number) => (
                  <span key={index} className="badge badge-secondary text-xs">
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleEdit(property)}
              className="btn-outline btn-sm flex-1"
              disabled={isUpdating || !canUpdate}
              title={!canUpdate ? "Only owners can edit properties" : ""}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => {
                dispatch(setSelectedProperty(property));
                setShowDeleteConfirm(true);
              }}
              className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
              disabled={isDeleting || !canUpdate}
              title={!canUpdate ? "Only owners can delete properties" : ""}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
};

  return (
    <div className="space-y-6">

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="ml-auto"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Properties Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading Properties...</p>
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-4">Add your first property to get started</p>
          <button
            onClick={() => {
              resetForm();
              dispatch(clearError()); // Clear any previous errors
              setShowCreateForm(true);
            }}
            className="btn-primary"
            disabled={!canUpdate}
            title={!canUpdate ? "Only owners can create properties" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}

      {/* Create/Edit Property Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {showEditForm ? 'Edit Property' : 'Add New Property'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property ID *
                    </label>
                    <input
                      type="number"
                      name="id"
                      value={formData.id || ''}
                      onChange={handleInputChange}
                      className="input"
                      required
                      disabled={showEditForm}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Villa">Villa</option>
                      <option value="Condominium">Condominium</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner *
                  </label>
                  <select
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="">Select Owner</option>
                    <option value="admin">Admin</option>
                    {owners.map((owner) => (
                      <option key={owner._id} value={owner._id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="input"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="input"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Guests *
                    </label>
                    <input
                      type="number"
                      name="maxGuests"
                      value={formData.maxGuests}
                      onChange={handleInputChange}
                      className="input"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Hostkit Integration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hostkit ID *
                      </label>
                      <input
                        type="text"
                        name="hostkitId"
                        value={formData.hostkitId}
                        onChange={handleInputChange}
                        className="input font-mono"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hostkit API Key *
                      </label>
                      <input
                        type="password"
                        name="hostkitApiKey"
                        value={formData.hostkitApiKey}
                        onChange={handleInputChange}
                        className="input font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="btn-outline btn-sm"
                      disabled={isTesting || !formData.hostkitId || !formData.hostkitApiKey}
                    >
                      {isTesting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </button>

                    {hostkitTestResult && (
                      <div className={`mt-2 p-3 rounded-md ${
                        hostkitTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <div className="flex items-center">
                          {hostkitTestResult.success ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          <span className="text-sm">{hostkitTestResult.message}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities?.join(', ') || ''}
                    onChange={handleAmenitiesChange}
                    className="input"
                    placeholder="WiFi, Kitchen, Pool, Parking"
                  />
                </div>

                {/* Image Upload Section - Only show in edit mode */}
                {showEditForm && localSelectedProperty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Images
                    </label>
                    
                    {/* Current Images */}
                    {localSelectedProperty.images && localSelectedProperty.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {localSelectedProperty.images.map((imageUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={getImageUrl(imageUrl)}
                                alt={`Property ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageDelete(imageUrl)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload New Images */}
                    <div className="space-y-3">
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                      />
                      
                      {selectedImages.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Selected Images:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedImages.map((file, index) => (
                              <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                                <span className="mr-2">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          console.log('🔍 Upload button clicked, selectedImages:', selectedImages.length);
                          handleImageUpload();
                        }}
                        disabled={selectedImages.length === 0 || isUploadingImages}
                        className="btn-outline btn-sm"
                      >
                        {isUploadingImages ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Upload Section - Show in create mode */}
                {showCreateForm && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    
                    {selectedImages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Selected Images:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedImages.map((file, index) => (
                            <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                              <span className="mr-2">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setShowEditForm(false);
                      resetForm();
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={isCreating || isUpdating || !canUpdate}
                    title={!canUpdate ? "Only owners can create/update properties" : ""}
                  >
                    {isCreating || isUpdating ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        {showEditForm ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      showEditForm ? 'Update Property' : 'Create Property'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Delete Property</h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{selectedProperty.name}"? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedProperty(null);
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                  disabled={isDeleting || !canUpdate}
                  title={!canUpdate ? "Only owners can delete properties" : ""}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
