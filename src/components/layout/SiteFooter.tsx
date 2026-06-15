import { Link } from 'react-router-dom'

const footerLinks = ['Instagram', 'Lookbook', 'Stockists', 'Journal']

export default function SiteFooter() {
  return (
    <footer className="page-shell pb-8 pt-8 sm:pb-12 sm:pt-12">
      <div className="section-frame campaign-surface bg-black px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow text-white/[0.48]">MANTHAN Clothing</p>
            <h2 className="mt-4 text-[3rem] leading-[0.9] sm:text-[4.5rem] lg:text-[6.2rem]">
              Wear the future with a sharper edge.
            </h2>
          </div>
          <div className="grid gap-3 text-sm uppercase tracking-[0.22em] text-white/[0.65]">
            {footerLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.12] pt-6 text-xs uppercase tracking-[0.22em] text-white/[0.45] sm:flex-row sm:items-center sm:justify-between">
          <span>Premium streetwear campaign frontend</span>
          <div className="flex items-center gap-4">
            <Link to="/collections">Collections</Link>
            <Link to="/about">About</Link>
            <Link to="/cart">Cart</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
