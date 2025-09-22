
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface FinancialData {
  totalEarnings: number;
  totalCommissions: number;
  totalCleaningFees: number;
  netIncome: number;
  invoices: Invoice[];
}

interface Invoice {
  id: string;
  amount: number;
  date: string;
  property_name: string;
  guest_name: string;
  status: string;
}

const FinancialOverview = ({ selectedProperty }: { selectedProperty: string }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalEarnings: 0,
    totalCommissions: 0,
    totalCleaningFees: 0,
    netIncome: 0,
    invoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user, selectedProperty]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings with financial data
      let query = supabase
        .from('bookings')
        .select(`
          *,
          properties!inner(owner_id, name)
        `)
        .eq('properties.owner_id', user?.id);

      if (selectedProperty !== 'all') {
        query = query.eq('property_id', selectedProperty);
      }

      const { data: bookings, error } = await query;
      if (error) throw error;

      // Calculate totals
      const totalEarnings = bookings?.reduce((sum, booking) => 
        sum + (Number(booking.total_amount) || 0), 0) || 0;
      
      const totalCleaningFees = bookings?.reduce((sum, booking) => 
        sum + (Number(booking.cleaning_fee) || 0), 0) || 0;
      
      const totalCommissions = bookings?.reduce((sum, booking) => 
        sum + (Number(booking.smarthoster_commission) || 0), 0) || 0;
      
      const netIncome = totalEarnings + totalCleaningFees - totalCommissions;

      // Format invoices data
      const invoices: Invoice[] = bookings?.map(booking => ({
        id: booking.id,
        amount: Number(booking.total_amount) || 0,
        date: booking.check_in_date,
        property_name: booking.properties?.name || 'Unknown Property',
        guest_name: booking.guest_name || 'Unknown Guest',
        status: booking.status || 'confirmed'
      })) || [];

      setFinancialData({
        totalEarnings,
        totalCommissions,
        totalCleaningFees,
        netIncome,
        invoices: invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const downloadInvoice = (invoiceId: string) => {
    // Placeholder for invoice download functionality
    console.log('Downloading invoice:', invoiceId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5FFF56]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portal.financial.totalEarnings}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">{t.portal.financial.grossRevenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portal.financial.cleaningFees}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalCleaningFees)}</div>
            <p className="text-xs text-muted-foreground">{t.portal.financial.additionalIncome}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portal.financial.managementFees}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalCommissions)}</div>
            <p className="text-xs text-muted-foreground">{t.portal.financial.smartHosterCommission}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portal.financial.netIncome}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialData.netIncome)}</div>
            <p className="text-xs text-muted-foreground">{t.portal.financial.afterAllFees}</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t.portal.financial.commissionBreakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>{t.portal.financial.grossEarnings}</span>
              <span className="font-semibold">{formatCurrency(financialData.totalEarnings)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t.portal.financial.cleaningFees}</span>
              <span className="font-semibold text-green-600">+{formatCurrency(financialData.totalCleaningFees)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t.portal.financial.managementCommission}</span>
              <span className="font-semibold text-red-600">-{formatCurrency(financialData.totalCommissions)}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">{t.portal.financial.netIncome}</span>
              <span className="font-bold text-green-600">{formatCurrency(financialData.netIncome)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Access */}
      <Card>
        <CardHeader>
          <CardTitle>{t.portal.financial.recentInvoices}</CardTitle>
        </CardHeader>
        <CardContent>
          {financialData.invoices.length === 0 ? (
            <p className="text-gray-500 text-center py-4">{t.portal.financial.noInvoicesFound}</p>
          ) : (
            <div className="space-y-3">
              {financialData.invoices.slice(0, 10).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{invoice.property_name}</span>
                      <Badge variant={invoice.status === 'confirmed' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.guest_name} • {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadInvoice(invoice.id)}
                      className="h-6 px-2"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {t.portal.financial.download}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
