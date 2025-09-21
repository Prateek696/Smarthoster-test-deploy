-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.content_with_author;

-- Recreate the view with SECURITY INVOKER (default behavior)
CREATE OR REPLACE VIEW public.content_with_author AS
SELECT 
  gc.*,
  a.name as author_name,
  a.slug as author_slug,
  a.bio as author_bio,
  a.profile_image_url as author_image
FROM public.generated_content gc
LEFT JOIN public.authors a ON gc.author_id = a.id;