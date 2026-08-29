import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { fetchCategoriesApi, resolveImageUrl } from '../../services/productApi'
import mixedImg from '../../assets/images/cat-mixed.jpg'
import almondsImg from '../../assets/images/cat-almonds.jpg'
import cashewsImg from '../../assets/images/cat-cashews.jpg'
import pistachiosImg from '../../assets/images/cat-pistachios.jpg'
import datesImg from '../../assets/images/cat-dates.jpg'
import walnutsImg from '../../assets/images/rel-walnuts.jpg'

const fallbackImages = [almondsImg, cashewsImg, pistachiosImg, datesImg, walnutsImg, mixedImg]

export default function ExploreByCategory() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      const data = await fetchCategoriesApi()
      if (isMounted) {
        setCategories(data || [])
        setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

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

      {/* Dynamic Category Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[260px] md:h-[300px] rounded-2xl bg-surface-container animate-pulse flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-surface-container rounded-2xl p-10 text-center text-on-surface-variant">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
          <h3 className="font-headline text-lg font-bold text-primary mb-1">No Categories Found</h3>
          <p className="text-xs">Add categories in the Admin Portal to display them dynamically here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const bgImage = category.imageUrl
              ? resolveImageUrl(category.imageUrl)
              : fallbackImages[index % fallbackImages.length]

            return (
              <Link
                key={category.id || category.name}
                to={`/collections?category=${encodeURIComponent(category.name)}`}
                className="group relative rounded-2xl overflow-hidden shadow-[0_8px_24px_0_rgba(48,24,0,0.06)] hover:shadow-[0_16px_36px_0_rgba(48,24,0,0.12)] hover:-translate-y-1 transition-all duration-300 bg-surface-container h-[260px] md:h-[300px] block"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${bgImage}')` }}
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  {/* Badge */}
                  <div className="flex justify-start">
                    <span className="bg-surface/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-label text-xs font-semibold shadow-sm">
                      {category.productCount > 0 ? `${category.productCount} Products` : 'Premium Selection'}
                    </span>
                  </div>

                  {/* Title & Action Icon */}
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-headline text-headline-sm text-on-primary font-bold mb-1 group-hover:text-primary-fixed transition-colors">
                        {category.name}
                      </h3>
                      <p className="font-body text-body-md text-on-primary/80 text-sm line-clamp-2">
                        {category.description || 'Premium handpicked dry fruits & sweets'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface/20 backdrop-blur-sm flex items-center justify-center text-on-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0 ml-2">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
