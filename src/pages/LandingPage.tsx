import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/user-creation')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Sixt</h1>
          <p className="text-muted-foreground text-sm">Your premium car rental experience starts here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="text-3xl mb-2">🚗</div>
              <CardTitle className="text-base">Premium Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Choose from our wide selection of luxury and premium cars
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="text-3xl mb-2">⚡</div>
              <CardTitle className="text-base">Best Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Exclusive discounts and offers tailored just for you
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="text-3xl mb-2">✨</div>
              <CardTitle className="text-base">Personalized Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Get recommendations based on your preferences
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleGetStarted} className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
