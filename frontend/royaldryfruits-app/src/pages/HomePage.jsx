import HomeHero from '../components/home/HomeHero'
import ExploreByCategory from '../components/home/ExploreByCategory'
import PremiumGifting from '../components/home/PremiumGifting'
import BestsellingHampers from '../components/home/BestsellingHampers'
import GiftsForOccasion from '../components/home/GiftsForOccasion'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <HomeHero />

      {/* Spacer */}
      <div className="h-24" />

      {/* Category Bento Grid */}
      <ExploreByCategory />

      {/* Premium Gifting Banner */}
      <PremiumGifting />

      {/* Bestselling Hampers Carousel */}
      <BestsellingHampers />

      {/* Gifts for Every Occasion */}
      <GiftsForOccasion />

      {/* Spacer */}
      <div className="h-32" />
    </>
  )
}
