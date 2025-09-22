-- Fix the migration function by properly handling JSON access
CREATE OR REPLACE FUNCTION public.migrate_blog_posts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    blog_data jsonb;
    post_record jsonb;
    author_data jsonb;
    author_id uuid;
    author_slug text;
    content_slug text;
    existing_post_id uuid;
    migrated_count integer := 0;
    total_count integer := 0;
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

    -- Sample blog post data (this would contain all your posts)
    blog_data := '[
        {
            "title": "Complete Guide to Property Management in Portugal",
            "slug": "complete-guide-property-management-portugal",
            "content": "Portugal has become one of Europe''s most attractive destinations for property investment. With its favorable climate, growing tourism industry, and increasing demand for rental properties, investing in Portuguese real estate offers tremendous opportunities for property owners and investors alike.",
            "excerpt": "Everything you need to know about managing properties in Portugal",
            "author": {"name": "Carlos Ferreira"},
            "category": "property-management",
            "tags": ["portugal", "property", "management"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map.jpg"
        },
        {
            "title": "Maximizing Rental Income in the Algarve",
            "slug": "maximizing-rental-income-algarve",
            "content": "The Algarve region offers exceptional opportunities for rental property owners to maximize their income through strategic property management and marketing approaches.",
            "excerpt": "Strategies to increase your rental property income in Portugal''s most popular region",
            "author": {"name": "Sofia Mendes"},
            "category": "income-optimization",
            "tags": ["algarve", "rental", "income"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-houses.jpg"
        },
        {
            "title": "Legal Requirements for Short-Term Rentals",
            "slug": "legal-requirements-short-term-rentals",
            "content": "Understanding the legal landscape for short-term rentals in Portugal is crucial for property owners who want to operate legally and avoid potential issues.",
            "excerpt": "Navigate the legal requirements for operating short-term rentals in Portugal",
            "author": {"name": "Patricia Garlini"},
            "category": "legal-compliance",
            "tags": ["legal", "compliance", "short-term"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map-clean.png"
        },
        {
            "title": "Automation Tools for Property Management",
            "slug": "automation-tools-property-management",
            "content": "Modern property management requires efficient automation tools to streamline operations and improve guest experiences.",
            "excerpt": "Discover the best automation tools for managing your rental properties",
            "author": {"name": "Miguel Ribeiro"},
            "category": "automation",
            "tags": ["automation", "tools", "efficiency"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map-pins.jpg"
        },
        {
            "title": "Guest Communication Best Practices",
            "slug": "guest-communication-best-practices",
            "content": "Effective guest communication is essential for successful property management and maintaining high satisfaction rates.",
            "excerpt": "Learn how to communicate effectively with your rental guests",
            "author": {"name": "Zara Alam"},
            "category": "guest-management",
            "tags": ["communication", "guests", "service"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-villa-pool.jpg"
        }
    ]'::jsonb;

    -- Count total posts
    SELECT jsonb_array_length(blog_data) INTO total_count;

    -- Process each blog post
    FOR post_record IN SELECT * FROM jsonb_array_elements(blog_data)
    LOOP
        -- Extract author data properly
        author_data := post_record->'author';
        
        -- Create or get author
        author_slug := lower(replace(trim(author_data->>'name'), ' ', '-'));
        
        -- Check if author exists
        SELECT id INTO author_id
        FROM public.authors
        WHERE slug = author_slug;
        
        -- Create author if not exists
        IF author_id IS NULL THEN
            INSERT INTO public.authors (name, slug, bio)
            VALUES (
                author_data->>'name',
                author_slug,
                'Professional content author at SmartHoster'
            )
            RETURNING id INTO author_id;
        END IF;

        -- Create unique slug for content
        content_slug := post_record->>'slug';
        IF post_record->>'language' != 'en' THEN
            content_slug := content_slug || '-' || (post_record->>'language');
        END IF;

        -- Check if post already exists
        SELECT id INTO existing_post_id
        FROM public.generated_content
        WHERE slug = content_slug;

        -- Insert post if it doesn't exist
        IF existing_post_id IS NULL THEN
            INSERT INTO public.generated_content (
                title,
                slug,
                content,
                excerpt,
                author_id,
                category,
                language,
                status,
                featured_image_url,
                tags,
                keywords,
                reading_time,
                meta_title,
                meta_description
            ) VALUES (
                post_record->>'title',
                content_slug,
                post_record->>'content',
                post_record->>'excerpt',
                author_id,
                post_record->>'category',
                COALESCE(post_record->>'language', 'en'),
                'published',
                post_record->>'featuredImage',
                ARRAY(SELECT jsonb_array_elements_text(COALESCE(post_record->'tags', '[]'::jsonb))),
                ARRAY(SELECT jsonb_array_elements_text(COALESCE(post_record->'tags', '[]'::jsonb))),
                GREATEST(1, CEIL(array_length(string_to_array(post_record->>'content', ' '), 1) / 200.0)),
                post_record->>'title',
                post_record->>'excerpt'
            );
            
            migrated_count := migrated_count + 1;
        END IF;
    END LOOP;

    -- Return success result
    result := jsonb_build_object(
        'success', true,
        'migrated_count', migrated_count,
        'total_count', total_count,
        'message', format('Successfully migrated %s out of %s blog posts', migrated_count, total_count)
    );

    RETURN result;
END;
$function$