import { configureStore } from '@reduxjs/toolkit'
import authSlice from './auth.slice'
import propertiesSlice from './properties.slice'
import propertyManagementSlice from './propertyManagement.slice'
import bookingsSlice from './bookings.slice'
import invoicesSlice from './invoices.slice'
import touristTaxSlice from './touristTax.slice'
import sibaSlice from './siba.slice'
import sibaManagerSlice from './sibaManager.slice'
import notificationsSlice from './notifications.slice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    properties: propertiesSlice,
    propertyManagement: propertyManagementSlice,
    bookings: bookingsSlice,
    invoices: invoicesSlice,
    touristTax: touristTaxSlice,
    siba: sibaSlice,
    sibaManager: sibaManagerSlice,
    notifications: notificationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch



