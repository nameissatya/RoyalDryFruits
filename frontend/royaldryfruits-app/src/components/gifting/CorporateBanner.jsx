import corporateImg from '../../assets/images/corporate-gifting.jpg'

export default function CorporateBanner() {
  return (
    <section className="bg-surface-container rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-[0_8px_32px_0_rgba(48,24,0,0.04)]">
      {/* Abstract decorative element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      {/* Image */}
      <div className="w-full md:w-1/2 relative z-10">
        <img
          src={corporateImg}
          alt="Corporate Gifting"
          className="rounded-xl shadow-lg w-full aspect-video object-cover"
        />
      </div>

      {/* Content */}
      <div className="w-full md:w-1/2 relative z-10 flex flex-col items-start text-left">
        <h2 className="font-headline text-headline-md text-primary mb-4">
          Elevate Your Corporate Gifting
        </h2>
        <p className="font-body text-body-md text-on-surface-variant mb-8">
          Show appreciation to clients and partners with our bespoke corporate
          selections. We offer bulk ordering, custom branding, and dedicated
          account management for seamless execution.
        </p>
        <a
          href="#"
          className="px-8 py-4 bg-secondary text-on-secondary font-label text-label-md rounded-full hover:bg-primary transition-colors shadow-md"
        >
          Request a Quote
        </a>
      </div>
    </section>
  )
}
