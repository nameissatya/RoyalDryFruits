import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, SearchX, Plus, Star, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fetchProductsApi, fetchCategoriesApi } from '../services/productApi'

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'All'

  const { addItem } = useCart()
  const [productsList, setProductsList] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      const [prods, cats] = await Promise.all([
        fetchProductsApi(),
        fetchCategoriesApi()
      ])
      if (isMounted) {
        setProductsList(prods || [])
        setCategoriesList(cats || [])
        setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName)
    if (catName === 'All') {
      searchParams.delete('category')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ category: catName })
    }
  }

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      weight: product.weight,
      price: product.price,
      quantity: 1,
      image: product.image,
    })
    setToastMessage(`${product.name} added to cart!`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const filteredProducts = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return productsList
    return productsList.filter((p) => 
      p.category?.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [selectedCategory, productsList])

  const allCategoryTabs = ['All', ...categoriesList.map(c => c.name)]

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-on-primary px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
          <span className="font-label text-label-md">{toastMessage}</span>
          <Link to="/cart" className="underline font-bold ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface-container rounded-2xl p-8 md:p-12 mb-10 shadow-[0_8px_30px_rgb(48,24,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-fixed/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <span className="inline-block py-1 px-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label text-label-md mb-4 uppercase tracking-widest">
          Royal Selection
        </span>

        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Our Premium Collections
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant max-w-2xl">
          Explore our wide range of hand-picked nuts, dry fruits, berries, and artisanal hampers. Freshness and premium quality guaranteed with express local delivery.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-start mb-8">
        {/* Dynamic Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {allCategoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-label text-label-md whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-low rounded-xl flex flex-col items-center">
          <SearchX className="w-12 h-12 text-outline-variant mb-4" />
          <h3 className="font-headline text-headline-sm text-primary mb-2">
            No products found
          </h3>
          <p className="font-body text-body-md text-on-surface-variant">
            Try adjusting your category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug || product.id}`}
              className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_20px_0_rgba(48,24,0,0.05)] hover:shadow-[0_12px_32px_0_rgba(48,24,0,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Product Image */}
              <div className="aspect-square bg-surface-variant relative overflow-hidden p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-label text-[11px] font-semibold shadow-sm">
                    {product.badge}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-3 right-3 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-secondary transition-colors"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Product Details */}
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-[12px] font-label text-secondary font-semibold uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h3 className="font-headline text-headline-sm text-primary mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm mb-3">
                    Weight: {product.weight}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/20">
                  <div>
                    <span className="text-xs text-on-surface-variant line-through mr-2">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="font-headline text-headline-sm text-primary font-bold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary text-sm font-label">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span>{product.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
