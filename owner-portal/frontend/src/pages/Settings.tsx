import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Settings as SettingsIcon, User, Shield, Bell, Building } from 'lucide-react';
import { settingsAPI } from '../services/settings.api';

interface Company {
  name: string;
  nif: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  companies?: Company[];
}

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  companies?: Company[];
  createdAt: string;
  updatedAt: string;
}

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'companies'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    companies: [{ name: '', nif: '' }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await settingsAPI.getUserProfile();
        
        // Handle both name formats (name vs firstName/lastName)
        const fullName = profileData.name || '';
        
        // Better name splitting logic
        let firstName = '';
        let lastName = '';
        
        // If we only have a full name, split it intelligently
        if (!firstName && !lastName && fullName) {
          const nameParts = fullName.trim().split(' ');
          if (nameParts.length === 1) {
            firstName = nameParts[0];
            lastName = '';
          } else if (nameParts.length === 2) {
            firstName = nameParts[0];
            lastName = nameParts[1];
          } else {
            // For names with more than 2 parts, first part is first name, rest is last name
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          }
        }
        
        setProfile({
          firstName: firstName,
          lastName: lastName,
          email: profileData.email || '',
          phone: profileData.phone || '',
          role: profileData.role || '',
          companies: profileData.companies || [{ name: '', nif: '' }]
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const addCompany = () => {
    setProfile(prev => ({
      ...prev,
      companies: [...(prev.companies || []), { name: '', nif: '' }]
    }));
  };

  const removeCompany = (index: number) => {
    setProfile(prev => ({
      ...prev,
      companies: prev.companies?.filter((_, i) => i !== index) || []
    }));
  };

  const updateCompany = (index: number, field: 'name' | 'nif', value: string) => {
    setProfile(prev => ({
      ...prev,
      companies: prev.companies?.map((company, i) => 
        i === index ? { ...company, [field]: value } : company
      ) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      const filteredCompanies = profile.companies?.filter(company =>
        company.name.trim() !== '' && company.nif.trim() !== ''
      ) || [];

      await settingsAPI.updateUserProfile({
        name: fullName,
        phone: profile.phone,
        companies: filteredCompanies
      });

      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'companies', name: 'Companies', icon: Building }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header - Fixed */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-16 left-0 right-0 z-20 lg:left-64">
        <div className="container mx-auto px-4 py-8">
      <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-lg text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-48">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
        </div>
      )}

      {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'profile' | 'companies')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                      <Icon className="h-4 w-4" />
                {tab.name}
              </button>
                  );
          })}
        </nav>
      </div>

            <div className="p-6">
      {/* Profile Tab */}
      {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                        name="firstName"
                    value={profile.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                        name="lastName"
                    value={profile.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                  />
                    </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                      name="email"
                    value={profile.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                      name="phone"
                    value={profile.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                      name="role"
                    value={profile.role}
                    disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
              </div>
              
                  <div className="flex justify-end">
                <button
                      type="submit"
                  disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
                </form>
              )}

              {/* Companies Tab */}
              {activeTab === 'companies' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                      <p className="text-sm text-gray-500">Manage your company details and NIF numbers</p>
            </div>
                    <button
                      type="button"
                      onClick={addCompany}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Add Company
                    </button>
                  </div>

                  {profile.companies && profile.companies.length > 0 ? (
                    <div className="space-y-4">
                      {profile.companies.map((company, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Company {index + 1}</h4>
                            {profile.companies && profile.companies.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCompany(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name
                  </label>
                  <input
                                type="text"
                                value={company.name}
                                onChange={(e) => updateCompany(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                NIF
                  </label>
                  <input
                                type="text"
                                value={company.nif}
                                onChange={(e) => updateCompany(index, 'nif', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter NIF number"
                  />
                </div>
              </div>
                  </div>
                ))}
              </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No companies added</h3>
                      <p className="text-gray-500 mb-4">Add your first company to get started.</p>
                <button
                        type="button"
                        onClick={addCompany}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                      >
                        <Building className="h-4 w-4" />
                        Add Company
                </button>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Companies'}
                    </button>
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Settings;