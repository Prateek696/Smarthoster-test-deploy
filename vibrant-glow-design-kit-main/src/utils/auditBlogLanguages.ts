import { auditBlogLanguageVariants } from './blogLanguageVariants';

// Run audit and export results for debugging
export const runBlogLanguageAudit = () => {
  const { complete, missing } = auditBlogLanguageVariants();
  
  console.log('🔍 BLOG LANGUAGE VARIANT AUDIT');
  console.log('=====================================');
  
  console.log('\n✅ Articles with ALL 3 language versions:');
  complete.forEach(slug => {
    console.log(`   • ${slug}`);
  });
  
  console.log('\n❌ Articles MISSING language versions:');
  missing.forEach(({ slug, missingLanguages }) => {
    console.log(`   • ${slug} - Missing: ${missingLanguages.join(', ')}`);
  });
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Complete articles: ${complete.length}`);
  console.log(`   Incomplete articles: ${missing.length}`);
  console.log(`   Total articles: ${complete.length + missing.length}`);
  
  return { complete, missing };
};

// Auto-run audit if in development
if (import.meta.env.DEV) {
  setTimeout(() => runBlogLanguageAudit(), 1000);
}