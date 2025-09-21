import React, { useState, useEffect } from 'react'
import { 
  getAllOwners, 
  createOwner, 
  updateOwner, 
  deleteOwner,
  getAllProperties,
  assignPropertyToOwner,
  Owner,
  CreateOwnerData,
  UpdateOwnerData 
} from '../../services/admin.api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  X,
  Mail,
  Phone,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Building2,
  Link
} from 'lucide-react'

const OwnerManagement: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [formData, setFormData] = useState<CreateOwnerData>({
    name: '',
    email: '',
    phone: '',
    role: 'owner',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedOwnerForAssign, setSelectedOwnerForAssign] = useState<Owner | null>(null)
  const [availableProperties, setAvailableProperties] = useState<any[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      setLoading(true)
      const ownersData = await getAllOwners()
      setOwners(ownersData)
    } catch (error) {
      console.error('Error fetching owners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingOwner) {
        await updateOwner(editingOwner._id, formData)
      } else {
        await createOwner(formData)
      }
      await fetchOwners()
      setShowModal(false)
      setEditingOwner(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'owner',
        password: ''
      })
    } catch (error) {
      console.error('Error saving owner:', error)
    }
  }

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner)
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone || '',
      role: owner.role as 'owner' | 'accountant',
      password: ''
    })
    setShowModal(true)
  }

  const handleDelete = async (ownerId: string) => {
    if (window.confirm('Are you sure you want to delete this owner?')) {
      try {
        await deleteOwner(ownerId)
        await fetchOwners()
      } catch (error) {
        console.error('Error deleting owner:', error)
      }
    }
  }

  const handleAssignProperty = async (owner: Owner) => {
    try {
      // Fetch available properties
      const properties = await getAllProperties()
      setAvailableProperties(properties)
      setSelectedOwnerForAssign(owner)
      setShowAssignModal(true)
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handleAssignPropertySubmit = async () => {
    if (!selectedOwnerForAssign || !selectedPropertyId) return
    
    try {
      await assignPropertyToOwner(selectedOwnerForAssign._id, parseInt(selectedPropertyId))
      setShowAssignModal(false)
      setSelectedOwnerForAssign(null)
      setSelectedPropertyId('')
      await fetchOwners()
    } catch (error) {
      console.error('Error assigning property:', error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOwner(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'owner',
      hostkitApiKey: '',
      hostkitApiSecret: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Owner Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage property owners and their API credentials
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Owners Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Keys
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {owner.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {owner._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {owner.email}
                        </div>
                        {owner.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {owner.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          owner.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          owner.role === 'owner' ? 'bg-green-100 text-green-800' :
                          owner.role === 'accountant' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {owner.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {owner.hasApiKeys ? (
                            <div className="flex items-center text-green-600">
                              <Key className="h-4 w-4 mr-1" />
                              <span className="text-sm">Configured</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <X className="h-4 w-4 mr-1" />
                              <span className="text-sm">Not Set</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {owner.isVerified ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(owner)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Owner"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAssignProperty(owner)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Assign Property"
                          >
                            <Building2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(owner._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Owner"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Owner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingOwner ? 'Edit Owner' : 'Add New Owner'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password {editingOwner ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full pr-12 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder={editingOwner ? "Enter new password (optional)" : "Enter password"}
                      required={!editingOwner}
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
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {editingOwner ? 'Update Owner' : 'Create Owner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Property Modal */}
      {showAssignModal && selectedOwnerForAssign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Property to {selectedOwnerForAssign.name}
                </h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedOwnerForAssign(null)
                    setSelectedPropertyId('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Property
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Choose a property...</option>
                    {availableProperties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.name} (ID: {property.id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false)
                      setSelectedOwnerForAssign(null)
                      setSelectedPropertyId('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignPropertySubmit}
                    disabled={!selectedPropertyId}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Link className="h-4 w-4 mr-2 inline" />
                    Assign Property
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerManagement
