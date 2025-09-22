import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Property } from '../../store/properties.slice'

interface PropertySelectorProps {
  properties: Property[]
  selectedId: number | null
  onChange: (id: number | null) => void
  placeholder?: string
  className?: string
  multiple?: boolean
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedId,
  onChange,
  placeholder = 'Select Property',
  className = ''
}) => {
  const selectedProperty = properties.find(p => p.id === selectedId)

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full px-4 py-3 pr-10 appearance-none cursor-pointer bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-lg"
      >
        <option value="" className="bg-white text-gray-900">{placeholder}</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id} className="bg-white text-gray-900">
            {property.name}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-500" />
      </div>
    </div>
  )
}

export default PropertySelector



