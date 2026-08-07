import heroImg from '../../assets/images/hero-gifting.jpg'

export default function HeroSection() {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Exquisite Gifting Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-6">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-white drop-shadow-lg">
          Exquisite Gifting for Every Occasion
        </h1>
        <p className="font-body text-body-lg text-white/90 max-w-2xl drop-shadow-md">
          Discover our handcrafted hampers and premium selections of the finest
          quality dry fruits, designed to make every moment unforgettable.
        </p>
        <a
          href="#hampers"
          className="mt-4 px-8 py-4 bg-primary text-on-primary font-label text-label-md rounded-full hover:bg-secondary transition-all shadow-[0_4px_20px_0_rgba(48,24,0,0.15)] hover:shadow-[0_8px_25px_0_rgba(48,24,0,0.2)] transform hover:-translate-y-1"
        >
          Explore Hampers
        </a>
      </div>
    </section>
  )
}
