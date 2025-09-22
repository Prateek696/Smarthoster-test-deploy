import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'pt'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation keys
const translations = {
  en: {
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to Owner Portal',
    'dashboard.overview': 'Overview',
    'dashboard.properties': 'Properties',
    'dashboard.bookings': 'Bookings',
    'dashboard.revenue': 'Revenue',
    'dashboard.occupancy': 'Occupancy Rate',
    'dashboard.averageRate': 'Average Rate',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.totalBookings': 'Total Bookings',
    'dashboard.activeProperties': 'Active Properties',
    'dashboard.pendingReviews': 'Pending Reviews',
    'dashboard.description': 'Here\'s what\'s happening with your properties today. Manage your portfolio with ease and maximize your rental income.',
    'dashboard.recentBookings': 'Recent Bookings',
    'dashboard.latestReservations': 'Latest reservations across your properties',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.manageEfficiently': 'Manage your properties efficiently',
    'dashboard.yourProperties': 'Your Properties',
    'dashboard.managePortfolio': 'Manage and monitor your property portfolio',
    'dashboard.viewCalendar': 'View Calendar',
    'dashboard.manageBookings': 'Manage Bookings',
    'dashboard.viewInvoices': 'View Invoices',
    'dashboard.getSAFT': 'Get SAFT-T',
    'dashboard.noBookings': 'No recent bookings found',
    'dashboard.bookingsWillAppear': 'Bookings will appear here once you have reservations',
    'dashboard.activePropertiesCount': 'Active Properties',
    'greeting.morning': 'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening': 'Good evening',
    
    // Property Management
    'property.name': 'Property Name',
    'property.address': 'Address',
    'property.type': 'Type',
    'property.status': 'Status',
    'property.guests': 'Max Guests',
    'property.bedrooms': 'Bedrooms',
    'property.bathrooms': 'Bathrooms',
    'property.amenities': 'Amenities',
    'property.actions': 'Actions',
    'property.edit': 'Edit',
    'property.delete': 'Delete',
    'property.view': 'View',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.adminPanel': 'Admin Panel',
    'nav.ownerManagement': 'Owner Management',
    'nav.properties': 'Properties',
    'nav.bookings': 'Bookings',
    'nav.invoices': 'Invoices',
    'nav.sibaManager': 'SIBA Manager',
    'nav.saft': 'SAFT-T',
    'nav.calendar': 'Calendar',
    'nav.reviews': 'Reviews',
    'nav.performance': 'Performance',
    'nav.portfolio': 'Portfolio',
    'nav.creditNotes': 'Credit Notes',
    'nav.expenses': 'Expenses',
    'nav.ownerStatements': 'Owner Statements',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.refresh': 'Refresh',
    
    // Language
    'language.english': 'English',
    'language.portuguese': 'Português',
    'language.switch': 'Switch Language',
    
    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    
    // Calendar
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.today': 'Today',
    'calendar.booked': 'Booked',
    'calendar.available': 'Available',
    'calendar.blocked': 'Blocked',
    'calendar.price': 'Price',
    'calendar.minStay': 'Min Stay',
    
    // Notifications
    'notification.newBooking': 'New Booking',
    'notification.paymentReceived': 'Payment Received',
    'notification.reviewReceived': 'New Review',
    'notification.maintenanceRequest': 'Maintenance Request',
    'notification.title': 'Notifications',
    'notification.markAllRead': 'Mark all read',
    'notification.noNotifications': 'No notifications',
  },
  pt: {
    // Dashboard
    'dashboard.title': 'Painel de Controle',
    'dashboard.welcome': 'Bem-vindo ao Portal do Proprietário',
    'dashboard.overview': 'Visão Geral',
    'dashboard.properties': 'Propriedades',
    'dashboard.bookings': 'Reservas',
    'dashboard.revenue': 'Receita',
    'dashboard.occupancy': 'Taxa de Ocupação',
    'dashboard.averageRate': 'Taxa Média',
    'dashboard.totalRevenue': 'Receita Total',
    'dashboard.totalBookings': 'Total de Reservas',
    'dashboard.activeProperties': 'Propriedades Ativas',
    'dashboard.pendingReviews': 'Avaliações Pendentes',
    'dashboard.description': 'Aqui está o que está acontecendo com suas propriedades hoje. Gerencie seu portfólio com facilidade e maximize sua receita de aluguel.',
    'dashboard.recentBookings': 'Reservas Recentes',
    'dashboard.latestReservations': 'Últimas reservas em suas propriedades',
    'dashboard.quickActions': 'Ações Rápidas',
    'dashboard.manageEfficiently': 'Gerencie suas propriedades com eficiência',
    'dashboard.yourProperties': 'Suas Propriedades',
    'dashboard.managePortfolio': 'Gerencie e monitore seu portfólio de propriedades',
    'dashboard.viewCalendar': 'Ver Calendário',
    'dashboard.manageBookings': 'Gerenciar Reservas',
    'dashboard.viewInvoices': 'Ver Faturas',
    'dashboard.getSAFT': 'Obter SAFT-T',
    'dashboard.noBookings': 'Nenhuma reserva recente encontrada',
    'dashboard.bookingsWillAppear': 'As reservas aparecerão aqui assim que você tiver reservas',
    'dashboard.activePropertiesCount': 'Propriedades Ativas',
    'greeting.morning': 'Bom dia',
    'greeting.afternoon': 'Boa tarde',
    'greeting.evening': 'Boa noite',
    
    // Property Management
    'property.name': 'Nome da Propriedade',
    'property.address': 'Endereço',
    'property.type': 'Tipo',
    'property.status': 'Status',
    'property.guests': 'Hóspedes Máx',
    'property.bedrooms': 'Quartos',
    'property.bathrooms': 'Banheiros',
    'property.amenities': 'Comodidades',
    'property.actions': 'Ações',
    'property.edit': 'Editar',
    'property.delete': 'Excluir',
    'property.view': 'Visualizar',
    
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.adminPanel': 'Painel Admin',
    'nav.ownerManagement': 'Gestão de Proprietários',
    'nav.properties': 'Propriedades',
    'nav.bookings': 'Reservas',
    'nav.invoices': 'Faturas',
    'nav.sibaManager': 'Gestor SIBA',
    'nav.saft': 'SAFT-T',
    'nav.calendar': 'Calendário',
    'nav.reviews': 'Avaliações',
    'nav.performance': 'Desempenho',
    'nav.portfolio': 'Portfólio',
    'nav.creditNotes': 'Notas de Crédito',
    'nav.expenses': 'Despesas',
    'nav.ownerStatements': 'Extratos do Proprietário',
    'nav.settings': 'Configurações',
    'nav.profile': 'Perfil',
    'nav.signOut': 'Sair',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.view': 'Visualizar',
    'common.close': 'Fechar',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.confirm': 'Confirmar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.refresh': 'Atualizar',
    
    // Language
    'language.english': 'English',
    'language.portuguese': 'Português',
    'language.switch': 'Alterar Idioma',
    
    // Status
    'status.active': 'Ativo',
    'status.inactive': 'Inativo',
    'status.pending': 'Pendente',
    'status.completed': 'Concluído',
    'status.cancelled': 'Cancelado',
    
    // Calendar
    'calendar.month': 'Mês',
    'calendar.week': 'Semana',
    'calendar.day': 'Dia',
    'calendar.today': 'Hoje',
    'calendar.booked': 'Reservado',
    'calendar.available': 'Disponível',
    'calendar.blocked': 'Bloqueado',
    'calendar.price': 'Preço',
    'calendar.minStay': 'Estadia Mín',
    
    // Notifications
    'notification.newBooking': 'Nova Reserva',
    'notification.paymentReceived': 'Pagamento Recebido',
    'notification.reviewReceived': 'Nova Avaliação',
    'notification.maintenanceRequest': 'Solicitação de Manutenção',
    'notification.title': 'Notificações',
    'notification.markAllRead': 'Marcar todas como lidas',
    'notification.noNotifications': 'Nenhuma notificação',
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') as Language
    return savedLanguage && ['en', 'pt'].includes(savedLanguage) ? savedLanguage : 'en'
  })

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
