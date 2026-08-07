import weddingsImg from '../../assets/images/occasion-weddings.jpg'
import corporateImg from '../../assets/images/occasion-corporate.jpg'
import festivalsImg from '../../assets/images/occasion-festivals.jpg'
import anniversariesImg from '../../assets/images/occasion-anniversaries.jpg'

const occasions = [
  { title: 'Weddings', image: weddingsImg },
  { title: 'Corporate', image: corporateImg },
  { title: 'Festivals', image: festivalsImg },
  { title: 'Anniversaries', image: anniversariesImg },
]

export default function ShopByOccasion() {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="font-headline text-headline-md text-primary mb-4">
          Shop by Occasion
        </h2>
        <p className="font-body text-body-md text-on-surface-variant max-w-2xl mx-auto">
          Find the perfect assortment for any celebration, thoughtfully curated
          to convey your best wishes.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-gutter">
        {occasions.map((occasion) => (
          <a
            key={occasion.title}
            href="#"
            className="group relative block overflow-hidden rounded-xl aspect-square shadow-[0_8px_24px_0_rgba(48,24,0,0.06)] hover:shadow-[0_12px_32px_0_rgba(48,24,0,0.12)] transition-all duration-300"
          >
            <img
              src={occasion.image}
              alt={occasion.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="font-headline text-headline-sm text-white">
                {occasion.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
