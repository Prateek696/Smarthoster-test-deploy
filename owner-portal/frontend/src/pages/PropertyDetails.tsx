import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, User, Calendar, CreditCard, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { getPropertyDetails, PropertyDetails } from '../services/property.api';

const PropertyDetailsPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getPropertyDetails(propertyId);
      setProperty(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch property details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading property details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Property</h3>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={fetchPropertyDetails}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Property Not Found</h1>
          <p className="text-gray-600 mt-2">The requested property could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center space-x-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{property.property_name}</h1>
        </div>
        <p className="text-gray-600">Property ID: {property.id}</p>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Name</label>
              <p className="mt-1 text-sm text-gray-900">{property.property_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Property ID</label>
              <p className="mt-1 text-sm text-gray-900">{property.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                property.activated === '1' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {property.activated === '1' ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Email</label>
              <p className="mt-1 text-sm text-gray-900">{property.owner}</p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Location
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{property.address}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <p className="mt-1 text-sm text-gray-900">{property.cp}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <p className="mt-1 text-sm text-gray-900">{property.localidade}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Coordinates</label>
              <p className="mt-1 text-sm text-gray-900">
                {property.lat}, {property.lon}
              </p>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Tax Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">NIF (Tax ID)</label>
              <p className="mt-1 text-sm text-gray-900">{property.nif}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoicing NIF</label>
              <p className="mt-1 text-sm text-gray-900">{property.invoicing_nif}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">SEF Order</label>
              <p className="mt-1 text-sm text-gray-900">{property.seforder}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">SEF Code</label>
              <p className="mt-1 text-sm text-gray-900">{property.sefcode}</p>
            </div>
          </div>
        </div>

        {/* Check-in/Check-out Times */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Check-in/Check-out Times
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Check-in Time</label>
              <p className="mt-1 text-sm text-gray-900">{property.default_checkin}:00</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Check-out Time</label>
              <p className="mt-1 text-sm text-gray-900">{property.default_checkout}:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex space-x-4">
        <button
          onClick={fetchPropertyDetails}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
        
        <button
          onClick={() => navigate(`/saft?property=${property.id}`)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Generate SAFT-T
        </button>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;



