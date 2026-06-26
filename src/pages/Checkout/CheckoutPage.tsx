import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { useCatalog } from '../../hooks/useCatalog'
import Reveal from '../../components/ui/Reveal'
import SEO from '../../components/seo/SEO'
import {
  getAccountAddresses,
  saveAddressRequest,
  initiateCheckoutRequest,
  verifyCheckoutRequest,
} from '../../lib/api'
import { formatPrice } from '../../utils/format'

type CheckoutStep = 'address' | 'review' | 'payment'

export default function CheckoutPage() {
  const { token, isReady } = useAuth()
  const { cart, subtotal, isLoading: storeLoading } = useStore()
  const { products, isLoading: catalogLoading } = useCatalog()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState<CheckoutStep>('address')
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  })

  const shipping = cart.length === 0 || subtotal >= 180 ? 0 : 18
  const total = subtotal + shipping

  const cartLines = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      if (!product) return null
      return { item, product }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Load user addresses
  useEffect(() => {
    if (!token) return
    getAccountAddresses(token)
      .then((res) => {
        setAddresses(res.addresses)
        if (res.addresses.length > 0) {
          setSelectedAddressId(res.addresses[0].id)
        } else {
          setShowAddressForm(true)
        }
      })
      .catch(() => toast.error('Could not load saved addresses.'))
  }, [token, toast])

  if (!isReady || storeLoading || catalogLoading) return null

  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setIsProcessing(true)
    try {
      const { address } = await saveAddressRequest(token, addressForm)
      setAddresses([address, ...addresses])
      setSelectedAddressId(address.id)
      setShowAddressForm(false)
      toast.success('Address saved.')
    } catch {
      toast.error('Could not save address.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!token || !selectedAddressId) return
    setIsProcessing(true)

    try {
      const data = await initiateCheckoutRequest(token, selectedAddressId)
      
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MANTHAN',
        description: 'Store Checkout',
        order_id: data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await verifyCheckoutRequest(token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success('Payment successful!')
            navigate(`/order-confirmation/${verifyRes.orderId}`)
          } catch {
            toast.error('Payment verification failed.')
            setIsProcessing(false)
          }
        },
        prefill: {
          name: addresses.find(a => a.id === selectedAddressId)?.name,
          contact: addresses.find(a => a.id === selectedAddressId)?.phone,
        },
        theme: {
          color: '#111111',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.')
        setIsProcessing(false)
      })
      rzp.open()
    } catch {
      toast.error('Could not initiate payment.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="page-shell pb-8">
      <SEO title="MANTHAN | Secure Checkout" description="Complete your order securely." />
      <Reveal className="section-frame campaign-surface overflow-hidden px-5 py-8 sm:px-8 sm:py-10 bg-[var(--cloud)]">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-5 max-w-4xl text-[3rem] leading-[0.86] sm:text-[5rem] lg:text-[6.5rem]">
          Secure Checkout.
        </h1>
      </Reveal>

      <div className="section-frame mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-8">
          {/* Step 1: Address */}
          <Reveal className={`campaign-surface bg-white p-6 sm:p-8 transition-opacity ${step === 'address' ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
            <div className="flex items-center justify-between">
              <p className="eyebrow">1. Shipping Address</p>
              {step !== 'address' && (
                <button onClick={() => setStep('address')} className="text-xs font-semibold uppercase tracking-[0.1em] underline text-black/60 hover:text-black">Edit</button>
              )}
            </div>

            {step === 'address' && (
              <div className="mt-6">
                {addresses.length > 0 && !showAddressForm && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer rounded-[1rem] border p-4 transition-colors ${
                          selectedAddressId === addr.id ? 'border-black bg-black/[0.03]' : 'border-black/10 bg-white hover:border-black/30'
                        }`}
                      >
                        <p className="font-semibold">{addr.name}</p>
                        <p className="mt-1 text-sm text-black/70">{addr.street}</p>
                        <p className="text-sm text-black/70">{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="mt-2 text-xs text-black/50">{addr.phone}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center justify-center rounded-[1rem] border border-dashed border-black/20 text-sm font-semibold uppercase tracking-[0.1em] text-black/50 hover:border-black/40 hover:text-black"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {(showAddressForm || addresses.length === 0) && (
                  <form onSubmit={handleSaveAddress} className="grid gap-4">
                    <input
                      required
                      placeholder="Full Name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                    />
                    <input
                      required
                      placeholder="Street Address"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        required
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                      />
                      <input
                        required
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        required
                        placeholder="Postal Code"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                      />
                      <input
                        required
                        placeholder="Phone Number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                      />
                    </div>
                    <div className="mt-4 flex gap-3">
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="button-secondary"
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" disabled={isProcessing} className="button-primary flex-1">
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {!showAddressForm && selectedAddressId && (
                  <button
                    onClick={() => setStep('review')}
                    className="button-primary mt-8 w-full sm:w-auto"
                  >
                    Continue to Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </Reveal>

          {/* Step 2: Review */}
          <Reveal className={`campaign-surface bg-white p-6 sm:p-8 transition-opacity ${step === 'review' ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
            <p className="eyebrow">2. Order Review</p>
            {step === 'review' && (
              <div className="mt-6">
                <div className="grid gap-4 border-b border-black/5 pb-6">
                  {cartLines.map(({ item, product }) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center gap-4">
                      <img src={product.images[0]} alt={product.name} className="h-16 w-16 rounded-[1rem] bg-[var(--cloud)] object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-black/60">Size: {item.size} / Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">{formatPrice(product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setStep('payment')}
                  className="button-primary mt-8 w-full sm:w-auto"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </Reveal>

          {/* Step 3: Payment */}
          <Reveal className={`campaign-surface bg-white p-6 sm:p-8 transition-opacity ${step === 'payment' ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
            <div className="flex items-center justify-between">
              <p className="eyebrow">3. Payment</p>
              <ShieldCheck className="h-5 w-5 text-black/40" />
            </div>
            {step === 'payment' && (
              <div className="mt-6">
                <p className="text-sm leading-7 text-black/[0.68]">
                  You will be securely redirected to Razorpay to complete your payment.
                </p>
                <button
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="button-primary mt-8 w-full justify-center bg-black text-white"
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </Reveal>
        </div>

        {/* Order Summary */}
        <div className="campaign-surface h-fit bg-black p-6 text-white sm:p-8">
          <p className="eyebrow text-white/[0.45]">Summary</p>
          <div className="mt-8 grid gap-4 text-sm uppercase tracking-[0.24em] text-white/[0.64]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.12] pt-4 text-white">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
