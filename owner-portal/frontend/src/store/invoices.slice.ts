import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Invoice {
  id: string
  propertyId: number
  propertyName: string
  guestName: string
  date: string
  value: number
  valueFormatted: string
  vat: number
  vatFormatted: string
  total: number
  totalFormatted: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  invoiceUrl?: string
  closed: boolean
  partial: boolean
}

interface InvoicesState {
  invoices: Invoice[]
  isLoading: boolean
  error: string | null
  summary: {
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
  }
}

const initialState: InvoicesState = {
  invoices: [],
  isLoading: false,
  error: null,
  summary: {
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  }
}

export const fetchInvoicesAsync = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params: { propertyId: number; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      console.log('🔍 fetchInvoicesAsync called with params:', params)
      const { invoicesAPI } = await import('../services/invoices.api')
      const result = await invoicesAPI.getInvoices(params)
      console.log('🔍 fetchInvoicesAsync received result:', result)
      return result
    } catch (error: any) {
      console.error('❌ fetchInvoicesAsync error:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices')
    }
  }
)

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicesAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvoicesAsync.fulfilled, (state, action) => {
        state.isLoading = false
        
        // Map API response to expected format
        const rawInvoices = Array.isArray(action.payload) ? action.payload : []
        
        // Property ID to name mapping - will be updated dynamically
        const getPropertyName = (propertyId: number) => {
          // This will be updated to use properties from Redux store
          return `Property ${propertyId}`
        }
        
        state.invoices = rawInvoices.map((invoice: any) => {
          const invoiceValue = parseFloat(invoice.value || '0')
          
          return {
            id: invoice.id || '',
            propertyId: invoice.propertyId || 0,
            propertyName: getPropertyName(invoice.propertyId || 0),
            guestName: invoice.name || invoice.guestName || 'Unknown Guest',
            date: invoice.date || new Date().toISOString(),
            value: invoiceValue,
            valueFormatted: `€${invoiceValue.toFixed(2)}`,
            vat: 0, // Remove VAT calculation
            vatFormatted: `€0.00`,
            total: invoiceValue, // Total = base amount (no VAT added)
            totalFormatted: `€${invoiceValue.toFixed(2)}`,
            status: invoice.closed ? 'paid' : (invoice.partial ? 'partial' : 'pending'),
            invoiceUrl: invoice.invoice_url || '#',
            closed: invoice.closed || false,
            partial: invoice.partial || false
          }
        })
        
        // Calculate summary
        state.summary = state.invoices.reduce((acc, invoice) => {
          acc.totalAmount += invoice.total
          if (invoice.status === 'paid') {
            acc.paidAmount += invoice.total
          } else if (invoice.status === 'pending' || invoice.status === 'partial') {
            acc.pendingAmount += invoice.total
          } else if (invoice.status === 'overdue') {
            acc.overdueAmount += invoice.total
          }
          return acc
        }, {
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0
        })
      })
      .addCase(fetchInvoicesAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = invoicesSlice.actions
export default invoicesSlice.reducer
