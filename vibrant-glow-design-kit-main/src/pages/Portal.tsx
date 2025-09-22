
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Home, Euro, BarChart3, Users, Calendar } from "lucide-react";
import CalendarView from "@/components/portal/CalendarView";
import FinancialOverview from "@/components/portal/FinancialOverview";
import PropertyList from "@/components/portal/PropertyList";
import { useLanguage } from "@/contexts/LanguageContext";

const Portal = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [selectedProperty, setSelectedProperty] = useState("all");

  const stats = [
    {
      title: t.portal.stats.totalProperties,
      value: "3",
      change: `+1 ${t.portal.stats.changes.thisMonth}`,
      icon: Home,
      color: "text-blue-600"
    },
    {
      title: t.portal.stats.occupancyRate,
      value: "87%",
      change: `+5% ${t.portal.stats.changes.vsLastMonth}`,
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      title: t.portal.stats.monthlyRevenue,
      value: "€4,250",
      change: `+12% ${t.portal.stats.changes.vsLastMonth}`,
      icon: Euro,
      color: "text-purple-600"
    },
    {
      title: t.portal.stats.activeBookings,
      value: "12",
      change: `3 ${t.portal.stats.changes.checkingInToday}`,
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const upcomingEvents = [
    {
      type: t.portal.upcomingEvents.types.checkIn,
      property: "Cascais Beach Apartment",
      guest: "Maria Silva",
      time: "15:00",
      date: "Today"
    },
    {
      type: t.portal.upcomingEvents.types.checkOut,
      property: "Porto City Center",
      guest: "John Smith",
      time: "11:00",
      date: "Tomorrow"
    },
    {
      type: t.portal.upcomingEvents.types.cleaning,
      property: "Lisbon Historic Loft",
      service: t.portal.upcomingEvents.services.deepClean,
      time: "14:00",
      date: "Jan 15"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.portal.welcome}, {user?.email}</h1>
            <p className="text-gray-600 mt-2">{t.portal.tagline}</p>
          </div>
          <Button onClick={signOut} variant="outline">
            {t.portal.signOut}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t.portal.tabs.overview}</TabsTrigger>
            <TabsTrigger value="calendar">{t.portal.tabs.calendar}</TabsTrigger>
            <TabsTrigger value="financial">{t.portal.tabs.financial}</TabsTrigger>
            <TabsTrigger value="properties">{t.portal.tabs.properties}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.portal.upcomingEvents.title}
                </CardTitle>
                <CardDescription>
                  {t.portal.upcomingEvents.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={
                          event.type === t.portal.upcomingEvents.types.checkIn ? "default" :
                          event.type === t.portal.upcomingEvents.types.checkOut ? "secondary" : "outline"
                        }>
                          {event.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{event.property}</p>
                          <p className="text-sm text-gray-600">
                            {event.guest || event.service} • {event.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialOverview selectedProperty={selectedProperty} />
          </TabsContent>

          <TabsContent value="properties">
            <PropertyList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portal;
