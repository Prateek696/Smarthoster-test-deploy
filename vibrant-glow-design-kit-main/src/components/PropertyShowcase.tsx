
import { Star, MapPin, Wifi, Car, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const PropertyShowcase = () => {
  const properties = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Modern Beachfront Villa",
      location: "Miami Beach, FL",
      rating: 4.9,
      reviews: 127,
      price: 299,
      amenities: ["WiFi", "Parking", "Coffee"]
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Urban Luxury Apartment",
      location: "Manhattan, NY",
      rating: 4.8,
      reviews: 89,
      price: 450,
      amenities: ["WiFi", "Parking", "Coffee"]
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Cozy Mountain Cabin",
      location: "Aspen, CO",
      rating: 4.9,
      reviews: 203,
      price: 180,
      amenities: ["WiFi", "Parking", "Coffee"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Featured Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover some of our most successful properties managed through our platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property, index) => (
            <div 
              key={property.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center text-sm font-semibold">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    {property.rating}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#5FFF56] transition-colors">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-[#00CFFF]" />
                    <Car className="h-4 w-4 text-[#00CFFF]" />
                    <Coffee className="h-4 w-4 text-[#00CFFF]" />
                  </div>
                  <span className="text-sm text-gray-500">{property.reviews} reviews</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#5FFF56]">${property.price}</span>
                    <span className="text-gray-500 ml-1">/ night</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#00CFFF] text-[#00CFFF] hover:bg-[#00CFFF] hover:text-white transition-all duration-300"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
