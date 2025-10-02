import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { 
  getAdminDashboardStats, 
  getAllOwners, 
  getAllAccountants,
  getAllProperties,
  createOwner,
  updateAccountant,
  updateAccountantProperties,
  deleteAccountant,
  deleteOwner,
  deleteProperty,
  Owner,
  Accountant,
  AdminDashboardStats,
  CreateOwnerData
} from '../../services/admin.api'
import { createProperty } from '../../services/properties.api'
import { 
  Users, 
  Building2, 
  TrendingUp,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ChevronDown,
  X,
  RefreshCw,
  CheckCircle,
  Download,
  Minus
} from 'lucide-react'
import PropertyManagement from '../../components/property/PropertyManagement'
import OwnerStatementComponent from '../../components/admin/OwnerStatement'
import apiClient from '../../services/apiClient'
import toast from 'react-hot-toast'

interface AddOwnerFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const AddOwnerForm: React.FC<AddOwnerFormProps> = ({ onSuccess, onCancel }) => {
  const getRoleText = (role: 'owner' | 'accountant' | undefined) => {
    if (role === 'accountant') return 'accountant'
    return 'owner'
  }
  const [formData, setFormData] = useState<CreateOwnerData>({
    name: '',
    email: '',
    phone: '',
    hostkitApiId: '',
    hostkitApiKey: '',
    hostkitApiSecret: '',
    password: '',
    role: 'owner' as 'owner' | 'accountant',
    companies: [{ name: '', nif: '' }]
  })
  const [propertyData, setPropertyData] = useState({
    id: '',
    name: '',
    address: '',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    hostkitId: '',
    amenities: 'WiFi, Kitchen, Pool, Parking'
  })
  const [includeProperty, setIncludeProperty] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [availableProperties, setAvailableProperties] = useState<any[]>([])
  const [isFetchingProperty, setIsFetchingProperty] = useState(false)
  const [propertyFetchSuccess, setPropertyFetchSuccess] = useState(false)
  const [propertiesToCreate, setPropertiesToCreate] = useState<Array<{
    hostkitId: string
    hostkitApiKey: string
    hostawayId: string
    fetched: boolean
    data?: any
  }>>([])
  const [isFetchingAll, setIsFetchingAll] = useState(false)

  // Company management functions
  const addCompany = () => {
    setFormData(prev => ({
      ...prev,
      companies: [...(prev.companies || []), { name: '', nif: '' }]
    }))
  }

