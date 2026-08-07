import occasionImg from '../../assets/images/occasion-banner.jpg'

export default function GiftsForOccasion() {
  return (
    <section className="relative w-full min-h-[600px] flex items-center overflow-hidden bg-surface-container-low">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={occasionImg}
          alt="Elegant display of dry fruit gift boxes at a festive celebration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low/90 via-surface-container-low/40 to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-surface-container-low/60 md:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="max-w-xl bg-surface-container-low/80 md:bg-transparent p-8 md:p-0 rounded-xl backdrop-blur-sm md:backdrop-blur-none">
          <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-6">
            Gifts for Every Occasion
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant mb-8">
            Celebrate life's most precious moments with our curated collections.
            From grand Weddings and vibrant Festivals to sophisticated Corporate
            gifting, we provide elegant dry fruit hampers that leave a lasting
            impression of taste and tradition.
          </p>
          <button className="px-8 py-4 bg-primary text-on-primary font-label text-label-md rounded-full shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            Explore Collections
          </button>
        </div>
      </div>
    </section>
  )
}
