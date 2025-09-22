-- Create authors table for comprehensive author management
CREATE TABLE public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  profile_image_url TEXT,
  email TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on authors table
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Create policies for authors table
CREATE POLICY "Public can read authors" 
ON public.authors 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage authors" 
ON public.authors 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Add additional SEO and date fields to generated_content (only new columns)
ALTER TABLE public.generated_content 
ADD COLUMN IF NOT EXISTS date_published TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_modified TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update author_id to reference authors table
ALTER TABLE public.generated_content 
DROP CONSTRAINT IF EXISTS generated_content_author_id_fkey,
ADD CONSTRAINT generated_content_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.authors(id);

-- Create tags table for better tag management
CREATE TABLE public.content_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content_tags
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for content_tags
CREATE POLICY "Public can read content tags" 
ON public.content_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage content tags" 
ON public.content_tags 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create junction table for content-tag relationships
CREATE TABLE public.content_tag_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.generated_content(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_id, tag_id)
);

-- Enable RLS on content_tag_relations
ALTER TABLE public.content_tag_relations ENABLE ROW LEVEL SECURITY;

-- Create policies for content_tag_relations
CREATE POLICY "Public can read content tag relations" 
ON public.content_tag_relations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage content tag relations" 
ON public.content_tag_relations 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Insert default authors
INSERT INTO public.authors (name, slug, bio, profile_image_url) VALUES 
('Ana Martins', 'ana-martins', 'Alojamento Local legal expert with 10+ years experience in Portuguese property regulations', '/assets/team/ana-martins.jpg'),
('Miguel Ribeiro', 'miguel-ribeiro', 'Property management specialist and short-term rental consultant in the Algarve region', '/assets/team/miguel-ribeiro.jpg'),
('Sofia Mendes', 'sofia-mendes', 'Tourism industry analyst and vacation rental optimization expert', '/assets/team/sofia-mendes.jpg'),
('Carlos Ferreira', 'carlos-ferreira', 'Real estate investment advisor specializing in Portuguese coastal properties', '/assets/team/carlos-ferreira.jpg'),
('Patricia Garlini', 'patricia-garlini', 'International property law specialist with expertise in EU vacation rental regulations', '/assets/team/patricia-garlini.jpg');

-- Create function to automatically update modified date
CREATE OR REPLACE FUNCTION public.update_content_modified_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_modified = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic date updates
DROP TRIGGER IF EXISTS update_generated_content_modified_date ON public.generated_content;
CREATE TRIGGER update_generated_content_modified_date
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_modified_date();

-- Create function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Average reading speed is 200 words per minute
  RETURN GREATEST(1, CEIL(array_length(string_to_array(content_text, ' '), 1) / 200.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create view for enhanced content with author details
CREATE OR REPLACE VIEW public.content_with_author AS
SELECT 
  gc.*,
  a.name as author_name,
  a.slug as author_slug,
  a.bio as author_bio,
  a.profile_image_url as author_image
FROM public.generated_content gc
LEFT JOIN public.authors a ON gc.author_id = a.id;