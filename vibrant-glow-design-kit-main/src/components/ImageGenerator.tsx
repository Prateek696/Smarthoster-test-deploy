
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ImageGeneratorProps {
  onImagesGenerated: (images: string[]) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImagesGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImages = async () => {
    setIsGenerating(true);
    
    const prompts = [
      "Luxury beachfront villa in Algarve Portugal with white walls, terracotta roof, ocean view, Mediterranean architecture, sunset lighting",
      "Modern beachfront villa in Algarve with infinity pool overlooking the Atlantic Ocean, contemporary design, golden hour",
      "Traditional Portuguese villa by the beach in Algarve with blue shutters, garden, ocean backdrop, coastal charm",
      "Elegant beachfront property in Algarve Portugal with terrace, palm trees, turquoise ocean, luxury resort style"
    ];

    try {
      const imagePromises = prompts.map(async (prompt) => {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY || 'demo-key'}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to generate image: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].url;
      });

      const generatedImages = await Promise.all(imagePromises);
      onImagesGenerated(generatedImages);
      
      toast({
        title: "Images Generated",
        description: "4 beachfront villa images have been generated successfully!",
      });
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Generation Failed",
        description: "Using placeholder images instead. Please check your API configuration.",
        variant: "destructive",
      });
      
      // Fallback to high-quality Unsplash images of Algarve villas
      const fallbackImages = [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      ];
      onImagesGenerated(fallbackImages);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateImages} 
      disabled={isGenerating}
      className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Images...
        </>
      ) : (
        "Generate Villa Images"
      )}
    </Button>
  );
};

export default ImageGenerator;
