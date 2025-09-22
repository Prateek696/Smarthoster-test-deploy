
import { TrendingUp, Users, Home, DollarSign } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: Home,
      number: "10,000+",
      label: "Properties Managed",
      color: "#00CFFF"
    },
    {
      icon: Users,
      number: "500K+",
      label: "Happy Guests",
      color: "#5FFF56"
    },
    {
      icon: DollarSign,
      number: "$50M+",
      label: "Revenue Generated",
      color: "#00CFFF"
    },
    {
      icon: TrendingUp,
      number: "35%",
      label: "Average Revenue Increase",
      color: "#5FFF56"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful property owners who trust us with their most valuable investments
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2"
                style={{ 
                  backgroundColor: `${stat.color}10`,
                  borderColor: `${stat.color}30`
                }}
              >
                <stat.icon 
                  className="h-10 w-10" 
                  style={{ color: stat.color }}
                />
              </div>
              
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              
              <div className="text-gray-600 text-lg font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
