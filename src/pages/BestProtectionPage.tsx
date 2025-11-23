import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBestProtectionPackage, getProtectionPackages, assignProtectionPackage, completeBooking, unlockCar, ProtectionPackage } from '../services/api'
import { useApp } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, Check, Unlock, AlertCircle, Gift } from 'lucide-react'

export default function BestProtectionPage() {
  const navigate = useNavigate()
  const { user, bookingDetails } = useApp()
  const [bestProtectionPackage, setBestProtectionPackage] = useState<ProtectionPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingProtection, setAddingProtection] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserId = () => {
    if (user?.id) {
      return user.id
    }
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      return parseInt(storedUserId, 10)
    }
    return null
  }

  useEffect(() => {
    const fetchBestProtection = async () => {
      const userId = getUserId()
      const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')

      if (!userId) {
        setError('No user found. Please create a user first.')
        setLoading(false)
        return
      }

      if (!bookingId) {
        setError('No booking found. Please create a booking first.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const bestPackageResponse = await getBestProtectionPackage(userId)
        const protectionPackagesResponse = await getProtectionPackages(bookingId)

        const filteredPackage = protectionPackagesResponse.protectionPackages.find(
          (pkg: ProtectionPackage) => pkg.id === bestPackageResponse.protectionPackageId
        )

        if (!filteredPackage) {
          setError(`Protection package with ID ${bestPackageResponse.protectionPackageId} not found`)
          setLoading(false)
          return
        }

        setBestProtectionPackage(filteredPackage)
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching best protection package:', err)
        setError(err.message || 'Failed to load best protection package')
        setLoading(false)
      }
    }

    fetchBestProtection()
  }, [user, bookingDetails])

  const handleAddProtection = async () => {
    const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')

    if (!bookingId) {
      alert('No booking found. Please create a booking first.')
      return
    }

    if (!bestProtectionPackage) {
      alert('No protection package selected.')
      return
    }

    try {
      setAddingProtection(true)
      setError(null)

      await assignProtectionPackage(bookingId, bestProtectionPackage.id)
      setBestProtectionPackage({ ...bestProtectionPackage, isSelected: true })
      setAddingProtection(false)
    } catch (err: any) {
      console.error('Error adding protection:', err)
      setError(err.message || 'Failed to add protection package')
      setAddingProtection(false)
    }
  }

  const handleUnlockCar = async () => {
    const bookingId = bookingDetails?.id || localStorage.getItem('bookingId')

    if (!bookingId) {
      alert('No booking found. Please create a booking first.')
      return
    }

    try {
      setUnlocking(true)
      setError(null)

      await completeBooking(bookingId)
      await unlockCar()
      navigate('/car-control')
    } catch (err: any) {
      console.error('Error unlocking car:', err)
      setError(err.message || 'Failed to unlock car')
      setUnlocking(false)
      navigate('/car-control')
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading your best protection package...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !bestProtectionPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-lg font-semibold">{error ? 'Error' : 'No Protection Package Found'}</h2>
            <p className="text-sm text-muted-foreground text-center">
              {error || 'Unable to find the best protection package for you.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/personalized-deals')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate('/personalized-deals')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <Gift className="h-5 w-5" />
                Best Protection Package for You
              </h1>
              <p className="text-xs opacity-90 mt-1">AI-recommended based on your preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">{bestProtectionPackage.name}</CardTitle>
                {bestProtectionPackage.ratingStars > 0 && (
                  <div className="text-sm">
                    {'⭐'.repeat(bestProtectionPackage.ratingStars)}
                  </div>
                )}
              </div>
              <Badge variant="default" className="text-xs">AI Recommended</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {bestProtectionPackage.description && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground leading-relaxed">{bestProtectionPackage.description}</p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-md space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(bestProtectionPackage.price.displayPrice.amount, bestProtectionPackage.price.displayPrice.currency)}
                </span>
                <span className="text-sm text-muted-foreground">{bestProtectionPackage.price.displayPrice.suffix}</span>
                {bestProtectionPackage.price.discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {bestProtectionPackage.price.discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              {bestProtectionPackage.price.listPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  List Price: {formatPrice(bestProtectionPackage.price.listPrice.amount, bestProtectionPackage.price.listPrice.currency)}{bestProtectionPackage.price.listPrice.suffix}
                </p>
              )}
              <p className="text-sm font-semibold">
                Total: {formatPrice(bestProtectionPackage.price.totalPrice.amount, bestProtectionPackage.price.totalPrice.currency)}{bestProtectionPackage.price.totalPrice.suffix}
              </p>
            </div>

            {bestProtectionPackage.includes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Includes:</h4>
                <div className="space-y-2">
                  {bestProtectionPackage.includes.map((include, idx) => (
                    <div key={idx} className="p-3 bg-green-50 dark:bg-green-950 border-l-4 border-green-500 rounded-r-md">
                      <p className="text-xs font-semibold text-green-900 dark:text-green-100">{include.title}</p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">{include.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bestProtectionPackage.excludes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Excludes:</h4>
                <div className="space-y-2">
                  {bestProtectionPackage.excludes.map((exclude, idx) => (
                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 border-l-4 border-red-500 rounded-r-md">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-100">{exclude.title}</p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">{exclude.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-muted rounded-md text-center">
              <p className="text-xs font-semibold">
                Deductible: {formatPrice(bestProtectionPackage.deductibleAmount.value, bestProtectionPackage.deductibleAmount.currency)}
              </p>
            </div>

            <Separator />

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              {!bestProtectionPackage.isSelected && (
                <Button
                  className="w-full h-9"
                  onClick={handleAddProtection}
                  disabled={addingProtection}
                >
                  {addingProtection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Protection...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Add This Protection
                    </>
                  )}
                </Button>
              )}

              {bestProtectionPackage.isSelected && (
                <Button
                  className="w-full h-9 bg-green-600 hover:bg-green-700"
                  onClick={handleUnlockCar}
                  disabled={unlocking}
                >
                  {unlocking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unlocking Car...
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Finally Unlock the Car
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
