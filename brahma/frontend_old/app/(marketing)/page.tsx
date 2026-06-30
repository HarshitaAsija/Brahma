import MarketingNavbar from '@/components/marketing/marketing-navbar'
import HeroSection from '@/components/marketing/hero-section'
import DemoPreviewSection from '@/components/marketing/demo-preview-section'
import FeaturesSection from '@/components/marketing/features-section'
import AgentsSection from '@/components/marketing/agents-section'
import KnowledgeGraphPreviewSection from '@/components/marketing/knowledge-graph-preview-section'
import ResearchWorkflowSection from '@/components/marketing/research-workflow-section'
import CTASection from '@/components/marketing/cta-section'

export default function MarketingPage() {
  return (
    <>
      <MarketingNavbar />
      <HeroSection />
      <DemoPreviewSection />
      <FeaturesSection />
      <AgentsSection />
      <KnowledgeGraphPreviewSection />
      <ResearchWorkflowSection />
      <CTASection />
    </>
  )
}