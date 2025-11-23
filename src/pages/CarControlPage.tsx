import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lockCar, unlockCar, blinkCar } from '../services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Unlock, Lightbulb, Loader2, CheckCircle, AlertCircle, ArrowLeft, Car } from 'lucide-react'

export default function CarControlPage() {
  const navigate = useNavigate()
  const [locking, setLocking] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLock = async () => {
    try {
      setLocking(true)
      setError(null)
      setStatus(null)
      const response = await lockCar()
      setStatus('Car locked successfully!')
      console.log('Car locked:', response)
    } catch (err: any) {
      console.error('Error locking car:', err)
      setError(err.message || 'Failed to lock car')
    } finally {
      setLocking(false)
    }
  }

  const handleUnlock = async () => {
    try {
      setUnlocking(true)
      setError(null)
      setStatus(null)
      const response = await unlockCar()
      setStatus('Car unlocked successfully!')
      console.log('Car unlocked:', response)
    } catch (err: any) {
      console.error('Error unlocking car:', err)
      setError(err.message || 'Failed to unlock car')
    } finally {
      setUnlocking(false)
    }
  }

  const handleBlink = async () => {
    try {
      setBlinking(true)
      setError(null)
      setStatus(null)
      const response = await blinkCar()
      setStatus('Car lights blinked!')
      console.log('Car blinked:', response)
    } catch (err: any) {
      console.error('Error blinking car:', err)
      setError(err.message || 'Failed to blink car')
    } finally {
      setBlinking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
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
                <Car className="h-5 w-5" />
                Car Control
              </h1>
              <p className="text-xs opacity-90 mt-1">Control your rental car remotely</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Remote Car Control</CardTitle>
            <CardDescription>Manage your rental car from anywhere</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status && (
              <div className="flex items-center gap-2 p-3 text-sm bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-900 dark:text-green-100">{status}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                size="lg"
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={handleLock}
                disabled={locking || unlocking || blinking}
              >
                {locking ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Locking...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-6 w-6" />
                    <span className="text-xs font-semibold">Lock Car</span>
                  </>
                )}
              </Button>

              <Button
                size="lg"
                className="h-24 flex flex-col gap-2"
                onClick={handleUnlock}
                disabled={locking || unlocking || blinking}
              >
                {unlocking ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Unlocking...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-6 w-6" />
                    <span className="text-xs font-semibold">Unlock Car</span>
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-24 flex flex-col gap-2"
                onClick={handleBlink}
                disabled={locking || unlocking || blinking}
              >
                {blinking ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Blinking...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-6 w-6" />
                    <span className="text-xs font-semibold">Blink Lights</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
