
import { TrendingUp, Users, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const SuccessStories = () => {
  const { t } = useLanguage();
  const [joaoVillaImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  ]);
  
  const stories = t.successStories.stories.map((story, index) => ({
    ...story,
    image: index === 0 ? joaoVillaImages[0] : 
           index === 1 ? "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" :
           "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    ownerImage: index === 0 ? "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" :
                index === 1 ? "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" :
                "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    results: story.results.map((result, resultIndex) => ({
      ...result,
      icon: [TrendingUp, Calendar, Users, Award][resultIndex]
    })),
    supportingImages: index === 0 ? joaoVillaImages :
                     index === 1 ? [
                       "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                       "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                       "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                     ] : [
                       "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                       "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                       "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                     ]
  }));

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#5FFF56]/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#00CFFF]/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 tracking-tight">
            {t.successStories.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            {t.successStories.description}
          </p>
        </div>
        
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {stories.map((story, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 lg:p-8 border border-gray-200/50 hover:shadow-2xl transition-all duration-500 animate-fade-in group hover:-translate-y-1">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left - Story Content */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        {story.ownerImage && (
                          <img 
                            src={story.ownerImage} 
                            alt={story.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#00CFFF]/20"
                          />
                        )}
                        <div>
                          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                            {story.name}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            {story.property} • {story.location}
                          </p>
                        </div>
                      </div>
                      
                      {/* Results Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {story.results.map((result, resultIndex) => (
                          <div key={resultIndex} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-lg flex items-center justify-center mr-3">
                                <result.icon className="h-4 w-4 text-[#00CFFF]" />
                              </div>
                              <span className="text-xs text-gray-600 font-medium">{result.label}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">{result.value}</div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                        "{story.story}"
                      </p>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold px-6 py-2 text-sm rounded-xl transition-all duration-300 transform hover:scale-105">
                            {t.successStories.readFullStory}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
                              {story.name} - {story.property}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Owner info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                              {story.ownerImage && (
                                <img 
                                  src={story.ownerImage} 
                                  alt={story.name}
                                  className="w-20 h-20 rounded-full object-cover border-2 border-[#00CFFF]/20"
                                />
                              )}
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                                <p className="text-gray-600">{story.property} • {story.location}</p>
                              </div>
                            </div>

                            {/* Results */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {story.results.map((result, resultIndex) => (
                                <div key={resultIndex} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <result.icon className="h-5 w-5 text-[#00CFFF]" />
                                  </div>
                                  <div className="text-lg font-bold text-gray-900 mb-1">{result.value}</div>
                                  <div className="text-xs text-gray-600">{result.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* Full story */}
                            <div className="prose prose-gray max-w-none">
                              {story.fullStory.split('\n\n').map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-gray-700 leading-relaxed mb-4 text-base">
                                  "{paragraph}"
                                </p>
                              ))}
                            </div>

                            {/* Supporting images */}
                            {story.supportingImages && (
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">{t.successStories.propertyGallery}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {story.supportingImages.map((img, imgIndex) => (
                                    <img 
                                      key={imgIndex}
                                      src={img} 
                                      alt={`${story.property} - Image ${imgIndex + 1}`}
                                      className="w-full h-48 object-cover rounded-xl shadow-sm"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Right - Property Image */}
                    <div className="relative">
                      <img 
                        src={story.image} 
                        alt={story.property}
                        className="w-full h-64 lg:h-80 object-cover rounded-2xl shadow-lg"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                        <div className="text-lg font-bold text-[#5FFF56]">{t.successStories.successBadge}</div>
                        <div className="text-xs text-gray-600">{t.successStories.caseStudy}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default SuccessStories;
