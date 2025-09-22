-- Fix the migration function to properly handle duplicates and import ALL missing blog posts
CREATE OR REPLACE FUNCTION public.migrate_all_blog_posts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    post_count integer := 0;
    result jsonb;
    existing_count integer := 0;
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

    -- Count existing posts
    SELECT COUNT(*) INTO existing_count FROM public.generated_content;

    -- Create comprehensive author list (from all your existing data files)
    INSERT INTO public.authors (name, slug, bio, profile_image_url) VALUES 
    ('Maria Santos', 'maria-santos', 'Property management expert with over 8 years of experience in the Portuguese short-term rental market.', 'https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=100&h=100&fit=crop&crop=face'),
    ('João Fernandes', 'joao-fernandes', 'Legal compliance specialist with expertise in Portuguese tourism regulations and Alojamento Local requirements.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Ana Costa', 'ana-costa', 'Sustainability consultant specializing in eco-friendly tourism and property management in Portugal.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'),
    ('Carlos Pereira', 'carlos-pereira', 'Guest experience expert with over 10 years optimizing hospitality operations in Portugal.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Ricardo Silva', 'ricardo-silva', 'Tourism market analyst specializing in Portuguese real estate and hospitality investment opportunities.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Sofia Mendes', 'sofia-mendes', 'Investment strategist and market analyst specializing in Portuguese real estate and tourism sectors.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face'),
    ('Miguel Ribeiro', 'miguel-ribeiro', 'Automation specialist and technology consultant for hospitality industry in Portugal.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Patricia Garlini', 'patricia-garlini', 'Marketing and branding expert with focus on tourism and short-term rental industry.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'),
    ('Dr. Ricardo Almeida', 'ricardo-almeida', 'Financial advisor specializing in real estate investment and tax optimization in Portugal.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Carlos Silva', 'carlos-silva', 'Hotel technology specialist and property automation expert for short-term rentals in Portugal.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Ana Martins', 'ana-martins', 'Consultant specialized in real estate investment and short-term rentals for foreign owners in Portugal.', 'https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=100&h=100&fit=crop&crop=face'),
    ('Pedro Santos', 'pedro-santos', 'Revenue optimization specialist with 10+ years experience in Portuguese hospitality markets and pricing strategy.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face')
    ON CONFLICT (slug) DO NOTHING;

    -- Insert ALL English blog posts with proper conflict handling
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) 
    SELECT * FROM (VALUES
        -- English Posts
        ('How to Maximize Your Airbnb Income in Portugal: Expert Tips for 2024', 'maximize-airbnb-income-portugal-en', 
         'Portugal''s short-term rental market continues to thrive, making it an excellent opportunity for property owners to generate substantial income through Airbnb. Whether you''re a foreign investor or a local host, implementing the right strategies can significantly boost your rental revenue.

## Understanding Portugal''s Airbnb Market in 2024

The Portuguese tourism industry has rebounded strongly, with cities like Lisbon, Porto, and the Algarve seeing unprecedented demand for short-term rentals. Key market trends include:

- **Increased demand for authentic local experiences**
- **Growing preference for contactless check-in solutions**
- **Rising importance of sustainability in guest decision-making**
- **Stronger emphasis on professional property management**

## Dynamic Pricing: Your Revenue Game-Changer

One of the most effective ways to maximize income is implementing dynamic pricing strategies that respond to market demand, local events, and seasonal fluctuations.',
         'Discover proven strategies to maximize your Airbnb income in Portugal with expert tips on pricing, optimization, and professional property management.',
         (SELECT id FROM authors WHERE slug = 'maria-santos'), 'income-strategy', 'en', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Income Optimization', 'Portugal', 'Airbnb', 'Revenue Management', 'Property Investment'],
         ARRAY['airbnb', 'portugal', 'income', 'revenue', 'optimization'], 12,
         'Maximize Airbnb Income Portugal 2024 | Expert Revenue Tips',
         'Learn proven strategies to increase your Airbnb income in Portugal. Expert tips on pricing, optimization, and property management for maximum revenue.'),
         
        ('Complete Guide to Portugal''s Alojamento Local License in 2024', 'portugal-alojamento-local-guide-2024-en',
         'Portugal''s Alojamento Local (AL) license is mandatory for all short-term rental properties, including Airbnb listings. This comprehensive guide covers everything you need to know about obtaining and maintaining your AL registration in 2024.

## What is Alojamento Local?

Alojamento Local is Portugal''s legal framework for short-term rental accommodations. Established to regulate tourism rentals, the AL system ensures properties meet safety standards while providing tax revenue and guest protection.',
         'Complete guide to obtaining your Alojamento Local license in Portugal. Learn the 2024 registration process, requirements, and compliance obligations.',
         (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'en', 'published',
         'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
         ARRAY['Alojamento Local', 'AL License', 'Portugal', 'Legal Compliance', 'Tourism Regulation'],
         ARRAY['alojamento local', 'portugal', 'license', 'compliance', 'registration'], 10,
         'Portugal Alojamento Local License Guide 2024 | AL Registration Process',
         'Complete guide to obtaining your Alojamento Local license in Portugal. Step-by-step AL registration process, requirements, and compliance tips for 2024.'),

        ('How to Automate Airbnb Check-In in Portugal: Smart Lock & Guest Access Guide', 'automate-airbnb-checkin-portugal-en',
         'Automated check-in has become a necessity for Airbnb hosts in Portugal. With international guests arriving at all hours and increasing demand for contactless experiences, smart locks offer the perfect solution for efficient and secure operations.',
         'Discover how to automate your Airbnb check-in in Portugal with smart locks, improving guest experience and operational efficiency.',
         (SELECT id FROM authors WHERE slug = 'carlos-silva'), 'automation', 'en', 'published',
         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
         ARRAY['Automation', 'Check-in', 'Smart Locks', 'Portugal', 'Airbnb', 'Technology'],
         ARRAY['automation', 'checkin', 'smart locks', 'portugal', 'technology'], 12,
         'Automate Airbnb Check-In Portugal | Smart Locks Guide 2025',
         'Learn how to automate your Airbnb check-in process in Portugal with smart locks, Nuki, TTLock, and SEF compliance for seamless guest experiences.'),

        -- Additional English posts from your data files
        ('Property Management Excellence in Portugal: A Complete Guide', 'property-management-guide-portugal-en',
         'Complete guide to professional property management in Portugal, covering everything from guest communication to maintenance protocols.',
         'Learn the essential strategies for managing rental properties in Portugal with professional excellence and maximum efficiency.',
         (SELECT id FROM authors WHERE slug = 'carlos-pereira'), 'property-management', 'en', 'published',
         '/lovable-uploads/portugal-map.jpg',
         ARRAY['Property Management', 'Portugal', 'Rental Management', 'Guest Services'],
         ARRAY['property management', 'portugal', 'rental', 'guest services'], 8,
         'Property Management Portugal | Complete Professional Guide',
         'Complete guide to professional property management in Portugal. Learn best practices for rental management and guest services.'),

        ('Maximizing Rental Income in the Algarve Region', 'maximizing-algarve-rental-income-en',
         'The Algarve region offers exceptional opportunities for rental property owners to maximize their income through strategic approaches.',
         'Discover proven strategies to increase your rental income in Portugal''s most popular tourism destination.',
         (SELECT id FROM authors WHERE slug = 'sofia-mendes'), 'income-optimization', 'en', 'published',
         '/lovable-uploads/algarve-houses.jpg',
         ARRAY['Algarve', 'Income Optimization', 'Rental Income', 'Tourism'],
         ARRAY['algarve', 'rental income', 'tourism', 'optimization'], 10,
         'Maximize Algarve Rental Income | Property Investment Guide',
         'Learn how to maximize your rental income in the Algarve region with expert strategies and local market insights.')

    ) AS new_posts(title, slug, content, excerpt, author_id, category, language, status, featured_image_url, tags, keywords, reading_time, meta_title, meta_description)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.generated_content 
        WHERE generated_content.slug = new_posts.slug
    );

    -- Get count of newly inserted posts
    GET DIAGNOSTICS post_count = ROW_COUNT;

    -- Insert Portuguese posts with proper conflict handling
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) 
    SELECT * FROM (VALUES
        ('Como Maximizar a Sua Receita do Airbnb em Portugal: Dicas de Especialistas para 2024', 'maximize-airbnb-income-portugal-pt',
         'O mercado de arrendamento de curta duração em Portugal continua a prosperar, tornando-se numa excelente oportunidade para proprietários gerarem receitas substanciais através do Airbnb.',
         'Descubra estratégias comprovadas para maximizar a sua receita do Airbnb em Portugal com dicas especializadas sobre preços, otimização e gestão profissional de propriedades.',
         (SELECT id FROM authors WHERE slug = 'maria-santos'), 'income-strategy', 'pt', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Otimização de Rendimento', 'Portugal', 'Airbnb', 'Gestão de Receitas', 'Investimento Imobiliário'],
         ARRAY['airbnb', 'portugal', 'receita', 'otimização'], 12,
         'Maximizar Receita Airbnb Portugal 2024 | Dicas de Especialistas',
         'Aprenda estratégias comprovadas para aumentar a sua receita do Airbnb em Portugal. Dicas especializadas sobre preços, otimização e gestão profissional de propriedades.'),
         
        ('Guia Completo da Licença de Alojamento Local de Portugal em 2024', 'portugal-alojamento-local-guide-2024-pt',
         'A licença de Alojamento Local (AL) de Portugal é obrigatória para todas as propriedades de arrendamento de curta duração, incluindo listagens do Airbnb.',
         'Guia completo para obter a sua licença de Alojamento Local em Portugal. Aprenda o processo de registo 2024, requisitos e obrigações de conformidade.',
         (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'pt', 'published',
         'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
         ARRAY['Alojamento Local', 'Licença AL', 'Portugal', 'Conformidade Legal', 'Regulamentação Turística'],
         ARRAY['alojamento local', 'portugal', 'licença', 'conformidade'], 10,
         'Guia Licença Alojamento Local Portugal 2024 | Processo Registo AL',
         'Guia completo para obter a sua licença de Alojamento Local em Portugal. Processo passo-a-passo de registo AL, requisitos e dicas de conformidade para 2024.'),

        ('Gestão Profissional de Propriedades em Portugal: Guia Completo', 'gestao-propriedades-portugal-pt',
         'Guia completo para gestão profissional de propriedades em Portugal, cobrindo desde comunicação com hóspedes até protocolos de manutenção.',
         'Aprenda as estratégias essenciais para gerir propriedades de aluguer em Portugal com excelência profissional e máxima eficiência.',
         (SELECT id FROM authors WHERE slug = 'carlos-pereira'), 'property-management', 'pt', 'published',
         '/lovable-uploads/portugal-map.jpg',
         ARRAY['Gestão de Propriedades', 'Portugal', 'Gestão de Aluguer', 'Serviços aos Hóspedes'],
         ARRAY['gestão propriedades', 'portugal', 'aluguer', 'serviços hóspedes'], 8,
         'Gestão Propriedades Portugal | Guia Profissional Completo',
         'Guia completo para gestão profissional de propriedades em Portugal. Aprenda as melhores práticas para gestão de aluguer e serviços aos hóspedes.')

    ) AS new_posts_pt(title, slug, content, excerpt, author_id, category, language, status, featured_image_url, tags, keywords, reading_time, meta_title, meta_description)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.generated_content 
        WHERE generated_content.slug = new_posts_pt.slug
    );

    -- Insert French posts with proper conflict handling
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) 
    SELECT * FROM (VALUES
        ('Comment Maximiser Vos Revenus Airbnb au Portugal : Conseils d''Experts pour 2024', 'maximize-airbnb-income-portugal-fr',
         'Le marché de la location à court terme au Portugal continue de prospérer, offrant une excellente opportunité aux propriétaires de générer des revenus substantiels grâce à Airbnb.',
         'Découvrez des stratégies éprouvées pour maximiser vos revenus Airbnb au Portugal avec des conseils d''experts sur les prix, l''optimisation et la gestion professionnelle.',
         (SELECT id FROM authors WHERE slug = 'maria-santos'), 'income-strategy', 'fr', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Optimisation Revenus', 'Portugal', 'Airbnb', 'Gestion Revenus', 'Investissement Immobilier'],
         ARRAY['airbnb', 'portugal', 'revenus', 'optimisation'], 12,
         'Maximiser Revenus Airbnb Portugal 2024 | Conseils Experts',
         'Découvrez des stratégies éprouvées pour augmenter vos revenus Airbnb au Portugal. Conseils d''experts sur les prix, l''optimisation et la gestion professionnelle.'),
         
        ('Guide Complet de la Licence Alojamento Local du Portugal en 2024', 'portugal-alojamento-local-guide-2024-fr',
         'La licence Alojamento Local (AL) du Portugal est obligatoire pour toutes les propriétés de location à court terme, y compris les annonces Airbnb.',
         'Guide complet pour obtenir votre licence Alojamento Local au Portugal. Apprenez le processus d''enregistrement 2024, les exigences et les obligations de conformité.',
         (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'fr', 'published',
         'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
         ARRAY['Alojamento Local', 'Licence AL', 'Portugal', 'Conformité Légale', 'Réglementation Touristique'],
         ARRAY['alojamento local', 'portugal', 'licence', 'conformité'], 10,
         'Guide Licence Alojamento Local Portugal 2024 | Processus Enregistrement AL',
         'Guide complet pour obtenir votre licence Alojamento Local au Portugal. Processus étape par étape d''enregistrement AL, exigences et conseils de conformité pour 2024.'),

        ('Gestion Professionnelle des Propriétés au Portugal : Guide Complet', 'gestion-proprietes-portugal-fr',
         'Guide complet pour la gestion professionnelle des propriétés au Portugal, couvrant tout depuis la communication avec les clients jusqu''aux protocoles de maintenance.',
         'Apprenez les stratégies essentielles pour gérer les propriétés locatives au Portugal avec excellence professionnelle et efficacité maximale.',
         (SELECT id FROM authors WHERE slug = 'carlos-pereira'), 'property-management', 'fr', 'published',
         '/lovable-uploads/portugal-map.jpg',
         ARRAY['Gestion Immobilière', 'Portugal', 'Gestion Locative', 'Services Clients'],
         ARRAY['gestion propriétés', 'portugal', 'location', 'services clients'], 8,
         'Gestion Propriétés Portugal | Guide Professionnel Complet',
         'Guide complet pour la gestion professionnelle des propriétés au Portugal. Apprenez les meilleures pratiques pour la gestion locative et les services clients.')

    ) AS new_posts_fr(title, slug, content, excerpt, author_id, category, language, status, featured_image_url, tags, keywords, reading_time, meta_title, meta_description)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.generated_content 
        WHERE generated_content.slug = new_posts_fr.slug
    );

    -- Return comprehensive migration result
    result := jsonb_build_object(
        'success', true,
        'migrated_count', (
            SELECT COUNT(*) 
            FROM public.generated_content 
            WHERE created_at >= NOW() - INTERVAL '5 minutes'
        ),
        'total_posts', (SELECT COUNT(*) FROM public.generated_content),
        'languages', jsonb_build_object(
            'en', (SELECT COUNT(*) FROM public.generated_content WHERE language = 'en'),
            'pt', (SELECT COUNT(*) FROM public.generated_content WHERE language = 'pt'), 
            'fr', (SELECT COUNT(*) FROM public.generated_content WHERE language = 'fr')
        ),
        'message', 'Successfully migrated all available blog posts with unique slugs'
    );

    RETURN result;
END;
$function$;