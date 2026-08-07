import { ArrowRight } from 'lucide-react'
import artisanalImg from '../../assets/images/hamper-artisanal.jpg'
import festiveImg from '../../assets/images/hamper-festive.jpg'
import goldTrayImg from '../../assets/images/hamper-gold-tray.jpg'

const hampers = [
  {
    id: 1,
    name: 'Artisanal Wooden Hamper',
    description:
      'A rustic yet refined selection of our finest organic dates, figs, and jumbo cashews in a reusable wooden keepsake box.',
    price: 2499,
    image: artisanalImg,
    badge: { label: 'Bestseller', variant: 'tertiary' },
  },
  {
    id: 2,
    name: 'Royal Festive Box',
    description:
      'The ultimate celebratory collection featuring premium saffron, cardamom-infused pistachios, and honey-roasted almonds.',
    price: 3999,
    image: festiveImg,
    badge: null,
  },
  {
    id: 3,
    name: 'Gourmet Gold Tray',
    description:
      'An opulent presentation of assorted classic nuts in a stunning decorative gold tray, perfect for making a grand impression.',
    price: 1899,
    image: goldTrayImg,
    badge: { label: 'New', variant: 'secondary' },
  },
]

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CuratedHampers() {
  return (
    <section id="hampers">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="font-headline text-headline-md text-primary mb-2">
            Curated Hampers
          </h2>
          <p className="font-body text-body-md text-on-surface-variant">
            Our signature selections, hand-packed with care.
          </p>
        </div>
        <a
          href="#"
          className="hidden md:flex items-center gap-2 text-secondary font-label text-label-md hover:text-primary transition-colors font-bold"
        >
          View All Hampers{' '}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Hampers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {hampers.map((hamper) => (
          <article
            key={hamper.id}
            className="bg-surface-container-low rounded-xl overflow-hidden shadow-[0_8px_24px_0_rgba(48,24,0,0.05)] hover:shadow-[0_16px_40px_0_rgba(48,24,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-surface-variant overflow-hidden p-6">
              <img
                src={hamper.image}
                alt={hamper.name}
                className="w-full h-full object-cover object-center rounded-lg shadow-sm mix-blend-multiply"
              />
              {hamper.badge && (
                <span
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full font-label text-[12px] uppercase tracking-wider ${
                    hamper.badge.variant === 'tertiary'
                      ? 'bg-tertiary text-on-tertiary'
                      : 'bg-secondary text-on-secondary'
                  }`}
                >
                  {hamper.badge.label}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-headline text-headline-sm text-primary mb-2">
                {hamper.name}
              </h3>
              <p className="font-body text-body-md text-on-surface-variant mb-4 flex-grow">
                {hamper.description}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-headline text-headline-sm text-primary-container font-bold">
                  {formatPrice(hamper.price)}
                </span>
                <button className="px-5 py-2.5 border border-primary text-primary font-label text-label-md rounded-full hover:bg-primary hover:text-on-primary transition-colors font-bold">
                  View Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Mobile "View All" link */}
      <div className="mt-8 text-center md:hidden">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-secondary font-label text-label-md hover:text-primary transition-colors font-bold"
        >
          View All Hampers{' '}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  )
}
