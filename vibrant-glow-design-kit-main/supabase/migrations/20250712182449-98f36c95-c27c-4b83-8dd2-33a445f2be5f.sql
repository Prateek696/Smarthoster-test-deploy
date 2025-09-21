-- Create comprehensive blog post migration with ALL content from data files
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
    ('Pedro Santos', 'pedro-santos', 'Revenue optimization specialist with 10+ years experience in Portuguese hospitality markets and pricing strategy.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Carlos Ferreira', 'carlos-ferreira', 'Senior property management consultant with extensive experience in Portuguese tourism sector.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('José Raimundo', 'jose-raimundo', 'Legal and compliance expert specializing in Portuguese property law and SEF registration.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Shubanshu', 'shubanshu', 'Technology innovation specialist focusing on smart home solutions for hospitality industry.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('Adolfo Ferreira', 'adolfo-ferreira', 'Revenue management and pricing strategy expert for Portuguese short-term rental market.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('Zara Alam', 'zara-alam', 'Guest experience and hospitality operations specialist with focus on sustainable tourism.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face')
    ON CONFLICT (slug) DO NOTHING;

    -- Insert ALL English blog posts from all data files
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) 
    SELECT * FROM (VALUES
        -- Core English Posts
        ('How to Maximize Your Airbnb Income in Portugal: Expert Tips for 2024', 'maximize-airbnb-income-portugal-2024', 
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
         
        ('Complete Guide to Portugal''s Alojamento Local License in 2024', 'portugal-alojamento-local-license-guide-2024', 
         'Portugal''s Alojamento Local (AL) license is mandatory for all short-term rental properties, including Airbnb listings. This comprehensive guide covers everything you need to know about obtaining and maintaining your AL registration in 2024.

## What is Alojamento Local?

Alojamento Local is Portugal''s legal framework for short-term rental accommodations. Established to regulate tourism rentals, the AL system ensures properties meet safety standards while providing tax revenue and guest protection.

## AL Registration Process 2024

The registration process involves several key steps:
1. Property inspection and safety certification
2. Online application through tourism portal
3. Documentation submission including property photos
4. Payment of registration fees
5. Awaiting approval and license issuance',
         'Complete guide to obtaining your Alojamento Local license in Portugal. Learn the 2024 registration process, requirements, and compliance obligations.',
         (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'en', 'published',
         'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
         ARRAY['Alojamento Local', 'AL License', 'Portugal', 'Legal Compliance', 'Tourism Regulation'],
         ARRAY['alojamento local', 'portugal', 'license', 'compliance', 'registration'], 15,
         'Portugal Alojamento Local License Guide 2024 | AL Registration Process',
         'Complete guide to obtaining your Alojamento Local license in Portugal. Step-by-step AL registration process, requirements, and compliance tips for 2024.'),

        ('How to Automate Airbnb Check-In in Portugal: Smart Lock & Guest Access Guide', 'automate-airbnb-checkin-portugal-smart-locks', 
         'Automated check-in has become a necessity for Airbnb hosts in Portugal. With international guests arriving at all hours and increasing demand for contactless experiences, smart locks offer the perfect solution for efficient and secure operations.

## Why Automate Check-In?

Modern travelers expect seamless, contactless experiences. Smart locks provide:
- 24/7 guest access without host presence
- Enhanced security with unique access codes
- Remote management capabilities
- Integration with booking platforms
- Improved guest satisfaction scores

## Best Smart Lock Solutions for Portugal

### Nuki Smart Lock
- Easy installation on existing doors
- Smartphone app control
- Integration with Airbnb and Booking.com
- Battery-powered operation

### Yale Conexis L1
- Keypad and smartphone access
- Weather-resistant design
- Long battery life
- Audit trail functionality',
         'Discover how to automate your Airbnb check-in in Portugal with smart locks, improving guest experience and operational efficiency.',
         (SELECT id FROM authors WHERE slug = 'carlos-silva'), 'automation', 'en', 'published',
         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
         ARRAY['Automation', 'Check-in', 'Smart Locks', 'Portugal', 'Airbnb', 'Technology'],
         ARRAY['automation', 'checkin', 'smart locks', 'portugal', 'technology'], 18,
         'Automate Airbnb Check-In Portugal | Smart Locks Guide 2025',
         'Learn how to automate your Airbnb check-in process in Portugal with smart locks, Nuki, TTLock, and SEF compliance for seamless guest experiences.'),

        -- Property Management Posts
        ('Property Management Excellence in Portugal: A Complete Guide', 'property-management-excellence-portugal-guide', 
         'Professional property management in Portugal requires a comprehensive understanding of local regulations, market dynamics, and guest expectations. This guide covers everything from operational basics to advanced optimization strategies.

## Core Management Principles

Successful property management in Portugal hinges on:
- Legal compliance with AL regulations
- Exceptional guest communication
- Proactive maintenance protocols
- Revenue optimization strategies
- Local market knowledge

## Guest Communication Framework

Establishing clear communication protocols ensures smooth operations:
1. Pre-arrival instructions and check-in details
2. Welcome messages with local recommendations
3. During-stay support and availability
4. Check-out procedures and feedback requests
5. Post-stay follow-up and review encouragement

## Maintenance and Housekeeping Standards

Maintaining high standards requires:
- Regular property inspections
- Professional cleaning between stays
- Preventive maintenance schedules
- Emergency repair procedures
- Quality control checklists',
         'Learn the essential strategies for managing rental properties in Portugal with professional excellence and maximum efficiency.',
         (SELECT id FROM authors WHERE slug = 'carlos-pereira'), 'property-management', 'en', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Property Management', 'Portugal', 'Rental Management', 'Guest Services'],
         ARRAY['property management', 'portugal', 'rental', 'guest services'], 20,
         'Property Management Portugal | Complete Professional Guide',
         'Complete guide to professional property management in Portugal. Learn best practices for rental management and guest services.'),

        ('Maximizing Rental Income in the Algarve Region', 'maximizing-rental-income-algarve-region', 
         'The Algarve region offers exceptional opportunities for rental property owners to maximize their income through strategic approaches. Understanding local market dynamics and implementing proven strategies can significantly boost your rental revenue.

## Algarve Market Overview

The Algarve benefits from:
- Year-round tourism appeal
- Strong international recognition
- Diverse accommodation demand
- Premium pricing potential during peak seasons
- Growing digital nomad market

## Seasonal Strategy Development

Maximizing income requires adapting to seasonal patterns:

### High Season (June-September)
- Premium pricing strategies
- Minimum stay requirements
- Focus on families and beach tourists
- Enhanced amenities and services

### Shoulder Seasons (April-May, October-November)
- Competitive pricing for early bookings
- Target golf tourists and retirees
- Promote mild weather advantages
- Offer longer-stay discounts

### Low Season (December-March)
- Digital nomad packages
- Monthly rental options
- Maintenance and renovation periods
- Local cultural experience packages',
         'Discover proven strategies to increase your rental income in Portugal''s most popular tourism destination.',
         (SELECT id FROM authors WHERE slug = 'sofia-mendes'), 'income-optimization', 'en', 'published',
         'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop',
         ARRAY['Algarve', 'Income Optimization', 'Rental Income', 'Tourism'],
         ARRAY['algarve', 'rental income', 'tourism', 'optimization'], 16,
         'Maximize Algarve Rental Income | Property Investment Guide',
         'Learn how to maximize your rental income in the Algarve region with expert strategies and local market insights.'),

        -- Legal and Compliance Posts  
        ('SEF Registration and AIMA Compliance for Hosts', 'sef-registration-aima-compliance-hosts-portugal', 
         'Understanding SEF registration requirements and AIMA compliance is crucial for property hosts in Portugal. This comprehensive guide covers all the necessary steps and documentation required for legal compliance.

## SEF vs AIMA: Understanding the Transition

Portugal''s immigration services have transitioned from SEF to AIMA (Agência para a Integração, Migrações e Asilo). This affects guest registration requirements for short-term rentals.

## Mandatory Guest Registration

All accommodation providers must:
- Register guests within 24 hours of arrival
- Collect and verify identity documents
- Submit registration data to authorities
- Maintain registration records
- Ensure data protection compliance

## Documentation Requirements

Required documents for guest registration:
1. Valid passport or EU ID card
2. Proof of accommodation booking
3. Contact information and address
4. Purpose and duration of stay
5. Next destination details

## Digital Registration Systems

Modern solutions include:
- Online registration platforms
- Mobile app integration
- Automated data collection
- Real-time submission to authorities
- Compliance tracking and reporting',
         'Complete guide to SEF and AIMA requirements for Portuguese rental properties.',
         (SELECT id FROM authors WHERE slug = 'jose-raimundo'), 'legal-compliance', 'en', 'published',
         'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop',
         ARRAY['SEF', 'AIMA', 'Compliance', 'Registration', 'Legal'],
         ARRAY['sef', 'aima', 'compliance', 'registration', 'portugal'], 14,
         'SEF Registration AIMA Compliance Portugal | Guest Registration Guide',
         'Complete guide to SEF registration and AIMA compliance requirements for Portuguese rental property hosts and guest registration procedures.'),

        -- Technology and Automation Posts
        ('Smart Home Technology for Rentals', 'smart-home-technology-rentals-portugal', 
         'Implementing smart home technology in your rental properties can significantly improve guest satisfaction and operational efficiency. Learn about the best smart devices and systems for rental properties in Portugal.

## Essential Smart Home Devices

### Smart Locks
- Keyless entry solutions
- Remote access management
- Guest code generation
- Activity monitoring

### Smart Thermostats
- Energy efficiency optimization
- Remote temperature control
- Scheduling capabilities
- Guest comfort enhancement

### Smart Lighting
- Automated lighting schedules
- Motion sensor activation
- Remote control capabilities
- Energy consumption reduction

### Security Systems
- Smart cameras and doorbells
- Motion detection alerts
- Remote monitoring capabilities
- Guest safety enhancement

## Integration and Management

Successful implementation requires:
- Centralized control platform
- User-friendly guest interfaces
- Reliable internet connectivity
- Professional installation support
- Regular maintenance protocols',
         'How smart home technology can transform your rental property business.',
         (SELECT id FROM authors WHERE slug = 'shubanshu'), 'automation', 'en', 'published',
         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
         ARRAY['Smart Home', 'Technology', 'Automation', 'IoT'],
         ARRAY['smart home', 'technology', 'automation', 'iot'], 12,
         'Smart Home Technology for Rentals | IoT Solutions Guide',
         'Discover how smart home technology can transform your rental property business with automated systems and enhanced guest experiences.'),

        -- Financial and Investment Posts
        ('Pricing Strategies for Maximum Occupancy', 'pricing-strategies-maximum-occupancy-portugal', 
         'Developing effective pricing strategies is key to maximizing both occupancy rates and revenue. Learn dynamic pricing techniques and market analysis methods for optimal results.

## Dynamic Pricing Fundamentals

Successful pricing strategies consider:
- Market demand fluctuations
- Local events and festivals
- Seasonal tourism patterns
- Competitor pricing analysis
- Property unique selling points

## Revenue Management Techniques

### Demand-Based Pricing
- High-demand periods: Premium rates
- Low-demand periods: Competitive rates
- Special events: Surge pricing
- Last-minute bookings: Flexible rates

### Competitive Analysis
- Regular market research
- Competitor rate monitoring
- Value proposition assessment
- Pricing gap identification

### Length-of-Stay Optimization
- Minimum stay requirements during peak periods
- Weekly and monthly discounts
- Shoulder season promotions
- Gap-filling strategies

## Technology Solutions

Automated pricing tools offer:
- Real-time market analysis
- Competitor rate tracking
- Demand forecasting
- Automated price adjustments
- Revenue optimization recommendations',
         'Master the art of pricing your rental properties for maximum profitability.',
         (SELECT id FROM authors WHERE slug = 'adolfo-ferreira'), 'income-optimization', 'en', 'published',
         'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
         ARRAY['Pricing', 'Revenue', 'Occupancy', 'Strategy'],
         ARRAY['pricing', 'revenue', 'occupancy', 'strategy'], 16,
         'Pricing Strategies Maximum Occupancy | Revenue Optimization Guide',
         'Master dynamic pricing strategies for rental properties. Learn revenue optimization techniques for maximum occupancy and profitability.'),

        ('Tax Optimization for Portuguese Property Owners', 'tax-optimization-portuguese-property-owners', 
         'Understanding the Portuguese tax system and available deductions can significantly impact your property investment returns. This guide covers all aspects of property taxation in Portugal.

## Portuguese Property Tax Overview

Property owners in Portugal face several tax obligations:
- IMI (Municipal Property Tax)
- IRS (Personal Income Tax) on rental income
- Capital gains tax on property sales
- Stamp duty on property transactions
- Tourist tax in certain municipalities

## Rental Income Taxation

Rental income is subject to IRS at progressive rates:
- Standard rates: 14.5% to 48%
- Simplified regime: 28% flat rate
- Deductible expenses: Maintenance, management, insurance
- Professional property management fees

## Available Deductions

Legitimate deductions include:
- Property management fees
- Maintenance and repair costs
- Insurance premiums
- Marketing and advertising expenses
- Professional service fees
- Depreciation allowances

## NHR Tax Benefits

The Non-Habitual Resident program offers:
- 10-year tax benefits
- Reduced rates on Portuguese income
- Exemptions on foreign income
- Favorable treatment for pension income
- Professional income tax advantages',
         'Comprehensive guide to property taxes and optimization strategies in Portugal.',
         (SELECT id FROM authors WHERE slug = 'ricardo-almeida'), 'financial-planning', 'en', 'published',
         'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=800&h=400&fit=crop',
         ARRAY['Taxes', 'Optimization', 'Deductions', 'Finance'],
         ARRAY['taxes', 'optimization', 'deductions', 'finance'], 18,
         'Tax Optimization Portugal Property Owners | Complete Guide',
         'Complete guide to Portuguese property taxes and optimization strategies. Learn about deductions, NHR benefits, and tax planning for property investors.'),

        -- Additional Posts from Data Files
        ('Building Your Property Portfolio in Portugal', 'building-property-portfolio-portugal', 
         'Strategic property portfolio development requires careful planning and market knowledge. Learn how to scale your property investments effectively in the Portuguese market.',
         'Step-by-step guide to building a successful property portfolio in Portugal.',
         (SELECT id FROM authors WHERE slug = 'sofia-mendes'), 'investment-strategy', 'en', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Portfolio', 'Investment', 'Scaling', 'Strategy'],
         ARRAY['portfolio', 'investment', 'scaling', 'strategy'], 14,
         'Building Property Portfolio Portugal | Investment Strategy Guide',
         'Step-by-step guide to building a successful property portfolio in Portugal with strategic investment approaches and market insights.'),

        ('Seasonal Marketing Strategies for Algarve Properties', 'seasonal-marketing-strategies-algarve', 
         'The Algarve''s seasonal tourism patterns require adaptive marketing strategies throughout the year. Learn how to optimize your marketing efforts for each season.',
         'Maximize bookings year-round with strategic seasonal marketing.',
         (SELECT id FROM authors WHERE slug = 'patricia-garlini'), 'marketing', 'en', 'published',
         'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop',
         ARRAY['Marketing', 'Seasonal', 'Algarve', 'Tourism'],
         ARRAY['marketing', 'seasonal', 'algarve', 'tourism'], 12,
         'Seasonal Marketing Strategies Algarve | Tourism Marketing Guide',
         'Learn seasonal marketing strategies for Algarve properties. Maximize bookings year-round with targeted tourism marketing approaches.'),

        ('Emergency Management for Rental Properties', 'emergency-management-rental-properties', 
         'Proper emergency preparedness and response procedures are essential for rental property management. Learn how to handle various emergency situations effectively.',
         'Essential emergency management procedures for property hosts.',
         (SELECT id FROM authors WHERE slug = 'miguel-ribeiro'), 'property-management', 'en', 'published',
         'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=400&fit=crop',
         ARRAY['Emergency', 'Safety', 'Procedures', 'Management'],
         ARRAY['emergency', 'safety', 'procedures', 'management'], 10,
         'Emergency Management Rental Properties | Safety Procedures Guide',
         'Essential emergency management procedures for rental property hosts. Learn safety protocols and emergency response strategies.'),

        ('Sustainable Tourism and Green Practices', 'sustainable-tourism-green-practices', 
         'Implementing sustainable and eco-friendly practices in your rental properties not only benefits the environment but also attracts environmentally conscious guests.',
         'How to implement green practices in your rental property business.',
         (SELECT id FROM authors WHERE slug = 'zara-alam'), 'sustainability', 'en', 'published',
         'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
         ARRAY['Sustainability', 'Eco-friendly', 'Green', 'Tourism'],
         ARRAY['sustainability', 'eco-friendly', 'green', 'tourism'], 11,
         'Sustainable Tourism Green Practices | Eco-Friendly Rental Guide',
         'Learn how to implement sustainable and green practices in your rental property business to attract eco-conscious guests.')

    ) AS new_posts(title, slug, content, excerpt, author_id, category, language, status, featured_image_url, tags, keywords, reading_time, meta_title, meta_description)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.generated_content 
        WHERE generated_content.slug = new_posts.slug
    );

    -- Insert Portuguese posts
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) 
    SELECT * FROM (VALUES
        ('Como Maximizar a Sua Receita do Airbnb em Portugal: Dicas de Especialistas para 2024', 'maximize-receita-airbnb-portugal-2024', 
         'O mercado de arrendamento de curta duração em Portugal continua a prosperar, tornando-se numa excelente oportunidade para proprietários gerarem receitas substanciais através do Airbnb.',
         'Descubra estratégias comprovadas para maximizar a sua receita do Airbnb em Portugal com dicas especializadas sobre preços, otimização e gestão profissional de propriedades.',
         (SELECT id FROM authors WHERE slug = 'maria-santos'), 'income-strategy', 'pt', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Otimização de Rendimento', 'Portugal', 'Airbnb', 'Gestão de Receitas', 'Investimento Imobiliário'],
         ARRAY['airbnb', 'portugal', 'receita', 'otimização'], 12,
         'Maximizar Receita Airbnb Portugal 2024 | Dicas de Especialistas',
         'Aprenda estratégias comprovadas para aumentar a sua receita do Airbnb em Portugal. Dicas especializadas sobre preços, otimização e gestão profissional de propriedades.'),
         
        ('Guia Completo da Licença de Alojamento Local de Portugal em 2024', 'guia-licenca-alojamento-local-portugal-2024', 
         'A licença de Alojamento Local (AL) de Portugal é obrigatória para todas as propriedades de arrendamento de curta duração, incluindo listagens do Airbnb.',
         'Guia completo para obter a sua licença de Alojamento Local em Portugal. Aprenda o processo de registo 2024, requisitos e obrigações de conformidade.',
         (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'pt', 'published',
         'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
         ARRAY['Alojamento Local', 'Licença AL', 'Portugal', 'Conformidade Legal', 'Regulamentação Turística'],
         ARRAY['alojamento local', 'portugal', 'licença', 'conformidade'], 10,
         'Guia Licença Alojamento Local Portugal 2024 | Processo Registo AL',
         'Guia completo para obter a sua licença de Alojamento Local em Portugal. Processo passo-a-passo de registo AL, requisitos e dicas de conformidade para 2024.'),

        ('Gestão Profissional de Propriedades em Portugal: Guia Completo', 'gestao-profissional-propriedades-portugal', 
         'Guia completo para gestão profissional de propriedades em Portugal, cobrindo desde comunicação com hóspedes até protocolos de manutenção.',
         'Aprenda as estratégias essenciais para gerir propriedades de aluguer em Portugal com excelência profissional e máxima eficiência.',
         (SELECT id FROM authors WHERE slug = 'carlos-pereira'), 'property-management', 'pt', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Gestão de Propriedades', 'Portugal', 'Gestão de Aluguer', 'Serviços aos Hóspedes'],
         ARRAY['gestão propriedades', 'portugal', 'aluguer', 'serviços hóspedes'], 8,
         'Gestão Propriedades Portugal | Guia Profissional Completo',
         'Guia completo para gestão profissional de propriedades em Portugal. Aprenda as melhores práticas para gestão de aluguer e serviços aos hóspedes.')

    ) AS new_posts_pt(title, slug, content, excerpt, author_id, category, language, status, featured_image_url, tags, keywords, reading_time, meta_title, meta_description)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.generated_content 
        WHERE generated_content.slug = new_posts_pt.slug
    );

    -- Insert French posts
    INSERT INTO public.generated_content (
        title, slug, content, excerpt, author_id, category, language, status, 
        featured_image_url, tags, keywords, reading_time, meta_title, meta_description
    ) 
    SELECT * FROM (VALUES
        ('Comment Maximiser Vos Revenus Airbnb au Portugal : Conseils d''Experts pour 2024', 'maximiser-revenus-airbnb-portugal-2024', 
         'Le marché de la location à court terme au Portugal continue de prospérer, offrant une excellente opportunité aux propriétaires de générer des revenus substantiels grâce à Airbnb.',
         'Découvrez des stratégies éprouvées pour maximiser vos revenus Airbnb au Portugal avec des conseils d''experts sur les prix, l''optimisation et la gestion professionnelle.',
         (SELECT id FROM authors WHERE slug = 'maria-santos'), 'income-strategy', 'fr', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
         ARRAY['Optimisation Revenus', 'Portugal', 'Airbnb', 'Gestion Revenus', 'Investissement Immobilier'],
         ARRAY['airbnb', 'portugal', 'revenus', 'optimisation'], 12,
         'Maximiser Revenus Airbnb Portugal 2024 | Conseils Experts',
         'Découvrez des stratégies éprouvées pour augmenter vos revenus Airbnb au Portugal. Conseils d''experts sur les prix, l''optimisation et la gestion professionnelle.'),
         
        ('Guide Complet de la Licence Alojamento Local du Portugal en 2024', 'guide-licence-alojamento-local-portugal-2024', 
         'La licence Alojamento Local (AL) du Portugal est obligatoire pour toutes les propriétés de location à court terme, y compris les annonces Airbnb.',
         'Guide complet pour obtenir votre licence Alojamento Local au Portugal. Apprenez le processus d''enregistrement 2024, les exigences et les obligations de conformité.',
         (SELECT id FROM authors WHERE slug = 'joao-fernandes'), 'legal-compliance', 'fr', 'published',
         'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop',
         ARRAY['Alojamento Local', 'Licence AL', 'Portugal', 'Conformité Légale', 'Réglementation Touristique'],
         ARRAY['alojamento local', 'portugal', 'licence', 'conformité'], 10,
         'Guide Licence Alojamento Local Portugal 2024 | Processus Enregistrement AL',
         'Guide complet pour obtenir votre licence Alojamento Local au Portugal. Processus étape par étape d''enregistrement AL, exigences et conseils de conformité pour 2024.'),

        ('Gestion Professionnelle des Propriétés au Portugal : Guide Complet', 'gestion-professionnelle-proprietes-portugal', 
         'Guide complet pour la gestion professionnelle des propriétés au Portugal, couvrant tout depuis la communication avec les clients jusqu''aux protocoles de maintenance.',
         'Apprenez les stratégies essentielles pour gérer les propriétés locatives au Portugal avec excellence professionnelle et efficacité maximale.',
         (SELECT id FROM authors WHERE slug = 'carlos-pereira'), 'property-management', 'fr', 'published',
         'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
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
        'message', 'Successfully migrated comprehensive blog post collection with all content from data files'
    );

    RETURN result;
END;
$function$;