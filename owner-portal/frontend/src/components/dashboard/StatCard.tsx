import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'

interface StatCardProps {
  title: string
  value: string
  change?: number
  trend?: 'up' | 'down'
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'primary',
  subtitle
}) => {
  const colorClasses = {
    primary: 'from-primary-50 to-primary-100 border-primary-200',
    success: 'from-success-50 to-success-100 border-success-200',
    warning: 'from-warning-50 to-warning-100 border-warning-200',
    danger: 'from-danger-50 to-danger-100 border-danger-200',
    info: 'from-blue-50 to-blue-100 border-blue-200'
  }

  const iconColorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    danger: 'text-danger-600 bg-danger-100',
    info: 'text-blue-600 bg-blue-100'
  }

  return (
    <div className={clsx(
      'card p-6 bg-gradient-to-br transition-all duration-200 hover:shadow-md',
      colorClasses[color]
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-danger-600 mr-1" />
              ) : null}
              
              <span className={clsx(
                'text-sm font-medium',
                trend === 'up' ? 'text-success-600' : 
                trend === 'down' ? 'text-danger-600' : 'text-gray-600'
              )}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={clsx(
          'flex items-center justify-center w-12 h-12 rounded-xl',
          iconColorClasses[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default StatCard



