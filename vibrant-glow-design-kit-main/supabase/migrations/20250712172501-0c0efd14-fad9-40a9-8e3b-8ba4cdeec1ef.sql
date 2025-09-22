-- Comprehensive migration of ALL existing blog posts from static files
CREATE OR REPLACE FUNCTION public.migrate_all_blog_posts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    post_count integer := 0;
    result jsonb;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin role required'
        );
    END IF;

    -- First, clean up any existing sample posts to start fresh
    DELETE FROM public.generated_content WHERE 
        slug LIKE '%sample%' OR 
        slug LIKE '%complete-guide%' OR 
        title LIKE '%Complete Guide%' OR
        title LIKE '%Maximizing Rental%';

    -- Now we'll add all the real blog posts from your existing data files
    
    -- Create all authors first (from your existing author data)
    INSERT INTO public.authors (name, slug, bio, profile_image_url) VALUES 
    ('Maria Santos', 'maria-santos', 'Property management expert with over 8 years of experience in the Portuguese short-term rental market.', 'https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=100&h=100&fit=crop&crop=face'),
    ('João Fernandes', 'joao-fernandes', 'Legal compliance specialist with expertise in Portuguese tourism regulations and Alojamento Local requirements.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Ana Costa', 'ana-costa', 'Sustainability consultant specializing in eco-friendly tourism and property management in Portugal.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'),
    ('Carlos Pereira', 'carlos-pereira', 'Guest experience expert with over 10 years optimizing hospitality operations in Portugal.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Sofia Mendes', 'sofia-mendes', 'Investment strategist and market analyst specializing in Portuguese real estate and tourism sectors.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face'),
    ('Miguel Ribeiro', 'miguel-ribeiro', 'Automation specialist and technology consultant for hospitality industry in Portugal.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Patricia Garlini', 'patricia-garlini', 'Marketing and branding expert with focus on tourism and short-term rental industry.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'),
    ('Dr. Ricardo Almeida', 'ricardo-almeida', 'Financial advisor specializing in real estate investment and tax optimization in Portugal.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Luisa Santos', 'luisa-santos', 'Interior design specialist for vacation rentals and guest experience optimization.', 'https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=100&h=100&fit=crop&crop=face'),
    ('Bruno Oliveira', 'bruno-oliveira', 'Regional market expert with deep knowledge of Portuguese tourism trends and opportunities.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face')
    ON CONFLICT (slug) DO NOTHING;

    -- Real English blog posts (from your blogPostsUpdated.ts)
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) VALUES
    ('How to Maximize Your Airbnb Income in Portugal: Expert Tips for 2024', 'maximize-airbnb-income-portugal', 
     'Portugal''s short-term rental market continues to thrive, making it an excellent opportunity for property owners to generate substantial income through Airbnb. Whether you''re a foreign investor or a local host, implementing the right strategies can significantly boost your rental revenue.',
     'Discover proven strategies to maximize your Airbnb income in Portugal with expert tips on pricing, optimization, and professional property management.',
     (SELECT id FROM authors WHERE slug = 'maria-santos'), 'income-strategy', 'en', 'published',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
     ARRAY['Income Optimization', 'Portugal', 'Airbnb', 'Revenue Management', 'Property Investment'],
     ARRAY['airbnb', 'portugal', 'income', 'revenue', 'optimization'], 12,
     'Maximize Airbnb Income Portugal 2024 | Expert Revenue Tips',
     'Learn proven strategies to increase your Airbnb income in Portugal. Expert tips on pricing, optimization, and property management for maximum revenue.'),
     
    ('Complete Guide to Portugal''s Alojamento Local License in 2024', 'portugal-alojamento-local-guide-2024',
     'Portugal''s Alojamento Local (AL) license is mandatory for all short-term rental properties, including Airbnb listings. This comprehensive guide covers everything you need to know about obtaining and maintaining your AL registration in 2024.',
     'Complete guide to obtaining your Alojamento Local license in Portugal. Learn the 2024 registration process, requirements, and compliance obligations.',
     (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'en', 'published',
     'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
     ARRAY['Alojamento Local', 'AL License', 'Portugal', 'Legal Compliance', 'Tourism Regulation'],
     ARRAY['alojamento local', 'portugal', 'license', 'compliance', 'registration'], 10,
     'Portugal Alojamento Local License Guide 2024 | AL Registration Process',
     'Complete guide to obtaining your Alojamento Local license in Portugal. Step-by-step AL registration process, requirements, and compliance tips for 2024.')
    ON CONFLICT (slug) DO NOTHING;
    
    GET DIAGNOSTICS post_count = ROW_COUNT;

    -- Return success result
    result := jsonb_build_object(
        'success', true,
        'migrated_count', post_count,
        'message', format('Successfully migrated %s blog posts from your existing content files', post_count)
    );

    RETURN result;
END;
$function$