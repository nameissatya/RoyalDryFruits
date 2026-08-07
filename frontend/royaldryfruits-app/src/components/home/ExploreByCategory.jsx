import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import mixedImg from '../../assets/images/cat-mixed.jpg'
import almondsImg from '../../assets/images/cat-almonds.jpg'
import cashewsImg from '../../assets/images/cat-cashews.jpg'
import pistachiosImg from '../../assets/images/cat-pistachios.jpg'
import datesImg from '../../assets/images/cat-dates.jpg'
import walnutsImg from '../../assets/images/rel-walnuts.jpg'

const categories = [
  {
    title: 'Premium Almonds',
    subtitle: 'Rich, Crunchy & Organic',
    badge: 'Bestseller',
    image: almondsImg,
  },
  {
    title: 'Whole White Cashews',
    subtitle: 'Creamy W320 Grade',
    badge: 'Popular',
    image: cashewsImg,
  },
  {
    title: 'Roasted Pistachios',
    subtitle: 'Lightly Salted & Shelled',
    badge: 'Fresh',
    image: pistachiosImg,
  },
  {
    title: 'Royal Medjool Dates',
    subtitle: 'Naturally Sweet & Soft',
    badge: 'Imported',
    image: datesImg,
  },
  {
    title: 'Kashmiri Walnut Kernels',
    subtitle: 'Rich in Omega-3',
    badge: 'Organic',
    image: walnutsImg,
  },
  {
    title: 'Mixed Dry Fruit Boxes',
    subtitle: 'Healthy Daily Selection',
    badge: 'Gift Pick',
    image: mixedImg,
  },
]

export default function ExploreByCategory() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-headline text-headline-md text-primary mb-1">
            Explore by Category
          </h2>
          <p className="font-body text-body-md text-on-surface-variant">
            Discover our wide range of premium quality nuts, dried fruits & mixes.
          </p>
        </div>
        <Link
          to="/collections"
          className="font-label text-label-md text-secondary flex items-center gap-1.5 hover:underline font-bold"
        >
          View All Categories{' '}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 6 Category Cards Grid (2 rows of 3 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.title}
            to="/collections"
            className="group relative rounded-2xl overflow-hidden shadow-[0_8px_24px_0_rgba(48,24,0,0.06)] hover:shadow-[0_16px_36px_0_rgba(48,24,0,0.12)] hover:-translate-y-1 transition-all duration-300 bg-surface-container h-[260px] md:h-[300px] block"
          >
            {/* Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${category.image}')` }}
            />
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              {/* Badge */}
              <div className="flex justify-start">
                <span className="bg-surface/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-label text-xs font-semibold shadow-sm">
                  {category.badge}
                </span>
              </div>

              {/* Title & Action Icon */}
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-headline text-headline-sm text-on-primary font-bold mb-1 group-hover:text-primary-fixed transition-colors">
                    {category.title}
                  </h3>
                  <p className="font-body text-body-md text-on-primary/80 text-sm">
                    {category.subtitle}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface/20 backdrop-blur-sm flex items-center justify-center text-on-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0 ml-2">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
