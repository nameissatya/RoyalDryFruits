import { CheckCircle2, Truck, Sparkles } from 'lucide-react'

const features = [
  {
    icon: CheckCircle2,
    title: 'Handpicked Quality',
    description:
      'Every nut and fruit is rigorously inspected to ensure only the finest size, flavor, and texture make it into our gifts.',
  },
  {
    icon: Truck,
    title: 'Local Delivery',
    description:
      'Fast, reliable local delivery within a 10km radius ensures your gifts arrive fresh and exactly on time.',
  },
  {
    icon: Sparkles,
    title: 'Custom Branding',
    description:
      'Personalize your corporate or wedding hampers with custom sleeves, embossed ribbons, and bespoke greeting cards.',
  },
]

export default function RoyalStandard() {
  return (
    <section className="py-12 border-t border-outline-variant/20">
      <div className="text-center mb-12">
        <h2 className="font-headline text-headline-md text-primary">
          The Royal Standard
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 bg-surface rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="p-4 bg-secondary-fixed/50 rounded-full text-secondary mb-4">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-headline text-headline-sm text-primary mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-body-md text-on-surface-variant">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
