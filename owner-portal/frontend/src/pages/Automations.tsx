import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Zap, 
  Copy, 
  Clock, 
  Plus, 
  Play, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import PropertySelector from '../components/common/PropertySelector';
import { RootState, AppDispatch } from '../store';
import { fetchPropertiesAsync } from '../store/properties.slice';

interface Automation {
  id: string;
  name: string;
  description: string;
  type: 'saft_generation' | 'siba_alerts' | 'calendar_sync';
  schedule: string;
  config: any;
  status: 'active' | 'paused' | 'disabled';
  userId: string;
  propertyId?: number;
  runCount: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'saft_generation' | 'siba_alerts' | 'calendar_sync';
  schedule: string;
  config: any;
}

interface AutomationActivity {
  id: string;
  automationId: string;
  automationName: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  details: any;
}

const Automations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((state: RootState) => state.properties);
  
  const [activeTab, setActiveTab] = useState<'automations' | 'templates' | 'activity'>('automations');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [activities, setActivities] = useState<AutomationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    type: 'saft_generation' as 'saft_generation' | 'siba_alerts' | 'calendar_sync',
    schedule: '0 9 2 * *',
    config: { emailNotification: true, autoFix: false },
    propertyId: null as number | null
  });

  useEffect(() => {
    // Fetch properties first
    dispatch(fetchPropertiesAsync());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [selectedProperty]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const params = selectedProperty ? `?propertyId=${selectedProperty}` : '';
      
      const [automationsRes, templatesRes, activitiesRes] = await Promise.all([
        fetch(`/automations${params}`, { headers }),
        fetch('/automations/templates', { headers }),
        fetch('/automations/activity?limit=50', { headers })
      ]);

      if (automationsRes.ok) {
        const response = await automationsRes.json();
        console.log('Automations data received:', response);
        setAutomations(response.automations || []);
      } else {
        console.error('Automations request failed:', automationsRes.status);
      }

      if (templatesRes.ok) {
        const response = await templatesRes.json();
        console.log('Templates data received:', response);
        setTemplates(response.templates || []);
      } else {
        console.error('Templates request failed:', templatesRes.status);
      }

      if (activitiesRes.ok) {
        const response = await activitiesRes.json();
        console.log('Activities data received:', response);
        setActivities(response.activities || []);
      } else {
        console.error('Activities request failed:', activitiesRes.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutomation = async (automationId: string) => {
    setLoadingActions(prev => ({ ...prev, [`run-${automationId}`]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/automations/${automationId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error running automation:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`run-${automationId}`]: false }));
    }
  };

  const handleViewAutomation = (automationId: string) => {
    const automation = automations.find(a => a.id === automationId);
    if (automation) {
      setSelectedAutomation(automation);
      setShowViewModal(true);
    }
  };

  const handleEditAutomation = (automationId: string) => {
    const automation = automations.find(a => a.id === automationId);
    if (automation) {
      setEditingAutomation(automation);
      setShowEditModal(true);
    }
  };

  const handleCreateAutomation = () => {
    // Reset form
    setNewAutomation({
      name: '',
      description: '',
      type: 'saft_generation',
      schedule: '0 9 2 * *',
      config: { emailNotification: true, autoFix: false },
      propertyId: selectedProperty
    });
    setShowCreateModal(true);
  };

  const handleSaveAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/automations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAutomation)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        await fetchData(); // Refresh data
      } else {
        console.error('Failed to create automation');
      }
    } catch (error) {
      console.error('Error creating automation:', error);
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    setLoadingActions(prev => ({ ...prev, [`delete-${automationId}`]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/automations/${automationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${automationId}`]: false }));
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    setLoadingActions(prev => ({ ...prev, [`template-${templateId}`]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/automations/templates/${templateId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
        setShowTemplateModal(false);
      }
    } catch (error) {
      console.error('Error creating from template:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`template-${templateId}`]: false }));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'saft_generation': return FileText;
      case 'siba_alerts': return AlertTriangle;
      case 'calendar_sync': return Clock;
      default: return Zap;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'saft_generation': return 'bg-blue-100 text-blue-800';
      case 'siba_alerts': return 'bg-orange-100 text-orange-800';
      case 'calendar_sync': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'disabled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading automations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
              <p className="text-gray-600 mt-2">Automate your property management workflows</p>
            </div>
        
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button 
                onClick={() => setShowTemplateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Copy className="h-4 w-4 mr-2" />
                Templates
              </button>
              
              <button 
                onClick={handleCreateAutomation}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <PropertySelector
                properties={properties}
                selectedId={selectedProperty}
                onChange={setSelectedProperty}
                placeholder="All Properties"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'automations', name: 'My Automations', icon: Zap },
              { id: 'templates', name: 'Templates', icon: Copy },
              { id: 'activity', name: 'Activity', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'automations' && (
          <div className="space-y-6">
            {automations && automations.length > 0 ? automations.map((automation) => {
              const TypeIcon = getTypeIcon(automation.type)
              return (
                <div key={automation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <TypeIcon className="h-5 w-5 text-gray-400" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(automation.type)}`}>
                          {automation.type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                          {automation.status}
                        </span>
                        <span className="text-sm text-gray-500">Schedule: {automation.schedule}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{automation.name}</h3>
                      <p className="text-gray-700 mb-3">{automation.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Runs: {automation.runCount}</span>
                        {automation.lastRunAt && (
                          <span>Last run: {formatDate(automation.lastRunAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleRunAutomation(automation.id)}
                        disabled={loadingActions[`run-${automation.id}`]}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingActions[`run-${automation.id}`] ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {loadingActions[`run-${automation.id}`] ? 'Running...' : 'Run'}
                      </button>
                      
                      <button
                        onClick={() => handleViewAutomation(automation.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </button>
                      
                      <button
                        onClick={() => handleEditAutomation(automation.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No automations found</h3>
                <p className="text-gray-500">Create your first automation to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates && templates.length > 0 ? templates.map((template) => {
                const TypeIcon = getTypeIcon(template.type)
                return (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-5 w-5 text-gray-400" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Template
                        </span>
                      </div>
                    
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-gray-700 mb-4 flex-grow">{template.description}</p>
                      
                      <button
                        onClick={() => handleCreateFromTemplate(template.id)}
                        disabled={loadingActions[`template-${template.id}`]}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingActions[`template-${template.id}`] ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {loadingActions[`template-${template.id}`] ? 'Creating...' : 'Use Template'}
                      </button>
                    </div>
                  </div>
                )
              }) : (
                <div className="col-span-full text-center py-12">
                  <Copy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
                  <p className="text-gray-500">Templates will appear here when available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            {activities && activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.automationName}</h3>
                    <p className="text-gray-700 mb-2">{activity.message}</p>
                    
                    {activity.details && (
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800">
                        {activity.automationId === 'saft_monthly' && activity.details.saftDownloadUrl ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">SAFT-T File Generated</p>
                              <p className="text-gray-600">Property {activity.details.propertyId} - {activity.details.year}-{activity.details.month?.toString().padStart(2, '0')}</p>
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = activity.details.saftDownloadUrl;
                                link.download = activity.details.fileName;
                                link.click();
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Download SAFT-T
                            </button>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
                <p className="text-gray-500">Activity logs will appear here when automations run.</p>
              </div>
            )}
          </div>
        )}


        {/* Create Automation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Create Automation</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter automation name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newAutomation.description}
                    onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe what this automation does"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newAutomation.type}
                    onChange={(e) => setNewAutomation({...newAutomation, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="saft_generation">SAFT-T Generation</option>
                    <option value="siba_alerts">SIBA Alerts</option>
                    <option value="calendar_sync">Calendar Sync</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    value={newAutomation.schedule}
                    onChange={(e) => setNewAutomation({...newAutomation, schedule: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0 9 2 * *"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: minute hour day month day-of-week</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                  <select
                    value={newAutomation.propertyId || ''}
                    onChange={(e) => setNewAutomation({...newAutomation, propertyId: e.target.value ? Number(e.target.value) : null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Properties</option>
                    {properties && properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Configuration (JSON)</label>
                  <textarea
                    value={JSON.stringify(newAutomation.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setNewAutomation({...newAutomation, config});
                      } catch (error) {
                        // Invalid JSON, keep the text but don't update config
                      }
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAutomation}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Automation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Automation Templates</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates && templates.length > 0 ? templates.map((template) => {
                    const TypeIcon = getTypeIcon(template.type)
                    return (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TypeIcon className="h-5 w-5 text-gray-400" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <button
                          onClick={() => handleCreateFromTemplate(template.id)}
                          disabled={loadingActions[`template-${template.id}`]}
                          className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingActions[`template-${template.id}`] ? 'Creating...' : 'Use Template'}
                        </button>
                      </div>
                    )
                  }) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">No templates available</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Automation Modal */}
        {showViewModal && selectedAutomation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const TypeIcon = getTypeIcon(selectedAutomation.type);
                    return <TypeIcon className="h-6 w-6 text-gray-400" />;
                  })()}
                  <h3 className="text-lg font-medium text-gray-900">{selectedAutomation.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedAutomation.type)}`}>
                    {selectedAutomation.type}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAutomation.status)}`}>
                    {selectedAutomation.status}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedAutomation.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                    <p className="text-gray-600">{selectedAutomation.schedule}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Run Count</h4>
                    <p className="text-gray-600">{selectedAutomation.runCount}</p>
                  </div>
                </div>

                {selectedAutomation.lastRunAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Last Run</h4>
                    <p className="text-gray-600">{formatDate(selectedAutomation.lastRunAt)}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm text-gray-600 overflow-x-auto">
                    {JSON.stringify(selectedAutomation.config, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditAutomation(selectedAutomation.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Edit Automation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Automation Modal */}
        {showEditModal && editingAutomation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const TypeIcon = getTypeIcon(editingAutomation.type);
                    return <TypeIcon className="h-6 w-6 text-gray-400" />;
                  })()}
                  <h3 className="text-lg font-medium text-gray-900">Edit {editingAutomation.name}</h3>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingAutomation.name}
                    onChange={(e) => setEditingAutomation({...editingAutomation, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingAutomation.description}
                    onChange={(e) => setEditingAutomation({...editingAutomation, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    value={editingAutomation.schedule}
                    onChange={(e) => setEditingAutomation({...editingAutomation, schedule: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0 9 2 * *"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: minute hour day month day-of-week</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingAutomation.status}
                    onChange={(e) => setEditingAutomation({...editingAutomation, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Configuration (JSON)</label>
                  <textarea
                    value={JSON.stringify(editingAutomation.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setEditingAutomation({...editingAutomation, config});
                      } catch (error) {
                        // Invalid JSON, keep the text but don't update config
                      }
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`/automations/${editingAutomation.id}`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(editingAutomation)
                      });
                      
                      if (response.ok) {
                        setShowEditModal(false);
                        await fetchData(); // Refresh data
                      } else {
                        console.error('Failed to update automation');
                      }
                    } catch (error) {
                      console.error('Error updating automation:', error);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Automations;