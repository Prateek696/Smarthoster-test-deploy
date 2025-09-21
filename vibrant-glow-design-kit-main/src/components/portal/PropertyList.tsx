
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  max_guests: number;
  current_bookings: number;
  next_checkin: string | null;
  next_checkout: string | null;
  occupancy_rate: number;
}

const PropertyList = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user?.id);

      if (error) throw error;

      // For each property, get additional stats
      const propertiesWithStats = await Promise.all(
        (data || []).map(async (property) => {
          // Get current bookings
          const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('property_id', property.id)
            .gte('check_out_date', new Date().toISOString().split('T')[0])
            .order('check_in_date', { ascending: true });

          // Calculate occupancy rate for current month
          const currentMonth = new Date();
          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          const { data: monthlyBookings } = await supabase
            .from('bookings')
            .select('check_in_date, check_out_date')
            .eq('property_id', property.id)
            .gte('check_in_date', firstDay.toISOString().split('T')[0])
            .lte('check_in_date', lastDay.toISOString().split('T')[0]);

          const daysInMonth = lastDay.getDate();
          const bookedDays = monthlyBookings?.reduce((sum, booking) => {
            const checkIn = new Date(booking.check_in_date);
            const checkOut = new Date(booking.check_out_date);
            const nights = Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
            return sum + nights;
          }, 0) || 0;

          const occupancyRate = daysInMonth > 0 ? (bookedDays / daysInMonth) * 100 : 0;

          // Map database fields to our interface
          return {
            id: property.id,
            name: property.name,
            address: property.address,
            type: property.property_type || 'Unknown', // Map property_type to type
            max_guests: 4, // Default value since this field might not exist in DB
            current_bookings: bookings?.length || 0,
            next_checkin: bookings?.[0]?.check_in_date || null,
            next_checkout: bookings?.[0]?.check_out_date || null,
            occupancy_rate: occupancyRate,
          };
        })
      );

      setProperties(propertiesWithStats);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            {t.portal.properties.overview}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.portal.properties.noPropertiesFound}</h3>
              <p className="text-gray-500">{t.portal.properties.contactSupport}</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Card key={property.id} className="border-2 hover:border-[#5FFF56] transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.portal.properties.type}</span>
                      <Badge variant="outline">{property.type}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {t.portal.properties.maxGuests}
                      </span>
                      <span className="font-semibold">{property.max_guests}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.portal.properties.currentBookings}</span>
                      <Badge className="bg-[#5FFF56] text-black">
                        {property.current_bookings}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.portal.properties.occupancyRate}</span>
                      <span className="font-semibold">{property.occupancy_rate.toFixed(1)}%</span>
                    </div>
                    
                    {property.next_checkin && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {t.portal.properties.nextCheckin} {new Date(property.next_checkin).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyList;
