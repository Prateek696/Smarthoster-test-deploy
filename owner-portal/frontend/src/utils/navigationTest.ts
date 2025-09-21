// Utility functions to test property navigation URLs
export const generatePropertyNavigationUrls = (propertyId: number) => {
  const now = new Date()
  
  // Current month range
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const currentMonth = {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  }
  
  // Last month range
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const lastMonth = {
    startDate: startOfLastMonth.toISOString().split('T')[0],
    endDate: endOfLastMonth.toISOString().split('T')[0]
  }

  return {
    bookings: `/bookings?propertyId=${propertyId}&startDate=${currentMonth.startDate}&endDate=${currentMonth.endDate}&period=thisMonth`,
    invoices: `/invoices?propertyId=${propertyId}&startDate=${lastMonth.startDate}&endDate=${lastMonth.endDate}&period=lastMonth`,
    performance: `/performance/${propertyId}?startDate=${currentMonth.startDate}&endDate=${currentMonth.endDate}&period=thisMonth`,
    calendar: `/calendar?propertyId=${propertyId}&startDate=${currentMonth.startDate}&endDate=${currentMonth.endDate}&period=thisMonth`
  }
}

export const testPropertyNavigation = (propertyId: number) => {
  const urls = generatePropertyNavigationUrls(propertyId)
  
  console.log(`🧪 Testing Property Navigation for Property ${propertyId}:`)
  console.log(`📅 Current Month: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
  console.log(`📅 Last Month: ${new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
  console.log('')
  console.log('🔗 Generated URLs:')
  console.log(`📖 Bookings: ${urls.bookings}`)
  console.log(`📄 Invoices: ${urls.invoices}`)
  console.log(`📊 Performance: ${urls.performance}`)
  console.log(`📅 Calendar: ${urls.calendar}`)
  console.log('')
  console.log('✅ All URLs are ready for testing!')
  
  return urls
}

// Test with a sample property
export const runNavigationTest = () => {
  const testPropertyId = 392776 // Piece of Heaven
  return testPropertyNavigation(testPropertyId)
}