  const removeCompany = (index: number) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies?.filter((_, i) => i !== index) || []
    }))
  }

  const updateCompany = (index: number, field: 'name' | 'nif', value: string) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies?.map((company, i) => 
        i === index ? { ...company, [field]: value } : company
      ) || []
    }))
  }

  // Property management functions
  const addProperty = () => {
    setPropertiesToCreate(prev => [
      ...prev,
      { hostkitId: '', hostkitApiKey: '', hostawayId: '', fetched: false }
    ])
  }

  const removeProperty = (index: number) => {
    setPropertiesToCreate(prev => prev.filter((_, i) => i !== index))
  }

  const updatePropertyField = (index: number, field: 'hostkitId' | 'hostkitApiKey' | 'hostawayId', value: string) => {
    setPropertiesToCreate(prev =>
      prev.map((prop, i) => (i === index ? { ...prop, [field]: value } : prop))
    )
  }

  const handleFetchAllProperties = async () => {
    setIsFetchingAll(true)
    
    for (let i = 0; i < propertiesToCreate.length; i++) {
      const property = propertiesToCreate[i]
      
      if (!property.hostawayId) {
        toast.error(`Property ${i + 1}: Hostaway ID is required`)
        continue
      }

      try {
        const response = await apiClient.get(`/property-management/fetch-hostaway/${property.hostawayId}`)
        
        if (response.success && response.data) {
          const data = response.data
          
          // Build address from city and country only
          const addressParts = [
            data.address?.city,
            data.address?.country
          ].filter(Boolean)
          
          const fullAddress = addressParts.length > 0 
            ? addressParts.join(', ') 
            : data.address?.full || ''

          // Update the property with fetched data
          setPropertiesToCreate(prev =>
            prev.map((prop, idx) =>
              idx === i
                ? {
                    ...prop,
                    fetched: true,
                    data: {
                      id: property.hostawayId,
                      name: data.name,
                      address: fullAddress,
                      bedrooms: data.bedrooms,
                      bathrooms: data.bathrooms,
                      maxGuests: data.accommodates,
                      type: data.propertyType || 'Apartment',
                      hostkitId: property.hostkitId
                    }
                  }
                : prop
            )
          )
          
          toast.success(`Property ${i + 1}: ${data.name} fetched successfully!`)
        }
      } catch (error: any) {
        console.error(`Error fetching property ${i + 1}:`, error)
        toast.error(`Property ${i + 1}: Failed to fetch details`)
      }
    }
    
    setIsFetchingAll(false)
  }

  // Fetch available properties when role changes to accountant
  useEffect(() => {
    if (formData.role === 'accountant') {
      const fetchProperties = async () => {
        try {
          const properties = await getAllProperties()
          setAvailableProperties(properties)
        } catch (error) {
          console.error('Error fetching properties:', error)
        }
      }
      fetchProperties()
    }
  }, [formData.role])

  const handleFetchPropertyFromHostaway = async () => {
    if (!propertyData.id) {
      toast.error('Please enter a Hostaway Property ID first')
      return
    }

    setIsFetchingProperty(true)
    setError('')
    setPropertyFetchSuccess(false)

    try {
      const response = await apiClient.get(`/property-management/fetch-hostaway/${propertyData.id}`)
      
      if (response.success && response.data) {
        const data = response.data
        
        // Build address from city and country only
        const addressParts = [
          data.address?.city,
          data.address?.country
        ].filter(Boolean)
        
        const fullAddress = addressParts.length > 0 
          ? addressParts.join(', ') 
          : data.address?.full || propertyData.address
        
        // Auto-populate property form fields
        setPropertyData(prev => ({
          ...prev,
          name: data.name || prev.name,
          address: fullAddress,
          bedrooms: data.bedrooms || prev.bedrooms,
          bathrooms: data.bathrooms || prev.bathrooms,
          maxGuests: data.accommodates || prev.maxGuests,
          type: data.propertyType || prev.type
        }))

        setPropertyFetchSuccess(true)
        toast.success('Property details fetched from Hostaway!')
        console.log('✅ Fetched property details for owner form:', data)
      }
    } catch (err: any) {
      console.error('❌ Error fetching from Hostaway:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch property details'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsFetchingProperty(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Creating user with data:', formData)
      
      // Filter out empty companies
      const filteredCompanies = formData.companies?.filter(company => 
        company.name.trim() !== '' && company.nif.trim() !== ''
      ) || []
      
      const requestData = {
        ...formData,
        companies: filteredCompanies,
        ...(formData.role === 'accountant' && selectedProperties.length > 0 && { assignedProperties: selectedProperties })
      }
      const ownerResult = await createOwner(requestData)
      console.log('User created successfully:', ownerResult)
      
      if (!ownerResult || !ownerResult._id) {
        throw new Error('Invalid response from createOwner API')
      }
      
      // Create all fetched properties for the owner
      if (propertiesToCreate.length > 0 && formData.role === 'owner') {
        const fetchedProperties = propertiesToCreate.filter(p => p.fetched && p.data)
        
        if (fetchedProperties.length > 0) {
          console.log(`Creating ${fetchedProperties.length} properties for owner:`, ownerResult._id)
          
          for (const property of fetchedProperties) {
            try {
              const propertyPayload = {
                ...property.data,
                hostkitApiKey: property.hostkitApiKey,
                owner: ownerResult._id
              }
              
              console.log('Creating property:', propertyPayload)
              await createProperty(propertyPayload)
              console.log('✅ Property created:', property.data.name)
            } catch (propertyError: any) {
              console.error('❌ Error creating property:', propertyError)
              toast.error(`Failed to create property: ${property.data?.name || 'Unknown'}`)
            }
          }
          
          toast.success(`${fetchedProperties.length} ${fetchedProperties.length === 1 ? 'property' : 'properties'} created successfully!`)
        }
      }
      
      onSuccess()
    } catch (err: any) {
      console.error('Error creating owner:', err)
      setError(err.response?.data?.message || err.message || 'Failed to create owner')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(prev => [...prev, ...files])
    console.log('Images selected for upload:', files.map(f => f.name))
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSelectAllProperties = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(availableProperties.map(p => p._id))
    } else {
      setSelectedProperties([])
    }
  }

  const handlePropertySelection = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId])
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter ${formData.role === 'accountant' ? 'accountant' : 'owner'} name`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role *
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'owner' | 'accountant' }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="owner">Owner</option>
          <option value="accountant">Accountant</option>
        </select>
      </div>

      {/* Company Information Section - Only for Owners */}
      {formData.role === 'owner' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Company Information (for SAFT)
            </label>
            <button
              type="button"
              onClick={addCompany}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-gray-900 rounded-md hover:bg-blue-500/30 transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md"
            >
              <Plus className="h-3 w-3 opacity-70" />
              Add Company
            </button>
          </div>
          
          {formData.companies?.map((company, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Company {index + 1}</h4>
                {formData.companies && formData.companies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompany(index)}
                    className="flex items-center gap-1 px-2 py-1 text-sm bg-red-500/20 text-gray-900 rounded-md hover:bg-red-500/30 transition-all duration-300 border border-red-200 shadow-sm hover:shadow-md"
                  >
                    <Minus className="h-4 w-4 opacity-70" />
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => updateCompany(index, 'name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIF *
                  </label>
                  <input
                    type="text"
                    value={company.nif}
                    onChange={(e) => updateCompany(index, 'nif', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter NIF number"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Properties to Create Section - Only for Owners */}
      {formData.role === 'owner' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Properties to Create
            </label>
            <button
              type="button"
              onClick={addProperty}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-gray-900 rounded-md hover:bg-green-500/30 transition-all duration-300 border border-green-200 shadow-sm hover:shadow-md"
            >
              <Plus className="h-3 w-3 opacity-70" />
              Add Property
            </button>
          </div>

          {propertiesToCreate.map((property, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Property {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeProperty(index)}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-red-500/20 text-gray-900 rounded-md hover:bg-red-500/30 transition-all duration-300 border border-red-200 shadow-sm hover:shadow-md"
                >
                  <Minus className="h-4 w-4 opacity-70" />
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostkit ID
                  </label>
                  <input
                    type="text"
                    value={property.hostkitId}
                    onChange={(e) => updatePropertyField(index, 'hostkitId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12602"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostkit API Key
                  </label>
                  <input
                    type="password"
                    value={property.hostkitApiKey}
                    onChange={(e) => updatePropertyField(index, 'hostkitApiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter API Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostaway ID *
                  </label>
                  <input
                    type="text"
                    value={property.hostawayId}
                    onChange={(e) => updatePropertyField(index, 'hostawayId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="414661"
                  />
                </div>
              </div>

              {/* Show fetched property data */}
              {property.fetched && property.data && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">{property.data.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Address:</span> {property.data.address}</p>
                    <p><span className="font-medium">Type:</span> {property.data.type}</p>
                    <p><span className="font-medium">Bedrooms:</span> {property.data.bedrooms}</p>
                    <p><span className="font-medium">Bathrooms:</span> {property.data.bathrooms}</p>
                    <p><span className="font-medium">Max Guests:</span> {property.data.maxGuests}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {propertiesToCreate.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFetchAllProperties}
                disabled={isFetchingAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-gray-900 rounded-md hover:bg-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md"
              >
                {isFetchingAll ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Fetch All Properties
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter password for this ${formData.role === 'accountant' ? 'accountant' : 'owner'}`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Accountant Property Assignment Section */}
      {formData.role === 'accountant' && (
        <div className="border-t pt-4 mt-6">
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900">Assign Properties to Accountant</h4>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="selectAllProperties"
                checked={selectedProperties.length === availableProperties.length && availableProperties.length > 0}
                onChange={(e) => handleSelectAllProperties(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="selectAllProperties" className="ml-2 text-sm font-medium text-gray-700">
                Select All Properties ({availableProperties.length} available)
              </label>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableProperties.map((property) => (
                <div key={property._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`property-${property._id}`}
                    checked={selectedProperties.includes(property._id)}
                    onChange={(e) => handlePropertySelection(property._id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`property-${property._id}`} className="ml-2 text-sm text-gray-700">
                    {property.name} (ID: {property.id})
                  </label>
                </div>
              ))}
            </div>

            {selectedProperties.length > 0 && (
              <div className="text-sm text-green-600 font-medium">
                ✓ {selectedProperties.length} property(ies) selected
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-blue-500/20 text-gray-900 border border-blue-200 rounded-md hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {loading ? 'Creating...' : `Create ${formData.role === 'accountant' ? 'Accountant' : 'Owner'}${propertiesToCreate.length > 0 ? ` & ${propertiesToCreate.length} ${propertiesToCreate.length === 1 ? 'Property' : 'Properties'}` : ''}`}
        </button>
      </div>
    </form>
  )
}

interface EditOwnerFormProps {
  owner: Owner
  onSuccess: () => void
  onCancel: () => void
}

const EditOwnerForm: React.FC<EditOwnerFormProps> = ({ owner, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateOwnerData>({
    name: owner.name,
    email: owner.email,
    phone: owner.phone || '',
    role: owner.role as 'owner' | 'accountant',
    companies: owner.companies || [{ name: '', nif: '' }]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Company management functions
  const addCompany = () => {
    setFormData(prev => ({
      ...prev,
      companies: [...(prev.companies || []), { name: '', nif: '' }]
    }))
  }

  const removeCompany = (index: number) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies?.filter((_, i) => i !== index) || []
    }))
  }

  const updateCompany = (index: number, field: 'name' | 'nif', value: string) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies?.map((company, i) => 
        i === index ? { ...company, [field]: value } : company
      ) || []
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Filter out empty companies
      const filteredCompanies = formData.companies?.filter(company => 
        company.name.trim() !== '' && company.nif.trim() !== ''
      ) || []

      const updateData = {
        ...formData,
        companies: filteredCompanies
      }

      // Import updateOwner function
      const { updateOwner } = await import('../../services/admin.api')
      await updateOwner(owner._id, updateData)
      
      console.log('Owner updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating owner:', error)
      setError(error.message || 'Failed to update owner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter owner name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter phone number"
        />
      </div>

      {/* Company Information Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Company Information (for SAFT)
          </label>
          <button
            type="button"
            onClick={addCompany}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-gray-900 rounded-md hover:bg-blue-500/30 transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-3 w-3 opacity-70" />
            Add Company
          </button>
        </div>
        
        {formData.companies?.map((company, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Company {index + 1}</h4>
              {formData.companies && formData.companies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCompany(index)}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-red-500/20 text-gray-900 rounded-md hover:bg-red-500/30 transition-all duration-300 border border-red-200 shadow-sm hover:shadow-md"
                >
                  <Minus className="h-4 w-4 opacity-70" />
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => updateCompany(index, 'name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIF *
                </label>
                <input
                  type="text"
                  value={company.nif}
                  onChange={(e) => updateCompany(index, 'nif', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter NIF number"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-blue-500/20 text-gray-900 border border-blue-200 rounded-md hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {loading ? 'Updating...' : 'Update Owner'}
        </button>
      </div>
    </form>
  )
}

interface AddPropertyFormProps {
  owners: Owner[]
  onSuccess: () => void
  onCancel: () => void
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ owners, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    hostkitId: '',
    hostkitApiKey: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    amenities: ['WiFi', 'Kitchen', 'Pool', 'Parking'] as string[],
    owner: ''
  })
  const [amenitiesInput, setAmenitiesInput] = useState('WiFi, Kitchen, Pool, Parking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [showHostkitApiKey, setShowHostkitApiKey] = useState(false)
  const [isFetchingHostaway, setIsFetchingHostaway] = useState(false)
  const [fetchSuccess, setFetchSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create property with all required fields
      const propertyData = {
        ...formData,
        id: parseInt(formData.id) || 0,
        amenities: Array.isArray(formData.amenities) ? formData.amenities : (formData.amenities as string).split(',').map((a: string) => a.trim()).filter((a: string) => a)
      }
      
      console.log('Creating property with data:', propertyData)
      
      // Use the same logic as PropertyManagement component
      const { createProperty } = await import('../../services/properties.api')
      const result = await createProperty(propertyData)
      console.log('Property created successfully:', result)

      // Upload images if any were selected (same as PropertyManagement)
      if (selectedImages.length > 0) {
        try {
          setIsUploadingImages(true)
          const { uploadPropertyImages } = await import('../../services/imageUpload.api')
          await uploadPropertyImages(propertyData.id.toString(), selectedImages)
          console.log('✅ Images uploaded successfully for new property:', propertyData.id)
          setSelectedImages([]) // Clear selected images
        } catch (imageError) {
          console.error('❌ Error uploading images:', imageError)
          // Don't fail the entire operation if image upload fails
        } finally {
          setIsUploadingImages(false)
        }
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bedrooms' || name === 'bathrooms' || name === 'maxGuests' 
        ? parseInt(value) || 0 
        : value
    }))
  }

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log('🔍 Amenities input changed:', value)
    setAmenitiesInput(value)
    // Split by comma first, then trim each amenity to preserve spaces within words
    const amenities = value.split(',').map((a: string) => a.trim()).filter((a: string) => a)
    setFormData(prev => ({ ...prev, amenities }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files))
    }
  }

  const handleFetchFromHostaway = async () => {
    if (!formData.id) {
      toast.error('Please enter a Hostaway Property ID first')
      return
    }

    setIsFetchingHostaway(true)
    setError('')
    setFetchSuccess(false)

    try {
      const response = await apiClient.get(`/property-management/fetch-hostaway/${formData.id}`)
      
      if (response.success && response.data) {
        const data = response.data
        
        // Auto-populate form fields
        // Build address from city and country only
        const addressParts = [
          data.address?.city,
          data.address?.country
        ].filter(Boolean); // Remove empty parts
        
        const fullAddress = addressParts.length > 0 
          ? addressParts.join(', ') 
          : data.address?.full || formData.address;
        
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          address: fullAddress,
          bedrooms: data.bedrooms || prev.bedrooms,
          bathrooms: data.bathrooms || prev.bathrooms,
          maxGuests: data.accommodates || prev.maxGuests,
          type: data.propertyType || prev.type
        }))

        setFetchSuccess(true)
        toast.success('Property details fetched successfully from Hostaway!')
        console.log('✅ Fetched Hostaway property details:', data)
      }
    } catch (err: any) {
      console.error('❌ Error fetching from Hostaway:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch property details from Hostaway'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsFetchingHostaway(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hostaway Property ID *
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 392777"
              required
            />
            <button
              type="button"
              onClick={handleFetchFromHostaway}
              disabled={isFetchingHostaway || !formData.id}
              className="px-4 py-2 bg-blue-500/20 text-gray-900 rounded-md hover:bg-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md"
            >
              {isFetchingHostaway ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : fetchSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Fetched
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Fetch from Hostaway
                </>
              )}
            </button>
          </div>
          {fetchSuccess && (
            <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Property details loaded from Hostaway. Review and edit if needed.
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter property name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Owner *
        </label>
        <select
          name="owner"
          value={formData.owner}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter property address"
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
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="e.g., 10030"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostkit API Key *
            </label>
            <div className="relative">
              <input
                type={showHostkitApiKey ? "text" : "password"}
                name="hostkitApiKey"
                value={formData.hostkitApiKey}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowHostkitApiKey(!showHostkitApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showHostkitApiKey ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-blue-200 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-gray-900 hover:file:bg-blue-500/30 file:shadow-sm hover:file:shadow-md file:transition-all file:duration-300"
        />
        
        {selectedImages.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {selectedImages.length} image(s) selected
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isUploadingImages}
          className="px-4 py-2 text-sm font-medium bg-blue-500/20 text-gray-900 border border-blue-200 rounded-md hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {loading ? 'Creating...' : isUploadingImages ? 'Uploading Images...' : 'Create Property'}
        </button>
      </div>
    </form>
  )
}

interface AccountantEditModalProps {
  accountant: Accountant
  availableProperties: any[]
  onUpdate: (data: { name: string; email: string; phone: string; password?: string; assignedProperties?: string[] }) => void
  onCancel: () => void
}

const AccountantEditModal: React.FC<AccountantEditModalProps> = ({ accountant, availableProperties, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: accountant.name,
    email: accountant.email,
    phone: accountant.phone || '',
    password: ''
  })
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    accountant.assignedProperties.map(prop => prop._id)
  )
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
        assignedProperties: selectedProperties
      }
      await onUpdate(updateData)
    } catch (error) {
      console.error('Error updating accountant:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectAllProperties = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(availableProperties.map(p => p._id))
    } else {
      setSelectedProperties([])
    }
  }

  const handlePropertySelection = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId])
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Accountant</h3>
              <p className="text-sm text-gray-600 mt-1">Update accountant details and property assignments</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Accountant Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Accountant Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter accountant name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            
            {/* Password Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-green-600" />
                Security Settings
              </h4>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password (Leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Property Assignment Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                Property Assignment
              </h4>
              
              <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="selectAllProperties"
                    checked={selectedProperties.length === availableProperties.length && availableProperties.length > 0}
                    onChange={(e) => handleSelectAllProperties(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="selectAllProperties" className="ml-2 text-sm font-semibold text-gray-700">
                    Select All Properties
                  </label>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {availableProperties.length} available
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4 bg-white">
                {availableProperties.map((property) => (
                  <div key={property._id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <input
                      type="checkbox"
                      id={`property-${property._id}`}
                      checked={selectedProperties.includes(property._id)}
                      onChange={(e) => handlePropertySelection(property._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`property-${property._id}`} className="ml-3 text-sm text-gray-700 flex-1">
                      <div className="font-medium">{property.name || property.title || 'Unnamed Property'}</div>
                      <div className="text-xs text-gray-500">
                        ID: {property.id || property._id}
                        {property.owner && (
                          <span className="ml-2">• Owner: {property.owner.name}</span>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {selectedProperties.length > 0 && (
                <div className="mt-4 flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-sm text-green-700 font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {selectedProperties.length} property(ies) selected
                  </div>
                </div>
              )}
            </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold bg-blue-500/20 text-gray-900 border border-blue-200 rounded-lg hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Accountant'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface PropertyEditModalProps {
  property: any
  owners: Owner[]
  onUpdate: (updatedProperty: any) => void
  onCancel: () => void
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({ property, owners, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: property.name || property.title || '',
    address: property.address || '',
    type: property.type || 'Apartment',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    maxGuests: property.maxGuests || 0,
    status: property.status || 'active',
    ownerId: property.isAdminOwned ? 'admin' : (property.owner?._id || '')
  })
  const [loading, setLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // For now, we'll just call the onUpdate callback
      // In a real implementation, you'd call an API to update the property
      const updatedProperty = {
        ...property,
        ...formData,
        owner: owners.find(o => o._id === formData.ownerId)
      }
      onUpdate(updatedProperty)
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSyncFromHostaway = async () => {
    if (!property.id) {
      toast.error('Property ID is required to sync from Hostaway')
      return
    }

    setIsSyncing(true)
    setSyncSuccess(false)

    try {
      const response = await apiClient.get(`/property-management/fetch-hostaway/${property.id}`)
      
      if (response.success && response.data) {
        const data = response.data
        
        // Build address from city and country only
        const addressParts = [
          data.address?.city,
          data.address?.country
        ].filter(Boolean)
        
        const fullAddress = addressParts.length > 0 
          ? addressParts.join(', ') 
          : data.address?.full || formData.address
        
        // Update form with synced data
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          address: fullAddress,
          bedrooms: data.bedrooms || prev.bedrooms,
          bathrooms: data.bathrooms || prev.bathrooms,
          maxGuests: data.accommodates || prev.maxGuests,
          type: data.propertyType || prev.type
        }))
        
        setSyncSuccess(true)
        toast.success('Property details synced successfully from Hostaway!')
        
        // Reset success state after 3 seconds
        setTimeout(() => setSyncSuccess(false), 3000)
      }
    } catch (error: any) {
      console.error('Error syncing from Hostaway:', error)
      toast.error(error.message || 'Failed to sync property details from Hostaway')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Property</h3>
              <p className="text-sm text-gray-600 mt-1">Update property details and settings</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Property Details
                </h4>
                <button
                  type="button"
                  onClick={handleSyncFromHostaway}
                  disabled={isSyncing || !property.id}
                  className="px-4 py-2 bg-blue-500/20 text-gray-900 rounded-md hover:bg-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md text-sm"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : syncSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Synced
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Sync from Hostaway
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter property name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
              
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter property address"
                />
              </div>
            
            {/* Property Specifications Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-green-600" />
                Property Specifications
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Guests</label>
                  <input
                    type="number"
                    name="maxGuests"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
            
            {/* Property Management Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Property Management
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Assignment</label>
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
              </div>
            </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold bg-blue-500/20 text-gray-900 border border-blue-200 rounded-lg hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [accountants, setAccountants] = useState<Accountant[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('all')
  const [selectedAccountantId, setSelectedAccountantId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [showEditOwnerModal, setShowEditOwnerModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showAccountantViewModal, setShowAccountantViewModal] = useState(false)
  const [showAccountantEditModal, setShowAccountantEditModal] = useState(false)
  const [viewingAccountant, setViewingAccountant] = useState<Accountant | null>(null)
  const [editingAccountant, setEditingAccountant] = useState<Accountant | null>(null)
  const [showPropertyViewModal, setShowPropertyViewModal] = useState(false)
  const [viewingProperty, setViewingProperty] = useState<any>(null)
  const [showOwnerStatement, setShowOwnerStatement] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [selectedOwnerId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching dashboard data...')
      const [statsData, ownersData, accountantsData] = await Promise.all([
        getAdminDashboardStats(),
        getAllOwners(),
        getAllAccountants()
      ])
      console.log('Dashboard stats:', statsData)
      console.log('Owners data:', ownersData)
      console.log('Accountants data:', accountantsData)
      setStats(statsData)
      setOwners(ownersData)
      setAccountants(accountantsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const ownerId = selectedOwnerId === 'all' ? undefined : selectedOwnerId
      console.log('🔍 fetchProperties called with selectedOwnerId:', selectedOwnerId, 'ownerId param:', ownerId)
      const propertiesData = await getAllProperties(ownerId)
      console.log('🔍 fetchProperties received:', propertiesData)
      
      if (Array.isArray(propertiesData)) {
        console.log('🔍 fetchProperties received:', propertiesData.length, 'properties')
        console.log('🔍 fetchProperties property owners:', propertiesData.map(p => ({ id: p.id, name: p.name, owner: p.owner })))
        setProperties(propertiesData)
      } else {
        console.error('🔍 fetchProperties received non-array data:', propertiesData)
        setProperties([])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties([])
    }
  }

  const handleOwnerChange = (ownerId: string) => {
    console.log('🔍 handleOwnerChange called. New ownerId:', ownerId)
    console.log('🔍 Current selectedOwnerId:', selectedOwnerId)
    setSelectedOwnerId(ownerId)
    // fetchProperties will be called automatically by useEffect when selectedOwnerId changes
  }

  const getSelectedOwnerName = () => {
    if (selectedOwnerId === 'all') return 'All Owners'
    if (selectedOwnerId === 'admin') return 'Admin'
    const owner = owners.find(o => o._id === selectedOwnerId)
    return owner ? owner.name : 'Unknown Owner'
  }

  const getSelectedAccountantName = () => {
    if (selectedAccountantId === 'all') return 'All Accountants'
    const accountant = accountants.find(a => a._id === selectedAccountantId)
    return accountant ? accountant.name : 'Unknown Accountant'
  }

  const getFilteredAccountants = () => {
    if (selectedAccountantId === 'all') return accountants
    return accountants.filter(a => a._id === selectedAccountantId)
  }


  const handleViewProperty = (property: any) => {
    setViewingProperty(property)
    setShowPropertyViewModal(true)
  }

  const handleEditProperty = (property: any) => {
    // Scroll to the PropertyManagement component and trigger edit
    const propertyManagementSection = document.querySelector('[data-property-management]')
    if (propertyManagementSection) {
      propertyManagementSection.scrollIntoView({ behavior: 'smooth' })
      // Dispatch event to trigger edit in PropertyManagement component
      window.dispatchEvent(new CustomEvent('editProperty', { 
        detail: { property } 
      }))
    } else {
      alert('Please use the Property Management section below to edit properties.')
    }
  }

  const handleDeleteProperty = async (propertyId: number, propertyName: string) => {
    if (window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
      try {
        await deleteProperty(propertyId.toString())
        console.log(`Property ${propertyId} deleted successfully`)
        // Refresh properties to show updated list
        fetchProperties()
        // Refresh dashboard stats
        fetchDashboardData()
        // Force refresh of all property-related components
        window.dispatchEvent(new CustomEvent('propertyDeleted', { 
          detail: { propertyId, propertyName } 
        }))
      } catch (error) {
        console.error('Error deleting property:', error)
        alert('Failed to delete property. Please try again.')
      }
    }
  }

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner)
    setShowEditOwnerModal(true)
  }

  const handleDeleteOwner = async (owner: Owner) => {
    if (!window.confirm(`Are you sure you want to delete owner "${owner.name}"? This will also remove all their associated properties.`)) {
      return
    }

    try {
      await deleteOwner(owner._id)
      toast.success(`Owner "${owner.name}" deleted successfully`)
      await fetchDashboardData() // Reload the dashboard data
    } catch (error: any) {
      console.error('Error deleting owner:', error)
      toast.error(error.message || 'Failed to delete owner')
    }
  }

  const handleViewAccountant = (accountant: Accountant) => {
    setViewingAccountant(accountant)
    setShowAccountantViewModal(true)
  }

  const handleEditAccountant = (accountant: Accountant) => {
    setEditingAccountant(accountant)
    setShowAccountantEditModal(true)
  }

  const handleUpdateAccountant = async (accountantData: { name: string; email: string; phone: string; password?: string; assignedProperties?: string[] }) => {
    if (!editingAccountant) return
    
    try {
      // First update basic accountant info
      await updateAccountant(editingAccountant._id, {
        name: accountantData.name,
        email: accountantData.email,
        phone: accountantData.phone,
        password: accountantData.password
      })
      console.log(`Accountant ${editingAccountant.name} basic info updated successfully`)

      // Then update property assignments if provided
      if (accountantData.assignedProperties !== undefined) {
        await updateAccountantProperties(editingAccountant._id, accountantData.assignedProperties)
        console.log(`Accountant ${editingAccountant.name} property assignments updated successfully`)
      }
      
      // Refresh accountants to show updated list
      fetchDashboardData()
      setShowAccountantEditModal(false)
      setEditingAccountant(null)
    } catch (error) {
      console.error('Error updating accountant:', error)
      alert('Failed to update accountant. Please try again.')
    }
  }

  const handleDeleteAccountant = async (accountant: Accountant) => {
    if (window.confirm(`Are you sure you want to delete "${accountant.name}"? This action cannot be undone and will remove them from all assigned properties.`)) {
      try {
        await deleteAccountant(accountant._id)
        console.log(`Accountant ${accountant.name} deleted successfully`)
        // Refresh accountants to show updated list
        fetchDashboardData()
      } catch (error) {
        console.error('Error deleting accountant:', error)
        alert('Failed to delete accountant. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-black">{user?.name}</span>
              </p>
            </div>
            
            {/* Owner and Accountant Selection Dropdowns */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedOwnerId}
                  onChange={(e) => handleOwnerChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Owners</option>
                  <option value="admin">Admin</option>
                  {owners.map((owner) => (
                    <option key={owner._id} value={owner._id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedAccountantId}
                  onChange={(e) => setSelectedAccountantId(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Accountants</option>
                  {accountants.map((accountant) => (
                    <option key={accountant._id} value={accountant._id}>
                      {accountant.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowOwnerModal(true)}
                className="inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md bg-blue-500/20 text-gray-900 hover:bg-blue-500/30 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Plus className="h-3 w-3 mr-1 opacity-70" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-200 shadow-sm">
                    <Users className="h-4 w-4 text-gray-900 opacity-70" />
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-semibold text-gray-600 truncate uppercase tracking-wide">
                      Total Owners
                    </dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">
                      {stats?.totalOwners || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-200 shadow-sm">
                    <Users className="h-4 w-4 text-gray-900 opacity-70" />
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-semibold text-gray-600 truncate uppercase tracking-wide">
                      Total Accountants
                    </dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">
                      {stats?.totalAccountants || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-200 shadow-sm">
                    <Building2 className="h-4 w-4 text-gray-900 opacity-70" />
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-semibold text-gray-600 truncate uppercase tracking-wide">
                      Total Properties
                    </dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">
                      {stats?.totalProperties || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-200 shadow-sm">
                    <TrendingUp className="h-4 w-4 text-gray-900 opacity-70" />
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-semibold text-gray-600 truncate uppercase tracking-wide">
                      Current View
                    </dt>
                    <dd className="text-sm font-bold text-gray-900 mt-1">
                      {getSelectedOwnerName()} | {getSelectedAccountantName()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owners Section */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 mb-8">
          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Owners Management
                </h3>
                <p className="text-sm text-gray-600">Manage property owners and their company information</p>
              </div>
              <button
                onClick={() => setShowOwnerModal(true)}
                className="bg-blue-500/20 text-gray-900 hover:bg-blue-500/30 px-3 py-1.5 rounded-md flex items-center gap-1 transition-all duration-300 text-sm shadow-sm hover:shadow-md border border-blue-200"
              >
                <Plus className="h-3 w-3 opacity-70" />
                Add Owner
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Companies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {owners.map((owner) => (
                    <tr key={owner._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {owner.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          owner.role === 'owner' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {owner.role === 'owner' ? 'Owner' : 'Accountant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.companies?.length || 0} {(owner.companies?.length || 0) !== 1 ? 'companies' : 'company'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          owner.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {owner.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditOwner(owner)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOwner(owner)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {owners.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first property owner.</p>
                  <button
                    onClick={() => setShowOwnerModal(true)}
                    className="bg-blue-500/20 text-gray-900 hover:bg-blue-500/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 mx-auto border border-blue-200 shadow-sm hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 opacity-70" />
                    Add Owner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 mb-8">
          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Properties ({getSelectedOwnerName()})
                </h3>
                <p className="text-gray-600">Manage and monitor your property portfolio</p>
              </div>
              <button
                onClick={() => setShowPropertyModal(true)}
                className="inline-flex items-center px-4 py-3 border text-sm font-semibold rounded-lg bg-blue-500/20 text-gray-900 hover:bg-blue-500/30 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2 opacity-70" />
                Add Property
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding a new property.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        property.isAdminOwned 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {property.isAdminOwned ? 'Admin Owned' : 'Owner Owned'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 pr-20">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {property.name || property.title || 'Unnamed Property'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            ID: {property.id || property._id}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {property.isAdminOwned ? 'Admin' : (property.owner?.name || 'Unassigned')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mb-4">
                      <button 
                        onClick={() => handleViewProperty(property)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="View Property Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProperty(property)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Edit Property"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProperty(property.id || property._id, property.name || property.title || 'Unnamed Property')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accountants Section */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 mb-8">
          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Accountants ({getSelectedAccountantName()})
                </h3>
                <p className="text-gray-600">Manage accountant access and property assignments</p>
              </div>
            </div>

            {getFilteredAccountants().length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accountants</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding a new accountant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAccountants().map((accountant) => (
                  <div key={accountant._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                    {/* Accountant Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Accountant
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 pr-20">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {accountant.name}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            {accountant.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {accountant.phone || 'Phone not provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mb-4">
                      <button 
                        onClick={() => handleViewAccountant(accountant)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="View Accountant Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditAccountant(accountant)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Edit Accountant"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAccountant(accountant)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Accountant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Properties Summary */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Assigned Properties
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {accountant.assignedPropertiesCount}
                        </span>
                      </div>
                    
                      {/* Assigned Properties List */}
                      {accountant.assignedProperties.length > 0 && (
                        <div className="space-y-2">
                          {accountant.assignedProperties.slice(0, 3).map((property) => (
                            <div key={property._id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                              <div className="flex items-center">
                                <Building2 className="h-3 w-3 text-gray-400 mr-2" />
                                <span className="text-xs font-medium text-gray-700">{property.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">ID: {property.id}</span>
                            </div>
                          ))}
                          {accountant.assignedProperties.length > 3 && (
                            <div className="text-xs text-gray-500 italic text-center py-1">
                              +{accountant.assignedProperties.length - 3} more properties
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Property Modal */}
        {showPropertyModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Property</h3>
                  <button
                    onClick={() => setShowPropertyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <AddPropertyForm 
                  owners={owners}
                  onSuccess={() => {
                    setShowPropertyModal(false)
                    fetchProperties()
                  }}
                  onCancel={() => setShowPropertyModal(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showOwnerModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
                  <button
                    onClick={() => setShowOwnerModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <AddOwnerForm 
                  onSuccess={() => {
                    setShowOwnerModal(false)
                    fetchDashboardData()
                  }}
                  onCancel={() => setShowOwnerModal(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Accountant View Modal */}
        {showAccountantViewModal && viewingAccountant && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Accountant Details</h3>
                  <button
                    onClick={() => {
                      setShowAccountantViewModal(false)
                      setViewingAccountant(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingAccountant.name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingAccountant.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingAccountant.phone || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Properties</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingAccountant.assignedPropertiesCount} properties
                    </div>
                  </div>
                  
                  {viewingAccountant.assignedProperties.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property List</label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {viewingAccountant.assignedProperties.map((property) => (
                          <div key={property._id} className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-sm">
                            {property.name} (ID: {property.id})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAccountantViewModal(false)
                        setViewingAccountant(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accountant Edit Modal */}
        {showAccountantEditModal && editingAccountant && (
          <AccountantEditModal
            accountant={editingAccountant}
            availableProperties={properties}
            onUpdate={handleUpdateAccountant}
            onCancel={() => {
              setShowAccountantEditModal(false)
              setEditingAccountant(null)
            }}
          />
        )}

        {/* Edit Owner Modal */}
        {showEditOwnerModal && editingOwner && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Owner</h3>
                  <button
                    onClick={() => setShowEditOwnerModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <EditOwnerForm 
                  owner={editingOwner}
                  onSuccess={() => {
                    setShowEditOwnerModal(false)
                    setEditingOwner(null)
                    fetchDashboardData()
                  }}
                  onCancel={() => {
                    setShowEditOwnerModal(false)
                    setEditingOwner(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Property View Modal */}
        {showPropertyViewModal && viewingProperty && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
                  <button
                    onClick={() => {
                      setShowPropertyViewModal(false)
                      setViewingProperty(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.name || viewingProperty.title || 'Unnamed Property'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.id || viewingProperty._id}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.isAdminOwned ? 'Admin' : (viewingProperty.owner?.name || 'Unassigned')}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.address || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.type || 'Not specified'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {viewingProperty.bedrooms || '0'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {viewingProperty.bathrooms || '0'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.maxGuests || '0'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {viewingProperty.status || 'Active'}
                    </div>
                  </div>
                  
                  {viewingProperty.images && viewingProperty.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {viewingProperty.images.length} image(s)
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowPropertyViewModal(false)
                        setViewingProperty(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Full Properties Management Section */}
        <div className="bg-white shadow rounded-lg mt-6" data-property-management>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base leading-6 font-medium text-gray-900">
                Full Properties Management ({getSelectedOwnerName()})
              </h3>
            </div>
            
            <PropertyManagement 
              filteredProperties={properties}
              onPropertyUpdate={fetchProperties}
              owners={owners}
              showActions={true}
            />
          </div>
        </div>
      </div>

      {/* Owner Statement Modal */}
      {showOwnerStatement && (
        <OwnerStatementComponent 
          onClose={() => setShowOwnerStatement(false)}
        />
      )}
    </div>
  )
}

export default AdminDashboard
