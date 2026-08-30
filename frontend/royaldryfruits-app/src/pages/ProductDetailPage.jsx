import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Star, StarHalf, Truck, Minus, Plus, ShoppingCart, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fetchProductBySlugApi, fetchProductsApi } from '../services/productApi'

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem, freeDeliveryRadius } = useCart()

  const [product, setProduct] = useState(null)
  const [relatedList, setRelatedList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToast, setAddedToast] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      const data = await fetchProductBySlugApi(productId)
      const allProds = await fetchProductsApi()
      if (isMounted) {
        setProduct(data)
        if (data) {
          // Filter products from the same category
          const sameCategoryProds = allProds.filter(p => 
            p.id !== data.id && 
            p.slug !== data.slug && 
            (
              (data.categoryId && p.categoryId === data.categoryId) ||
              (data.category && p.category && data.category.toLowerCase().trim() === p.category.toLowerCase().trim())
            )
          )

          // If less than 4 same-category items, append other products
          if (sameCategoryProds.length >= 4) {
            setRelatedList(sameCategoryProds.slice(0, 4))
          } else {
            const otherProds = allProds.filter(p => 
              p.id !== data.id && 
              p.slug !== data.slug && 
              !sameCategoryProds.some(sc => sc.id === p.id)
            )
            setRelatedList([...sameCategoryProds, ...otherProds].slice(0, 4))
          }

          const idx = (data.variants || []).findIndex(v => v.weight === '500g')
          setSelectedSizeIndex(idx >= 0 ? idx : 0)
        }
        setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [productId])

  const currentSize = product?.variants?.[selectedSizeIndex] || { weight: '500g', price: product?.price || 500 }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: `${product.id}-${currentSize.weight}`,
      name: product.name,
      weight: currentSize.weight,
      price: currentSize.price,
      quantity: quantity,
      image: product.image,
    })
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  const handleAddRelated = (relItem) => {
    addItem({
      id: relItem.id,
      name: relItem.name,
      weight: relItem.weight,
      price: relItem.price,
      quantity: 1,
      image: relItem.image,
    })
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-secondary" />
        <h2 className="font-headline text-headline-md text-primary">Product Not Found</h2>
        <p className="text-on-surface-variant font-body text-body-md">The requested product does not exist in the database.</p>
        <Link to="/collections" className="mt-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label text-label-md font-bold hover:bg-secondary transition-colors">
          Browse Collections
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-32 md:pb-16 pt-8">
      {/* Added Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-on-primary px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
          <span className="font-label text-label-md">Item added to cart!</span>
          <Link to="/cart" className="underline font-bold ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* Top Header Bar with Back Button on Top Left */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label text-label-md font-bold transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <nav className="text-xs text-on-surface-variant flex items-center gap-2 hidden sm:flex">
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
            <span>/</span>
            <span className="font-semibold text-primary">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-variant rounded-xl overflow-hidden aspect-square relative shadow-[0_20px_40px_-10px_rgba(48,24,0,0.08)]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label text-label-md shadow-sm">
                {product.badge || 'Fresh Stock'}
              </span>
              <span className="bg-surface text-primary px-3 py-1 rounded-full font-label text-label-md shadow-sm">
                {product.origin || '100% Organic'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div>
            <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-secondary-container">
                <Star className="w-5 h-5 fill-secondary-container text-secondary-container" />
                <Star className="w-5 h-5 fill-secondary-container text-secondary-container" />
                <Star className="w-5 h-5 fill-secondary-container text-secondary-container" />
                <Star className="w-5 h-5 fill-secondary-container text-secondary-container" />
                <StarHalf className="w-5 h-5 fill-secondary-container text-secondary-container" />
              </div>
              <span className="text-on-surface-variant font-body text-body-md">
                ({product.reviews ?? 0} Reviews)
              </span>
            </div>
            <p className="font-body text-body-lg text-on-surface-variant">
              {product.description || 'Premium quality fresh dry fruits and nuts handpicked for natural taste, rich nutrition and health benefits.'}
            </p>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl shadow-[0_20px_40px_-10px_rgba(48,24,0,0.08)]">
            <div className="flex items-center gap-3 text-secondary mb-4">
              <Truck className="w-5 h-5" />
              <span className="font-label text-label-md">
                Fast Local Delivery (within {freeDeliveryRadius || 10}km Free Zone) – COD
              </span>
            </div>

            {/* Select Size */}
            <div className="mb-6">
              <h3 className="font-label text-label-md text-primary mb-3">
                Select Size
              </h3>
              <div className="flex gap-4 flex-wrap">
                {product.variants.map((opt, idx) => (
                  <button
                    key={opt.weight}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`flex-1 min-w-[80px] py-3 rounded-lg text-center font-body text-body-md transition-all ${selectedSizeIndex === idx
                      ? 'border-2 border-secondary bg-secondary/5 text-primary font-bold'
                      : 'border border-outline text-on-surface hover:border-secondary'
                      }`}
                  >
                    {opt.weight}
                    <br />
                    <span className="text-sm font-normal text-secondary">
                      {formatPrice(opt.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Price */}
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-grow">
                <h3 className="font-label text-label-md text-primary mb-3">
                  Quantity
                </h3>
                <div className="flex items-center border border-outline rounded-lg bg-surface h-12 w-32">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex-1 text-on-surface-variant hover:text-primary flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-body text-body-lg text-primary font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex-1 text-on-surface-variant hover:text-primary flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                {currentSize.originalPrice && (
                  <div className="text-sm text-on-surface-variant line-through">
                    {formatPrice(currentSize.originalPrice * quantity)}
                  </div>
                )}
                <div className="font-headline text-headline-md text-primary">
                  {formatPrice(currentSize.price * quantity)}
                </div>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-secondary text-on-secondary py-4 rounded-lg font-headline text-headline-sm hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-24">
        <h2 className="font-headline text-headline-md text-primary mb-8 border-b border-outline-variant/20 pb-4">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {relatedList.map((prod) => (
            <Link
              to={`/product/${prod.slug || prod.id}`}
              key={prod.id}
              className="bg-surface rounded-xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(48,24,0,0.08)] hover:shadow-[0_30px_50px_-12px_rgba(48,24,0,0.12)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col"
            >
              <div className="aspect-square bg-surface-variant relative overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddRelated(prod);
                  }}
                  className="absolute bottom-3 right-3 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-primary-container transition-colors"
                  aria-label={`Add ${prod.name} to cart`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-label text-label-md text-primary mb-1">
                    {prod.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-2">
                    {prod.weight}
                  </p>
                </div>
                <div className="font-headline text-headline-sm text-primary font-bold">
                  {formatPrice(prod.price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
