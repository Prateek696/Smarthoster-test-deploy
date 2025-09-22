-- Expand migration function with more comprehensive blog posts
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

    -- Comprehensive blog post data with multiple languages
    blog_data := '[
        {
            "title": "Complete Guide to Property Management in Portugal",
            "slug": "complete-guide-property-management-portugal",
            "content": "Portugal has become one of Europe''s most attractive destinations for property investment. With its favorable climate, growing tourism industry, and increasing demand for rental properties, investing in Portuguese real estate offers tremendous opportunities for property owners and investors alike. This comprehensive guide covers everything from legal requirements to maximizing your rental income through strategic property management approaches.",
            "excerpt": "Everything you need to know about managing properties in Portugal",
            "author": {"name": "Carlos Ferreira"},
            "category": "property-management",
            "tags": ["portugal", "property", "management", "investment"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map.jpg"
        },
        {
            "title": "Maximizing Rental Income in the Algarve",
            "slug": "maximizing-rental-income-algarve",
            "content": "The Algarve region offers exceptional opportunities for rental property owners to maximize their income through strategic property management and marketing approaches. Learn the best practices for pricing, marketing, and guest experience optimization.",
            "excerpt": "Strategies to increase your rental property income in Portugal''s most popular region",
            "author": {"name": "Sofia Mendes"},
            "category": "income-optimization",
            "tags": ["algarve", "rental", "income", "optimization"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-houses.jpg"
        },
        {
            "title": "Legal Requirements for Short-Term Rentals",
            "slug": "legal-requirements-short-term-rentals",
            "content": "Understanding the legal landscape for short-term rentals in Portugal is crucial for property owners who want to operate legally and avoid potential issues. This guide covers licensing, tax obligations, and compliance requirements.",
            "excerpt": "Navigate the legal requirements for operating short-term rentals in Portugal",
            "author": {"name": "Patricia Garlini"},
            "category": "legal-compliance",
            "tags": ["legal", "compliance", "short-term", "licensing"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map-clean.png"
        },
        {
            "title": "Automation Tools for Property Management",
            "slug": "automation-tools-property-management",
            "content": "Modern property management requires efficient automation tools to streamline operations and improve guest experiences. Discover the latest technology solutions for managing your rental properties effectively.",
            "excerpt": "Discover the best automation tools for managing your rental properties",
            "author": {"name": "Miguel Ribeiro"},
            "category": "automation",
            "tags": ["automation", "tools", "efficiency", "technology"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map-pins.jpg"
        },
        {
            "title": "Guest Communication Best Practices",
            "slug": "guest-communication-best-practices",
            "content": "Effective guest communication is essential for successful property management and maintaining high satisfaction rates. Learn how to create memorable experiences through proper communication strategies.",
            "excerpt": "Learn how to communicate effectively with your rental guests",
            "author": {"name": "Zara Alam"},
            "category": "guest-management",
            "tags": ["communication", "guests", "service", "experience"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-villa-pool.jpg"
        },
        {
            "title": "SEF Registration and AIMA Compliance for Hosts",
            "slug": "sef-registration-aima-compliance-hosts",
            "content": "Understanding SEF registration requirements and AIMA compliance is crucial for property hosts in Portugal. This comprehensive guide covers all the necessary steps and documentation required.",
            "excerpt": "Complete guide to SEF and AIMA requirements for Portuguese rental properties",
            "author": {"name": "José Raimundo"},
            "category": "legal-compliance",
            "tags": ["sef", "aima", "compliance", "registration"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map.jpg"
        },
        {
            "title": "Smart Home Technology for Rentals",
            "slug": "smart-home-technology-rentals",
            "content": "Implementing smart home technology in your rental properties can significantly improve guest satisfaction and operational efficiency. Learn about the best smart devices and systems for rental properties.",
            "excerpt": "How smart home technology can transform your rental property business",
            "author": {"name": "Shubanshu"},
            "category": "automation",
            "tags": ["smart-home", "technology", "automation", "iot"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map-pins.jpg"
        },
        {
            "title": "Pricing Strategies for Maximum Occupancy",
            "slug": "pricing-strategies-maximum-occupancy",
            "content": "Developing effective pricing strategies is key to maximizing both occupancy rates and revenue. Learn dynamic pricing techniques and market analysis methods for optimal results.",
            "excerpt": "Master the art of pricing your rental properties for maximum profitability",
            "author": {"name": "Adolfo Ferreira"},
            "category": "income-optimization",
            "tags": ["pricing", "revenue", "occupancy", "strategy"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-houses.jpg"
        },
        {
            "title": "Tax Optimization for Portuguese Property Owners",
            "slug": "tax-optimization-portuguese-property-owners",
            "content": "Understanding the Portuguese tax system and available deductions can significantly impact your property investment returns. This guide covers all aspects of property taxation in Portugal.",
            "excerpt": "Comprehensive guide to property taxes and optimization strategies in Portugal",
            "author": {"name": "Carlos Ferreira"},
            "category": "financial-planning",
            "tags": ["taxes", "optimization", "deductions", "finance"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map-clean.png"
        },
        {
            "title": "Building Your Property Portfolio in Portugal",
            "slug": "building-property-portfolio-portugal",
            "content": "Strategic property portfolio development requires careful planning and market knowledge. Learn how to scale your property investments effectively in the Portuguese market.",
            "excerpt": "Step-by-step guide to building a successful property portfolio in Portugal",
            "author": {"name": "Sofia Mendes"},
            "category": "investment-strategy",
            "tags": ["portfolio", "investment", "scaling", "strategy"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-villa-pool.jpg"
        },
        {
            "title": "Seasonal Marketing Strategies for Algarve Properties",
            "slug": "seasonal-marketing-strategies-algarve",
            "content": "The Algarve''s seasonal tourism patterns require adaptive marketing strategies throughout the year. Learn how to optimize your marketing efforts for each season.",
            "excerpt": "Maximize bookings year-round with strategic seasonal marketing",
            "author": {"name": "Patricia Garlini"},
            "category": "marketing",
            "tags": ["marketing", "seasonal", "algarve", "tourism"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-houses.jpg"
        },
        {
            "title": "Emergency Management for Rental Properties",
            "slug": "emergency-management-rental-properties",
            "content": "Proper emergency preparedness and response procedures are essential for rental property management. Learn how to handle various emergency situations effectively.",
            "excerpt": "Essential emergency management procedures for property hosts",
            "author": {"name": "Miguel Ribeiro"},
            "category": "property-management",
            "tags": ["emergency", "safety", "procedures", "management"],
            "language": "en",
            "featuredImage": "/lovable-uploads/portugal-map.jpg"
        },
        {
            "title": "Sustainable Tourism and Green Practices",
            "slug": "sustainable-tourism-green-practices",
            "content": "Implementing sustainable and eco-friendly practices in your rental properties not only benefits the environment but also attracts environmentally conscious guests.",
            "excerpt": "How to implement green practices in your rental property business",
            "author": {"name": "Zara Alam"},
            "category": "sustainability",
            "tags": ["sustainability", "eco-friendly", "green", "tourism"],
            "language": "en",
            "featuredImage": "/lovable-uploads/algarve-villa-pool.jpg"
        },
        {
            "title": "Guia Completo de Gestão de Propriedades em Portugal",
            "slug": "guia-completo-gestao-propriedades-portugal",
            "content": "Portugal tornou-se um dos destinos mais atrativos da Europa para investimento imobiliário. Com o seu clima favorável, indústria turística em crescimento e procura crescente por propriedades de aluguer, investir em imobiliário português oferece tremendas oportunidades.",
            "excerpt": "Tudo o que precisa de saber sobre gestão de propriedades em Portugal",
            "author": {"name": "Carlos Ferreira"},
            "category": "property-management",
            "tags": ["portugal", "propriedade", "gestão", "investimento"],
            "language": "pt",
            "featuredImage": "/lovable-uploads/portugal-map.jpg"
        },
        {
            "title": "Maximização de Rendimento no Algarve",
            "slug": "maximizacao-rendimento-algarve",
            "content": "A região do Algarve oferece oportunidades excecionais para proprietários maximizarem os seus rendimentos através de abordagens estratégicas de gestão e marketing de propriedades.",
            "excerpt": "Estratégias para aumentar o rendimento das suas propriedades na região mais popular de Portugal",
            "author": {"name": "Sofia Mendes"},
            "category": "income-optimization",
            "tags": ["algarve", "aluguer", "rendimento", "otimização"],
            "language": "pt",
            "featuredImage": "/lovable-uploads/algarve-houses.jpg"
        },
        {
            "title": "Guide Complet de Gestion Immobilière au Portugal",
            "slug": "guide-complet-gestion-immobiliere-portugal",
            "content": "Le Portugal est devenu l''une des destinations les plus attrayantes d''Europe pour l''investissement immobilier. Avec son climat favorable, son industrie touristique en croissance et sa demande croissante de propriétés locatives.",
            "excerpt": "Tout ce que vous devez savoir sur la gestion immobilière au Portugal",
            "author": {"name": "Carlos Ferreira"},
            "category": "property-management",
            "tags": ["portugal", "propriété", "gestion", "investissement"],
            "language": "fr",
            "featuredImage": "/lovable-uploads/portugal-map.jpg"
        },
        {
            "title": "Maximiser les Revenus Locatifs en Algarve",
            "slug": "maximiser-revenus-locatifs-algarve",
            "content": "La région de l''Algarve offre des opportunités exceptionnelles aux propriétaires pour maximiser leurs revenus grâce à des approches stratégiques de gestion et de marketing immobilier.",
            "excerpt": "Stratégies pour augmenter vos revenus locatifs dans la région la plus populaire du Portugal",
            "author": {"name": "Sofia Mendes"},
            "category": "income-optimization",
            "tags": ["algarve", "location", "revenus", "optimisation"],
            "language": "fr",
            "featuredImage": "/lovable-uploads/algarve-houses.jpg"
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