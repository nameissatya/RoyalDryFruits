import HeroSection from '../components/gifting/HeroSection'
import ShopByOccasion from '../components/gifting/ShopByOccasion'
import CuratedHampers from '../components/gifting/CuratedHampers'
import CorporateBanner from '../components/gifting/CorporateBanner'
import RoyalStandard from '../components/gifting/RoyalStandard'

export default function GiftingPage() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Sections Container */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 space-y-24">
        <ShopByOccasion />
        <CuratedHampers />
        <CorporateBanner />
        <RoyalStandard />
      </div>
    </>
  )
}
