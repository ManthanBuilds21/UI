import HeroCarousel from '../../sections/hero/HeroCarousel'
import BrandStorySection from '../../sections/about/BrandStorySection'
import FeaturedCollectionsSection from '../../sections/collections/FeaturedCollectionsSection'
import LookbookSection from '../../sections/LookbookSection'
import NewsletterSection from '../../sections/NewsletterSection'
import BestSellersSection from '../../sections/products/BestSellersSection'
import NewArrivalsSection from '../../sections/products/NewArrivalsSection'
import SEO from '../../components/seo/SEO'

export default function HomePage() {
  return (
    <>
      <SEO />
      <HeroCarousel />
      <FeaturedCollectionsSection />
      <NewArrivalsSection />
      <BrandStorySection />
      <BestSellersSection />
      <LookbookSection />
      <NewsletterSection />
    </>
  )
}
