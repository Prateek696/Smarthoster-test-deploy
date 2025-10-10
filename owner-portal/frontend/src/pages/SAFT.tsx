import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { Receipt, Download, Calendar, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { getAllOwners, Owner } from '../services/admin.api';
import { settingsAPI } from '../services/settings.api';
import apiClient from '../services/apiClient';
import { useLanguage } from '../contexts/LanguageContext';

interface SAFTResponse {
  generated: string;
  sent: string;
  saft: string;
}

const SAFT: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const now = new Date();
    // Always default to previous month, so if current month is January, show December of previous year
    const currentMonth = now.getMonth(); // 0-based (0=Jan, 1=Feb, etc.)
    return currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const now = new Date();
    // Always default to previous month
    const currentMonth = now.getMonth(); // 0-based (0=Jan, 1=Feb, etc.)
    if (currentMonth === 0) {
      return 12; // December of previous year
    } else {
      return currentMonth; // Previous month (getMonth() is 0-indexed, so current month - 1)
    }
  });
  const [invoicingNif, setInvoicingNif] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<{ownerId: string, companyIndex: number} | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saftData, setSaftData] = useState<SAFTResponse | null>(null);
  const [error, setError] = useState<string>('');

  // Generate years array (current year ± 2)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  
  // Generate months array
  const months = [
    { value: 1, name: t('saft.month.january') },
    { value: 2, name: t('saft.month.february') },
    { value: 3, name: t('saft.month.march') },
    { value: 4, name: t('saft.month.april') },
    { value: 5, name: t('saft.month.may') },
    { value: 6, name: t('saft.month.june') },
    { value: 7, name: t('saft.month.july') },
    { value: 8, name: t('saft.month.august') },
    { value: 9, name: t('saft.month.september') },
    { value: 10, name: t('saft.month.october') },
    { value: 11, name: t('saft.month.november') },
    { value: 12, name: t('saft.month.december') }
  ];

  // Fetch owners on component mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        let ownersData: Owner[] = [];
        
        // For accountants, fetch companies from assigned properties
        if (user?.role === 'accountant') {
          console.log('📊 Accountant: Fetching companies from assigned properties');
          try {
            const response = await apiClient.get('/admin/accountants/companies');
            if (response.success && response.companies && response.companies.length > 0) {
              console.log('✅ Fetched accountant companies:', response.companies);
              
              // Transform companies into Owner format for compatibility
              const companiesAsOwners: Owner[] = response.companies.map((company: any, index: number) => ({
                _id: company.ownerId,
                name: company.ownerName,
                email: '',
                phone: '',
                role: 'owner',
                isVerified: true,
                hasApiKeys: false,
                apiKeysActive: false,
                companies: [{ name: company.name, nif: company.nif }],
                createdAt: '',
                updatedAt: ''
              }));
              
              setOwners(companiesAsOwners);
              console.log('👤 Accountant companies set:', companiesAsOwners);
              console.log('📊 Total companies available in dropdown:', companiesAsOwners.reduce((sum, o) => sum + (o.companies?.length || 0), 0));
              console.log('📋 Dropdown options will be:', companiesAsOwners.flatMap(o => 
                o.companies?.map(c => `${c.name} (${c.nif}) - ${o.name}`)
              ));
              return;
            } else {
              console.log('⚠️ No companies found for accountant');
              setOwners([]);
              return;
            }
          } catch (accountantError: any) {
            console.error('❌ Failed to fetch accountant companies:', accountantError);
            console.error('❌ Error details:', accountantError.response?.data);
            setError('Failed to fetch company information. Please ensure: 1) Properties are assigned to you, 2) Property owners have company information added.');
            setOwners([]);
            return;
          }
        }
        
        // Try to fetch all owners (only works for admin users)
        try {
          ownersData = await getAllOwners();
          console.log('✅ Admin: Fetched all owners successfully');
        } catch (adminError: any) {
          console.log('ℹ️ Not admin or getAllOwners failed, using current user companies only');
          // Not admin or API failed, will use current user's companies below
        }
        
        // Always fetch and use current user's profile to get latest companies
        let currentUserCompanies = user?.companies;
        console.log('📋 Initial companies from Redux:', currentUserCompanies);
        
        try {
          const userProfile = await settingsAPI.getUserProfile();
          currentUserCompanies = userProfile.companies;
          console.log('✅ Fetched user profile companies from API:', currentUserCompanies);
          console.log('📊 User profile full data:', userProfile);
        } catch (profileError: any) {
          console.error('⚠️ Failed to fetch user profile:', profileError);
          console.log('⚠️ Using Redux companies as fallback');
        }
        
        // For non-admin users OR if no owners data, show only current user's companies
        if (user?.role !== 'admin' || ownersData.length === 0) {
          if (currentUserCompanies && currentUserCompanies.length > 0) {
            const currentUserAsOwner: Owner = {
              _id: user?.id || 'current-user',
              name: user?.name || 'Current User',
              email: user?.email || '',
              phone: user?.phone,
              role: user?.role || 'user',
              isVerified: user?.isVerified || false,
              hasApiKeys: false,
              apiKeysActive: false,
              companies: currentUserCompanies,
              createdAt: user?.createdAt || new Date().toISOString(),
              updatedAt: user?.updatedAt || new Date().toISOString()
            };
            setOwners([currentUserAsOwner]);
            console.log('✅ Owner user: Using own companies only');
          } else {
            setOwners([]);
            console.log('⚠️ No companies found for current user');
          }
        } else {
          // Admin user: show all owners + their own companies
          if (currentUserCompanies && currentUserCompanies.length > 0) {
            const currentUserAsOwner: Owner = {
              _id: user?.id || 'current-user',
              name: user?.name || 'Current User (Me)',
              email: user?.email || '',
              phone: user?.phone,
              role: user?.role || 'user',
              isVerified: user?.isVerified || false,
              hasApiKeys: false,
              apiKeysActive: false,
              companies: currentUserCompanies,
              createdAt: user?.createdAt || new Date().toISOString(),
              updatedAt: user?.updatedAt || new Date().toISOString()
            };
            ownersData.unshift(currentUserAsOwner); // Add to beginning
          }
          setOwners(ownersData);
          console.log('✅ Admin: Final owners list with all users');
        }
        
        console.log('📋 Total companies available:', owners.length > 0 ? owners.reduce((total, owner) => total + (owner.companies?.length || 0), 0) : 0);
      } catch (error) {
        console.error('❌ Error in fetchOwners:', error);
        // Fallback: try to show at least current user's companies
        if (user?.companies && user.companies.length > 0) {
          const fallbackOwner: Owner = {
            _id: user.id || 'current-user',
            name: user.name || 'Current User',
            email: user.email || '',
            phone: user.phone,
            role: user.role || 'user',
            isVerified: user.isVerified || false,
            hasApiKeys: false,
            apiKeysActive: false,
            companies: user.companies,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
          };
          setOwners([fallbackOwner]);
        }
      }
    };
    fetchOwners();
  }, [user]);

  // Update invoicingNif when company selection changes
  useEffect(() => {
    if (selectedCompany) {
      const owner = owners.find(o => o._id === selectedCompany.ownerId);
      
      if (owner && owner.companies && owner.companies[selectedCompany.companyIndex]) {
        const company = owner.companies[selectedCompany.companyIndex];
        setInvoicingNif(company.nif);
      }
    }
  }, [selectedCompany, owners]);

  const getSAFT = async () => {
    if (!invoicingNif) {
      setError('Please select a company or enter invoicing VAT ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setSaftData(null);

    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString(),
        invoicing_nif: invoicingNif
      });
      
      const data = await apiClient.get(`/saft/get?${params}`);
      setSaftData(data);
    } catch (error: any) {
      console.error('SAFT retrieval error:', error);
      
      // Check if it's a 404 or specific "not found" error
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      if (error?.response?.status === 404 || errorMessage.includes('not found') || errorMessage.includes('Invalid response')) {
        setError(`SAFT file not generated for ${months.find(m => m.value === selectedMonth)?.name} ${selectedYear}. Please try selecting an earlier month.`);
      } else if (error?.response?.status === 400) {
        setError(errorMessage || 'Invalid request. Please check your company selection.');
      } else if (!error?.response) {
        setError('Network error occurred. Please check your connection.');
      } else {
        setError(errorMessage || 'Error retrieving SAFT file. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSAFT = () => {
    if (saftData?.saft) {
      // Convert base64 to blob and download
      const byteCharacters = atob(saftData.saft);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/xml' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SAFT-T_${selectedYear}_${selectedMonth}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Receipt className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('saft.title')}</h1>
        </div>
        <p className="text-gray-600">
          {t('saft.description')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('saft.companySelection')}
            </label>
            <div className="space-y-3">
              {/* Company Dropdown */}
              <select
                value={selectedCompany ? `${selectedCompany.ownerId}-${selectedCompany.companyIndex}` : ''}
                onChange={(e) => {
                  console.log('🔄 Dropdown changed, value:', e.target.value);
                  if (e.target.value) {
                    // Split by the last hyphen to handle ownerId with hyphens
                    const lastHyphenIndex = e.target.value.lastIndexOf('-');
                    const ownerId = e.target.value.substring(0, lastHyphenIndex);
                    const companyIndex = parseInt(e.target.value.substring(lastHyphenIndex + 1));
                    console.log('📝 Setting selected company:', { ownerId, companyIndex });
                    setSelectedCompany({ ownerId, companyIndex });
                  } else {
                    console.log('❌ Clearing selected company');
                    setSelectedCompany(null);
                    setInvoicingNif('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('saft.selectCompany')}</option>
                {owners.map((owner) => {
                  return owner.companies?.map((company, index) => {
                    const optionValue = `${owner._id}-${index}`;
                    return (
                      <option key={optionValue} value={optionValue}>
                        {company.name} ({company.nif}) - {owner.name}
                      </option>
                    );
                  });
                })}
              </select>
              
              {/* Manual NIF Input (fallback) */}
              <div className="text-sm text-gray-500">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('saft.enterNifManually')}
            </label>
            <input
              type="text"
              value={invoicingNif}
                  onChange={(e) => {
                    setInvoicingNif(e.target.value);
                    setSelectedCompany(null); // Clear selection when typing manually
                  }}
                  placeholder={t('saft.nifPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
              </div>
            </div>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              {t('saft.year')}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('saft.month')}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Retrieve Button */}
        <div className="mt-6">
          <button
            onClick={() => getSAFT()}
            disabled={isLoading || !invoicingNif}
            className="w-full md:w-auto px-6 py-3 bg-blue-500/20 text-gray-900 rounded-md hover:bg-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span>{t('saft.retrieving')}</span>
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 opacity-70" />
                <span>{t('saft.retrieveSaft')}</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">{t('saft.saftNotAvailable')}</h3>
              <p className="text-sm text-amber-800">{error}</p>
              {error.includes('not generated') && (
                <p className="text-xs text-amber-700 mt-2">
                  {t('saft.tipNotGenerated')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Display */}
        {saftData && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">{t('saft.retrievedSuccessfully')}</h3>
                <div className="mt-2 text-sm text-green-700">
                <p><strong>{t('saft.generated')}:</strong> {new Date(saftData.generated).toLocaleString()}</p>
                <p><strong>{t('saft.sent')}:</strong> {new Date(saftData.sent).toLocaleString()}</p>
                </div>
                <button
                onClick={() => downloadSAFT()}
                className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-gray-900 rounded-md hover:bg-green-500/30 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                <Download className="w-4 h-4 opacity-70" />
                <span>{t('saft.downloadSaftFile')}</span>
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">{t('saft.aboutSaft')}</h2>
        <p className="text-blue-800 text-sm leading-relaxed">
          {t('saft.aboutDescription1')}
        </p>
        <p className="text-blue-800 text-sm leading-relaxed mt-2">
          {t('saft.aboutDescription2')}
        </p>
      </div>
    </div>
  );
};

export default SAFT;