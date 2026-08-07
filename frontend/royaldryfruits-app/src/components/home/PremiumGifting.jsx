import giftingImg from '../../assets/images/gifting-banner.jpg'
import { Link } from 'react-router-dom'

export default function PremiumGifting() {
  return (
    <section className="bg-surface-container-low py-24 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h2 className="font-headline text-headline-md text-primary mb-2">
            Premium Gifting
          </h2>
          <p className="font-body text-body-md text-on-surface-variant">
            Elegant hampers for your special occasions.
          </p>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col md:flex-row min-h-[400px]">
          {/* Text Content */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-start gap-6 z-10">
            <h3 className="font-display text-display-lg-mobile md:text-headline-md text-primary">
              Handcrafted Gift Hampers
            </h3>
            <p className="font-body text-body-lg text-on-surface-variant">
              Curated selections of the finest dry fruits, elegantly packaged
              for your loved ones.
            </p>
            <Link
              to="/gifting"
              className="px-8 py-4 bg-primary text-on-primary font-label text-label-md rounded-full shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              Explore Gifting
            </Link>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
            <img
              src={giftingImg}
              alt="Premium dry fruit gift box"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low/20 to-transparent hidden md:block" />
          </div>
        </div>
      </div>
    </section>
  )
}
