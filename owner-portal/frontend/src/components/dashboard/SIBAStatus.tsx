import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { fetchSibaStatusAsync } from '../../store/siba.slice'

interface SIBAStatusProps {
  properties: number[]
}

const SIBAStatus: React.FC<SIBAStatusProps> = ({ properties }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { statuses, isLoading } = useSelector((state: RootState) => state.siba)

  useEffect(() => {
    properties.forEach(propertyId => {
      dispatch(fetchSibaStatusAsync(propertyId))
    })
  }, [dispatch, properties])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'red':
        return <AlertCircle className="h-5 w-5 text-danger-600" />
      case 'yellow':
        return <Clock className="h-5 w-5 text-warning-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'green':
        return 'Up to date'
      case 'red':
        return 'Overdue'
      case 'yellow':
        return 'Due soon'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'text-success-600 bg-success-50'
      case 'red':
        return 'text-danger-600 bg-danger-50'
      case 'yellow':
        return 'text-warning-600 bg-warning-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading SIBA status...</span>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No properties selected</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {properties.map(propertyId => {
        const status = statuses[propertyId]
        if (!status) return null

        return (
          <div key={propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.status)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Property {propertyId}
                </p>
                <p className="text-xs text-gray-600">
                  {status.message}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                {getStatusText(status.status)}
              </span>
              {status.lastSibaSendDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Last: {new Date(status.lastSibaSendDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
      
      <div className="mt-4">
        <button className="w-full btn-primary btn-sm">
          Submit SIBA Report
        </button>
      </div>
    </div>
  )
}

export default SIBAStatus