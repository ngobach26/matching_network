"use client"

// components/steps/StepRateDriver.tsx

import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star } from "lucide-react"
import type { Ride, RideDetail } from "@/lib/api-client"

interface Props {
  ride: RideDetail | null
  rating: number
  comment: string
  onChangeRating: (value: number) => void
  onChangeComment: (value: string) => void
  onSubmitRating: () => void
  isSubmitting: boolean
  ratingSubmitted: boolean
  onNewRide: () => void
}

export function StepRateDriver({
  ride,
  rating,
  comment,
  onChangeRating,
  onChangeComment,
  onSubmitRating,
  isSubmitting,
  ratingSubmitted,
  onNewRide,
}: Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ride Completed</CardTitle>
            <CardDescription>Thank you for riding with us!</CardDescription>
          </div>
          <div className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">Completed</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Trip Fare</span>
          <span className="font-medium">
            {ride?.ride.fare.total_fare ? formatCurrency(ride?.ride.fare.total_fare) : formatCurrency(15500)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Driver Earning</span>
          <span className="font-medium">
            {ride?.ride.fare.driver_earnings ? formatCurrency(ride?.ride.fare.driver_earnings) : formatCurrency(15500)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Distance</span>
          <span className="font-medium">
            {ride?.ride.estimated_distance ? `${ride.ride.estimated_distance.toFixed(1)} km` : "3.2 km"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">
            {ride?.ride.estimated_duration ? `${ride.ride.estimated_duration.toFixed(1)} minutes` : "12 minutes"}
          </span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Rate your driver</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${rating >= star ? "text-yellow-500" : "text-gray-300"} cursor-pointer`}
                  onClick={() => !ratingSubmitted && onChangeRating(star)}
                />
              ))}
            </div>
          </div>

          {!ratingSubmitted ? (
            <>
              <div>
                <Textarea
                  value={comment}
                  onChange={(e) => onChangeComment(e.target.value)}
                  placeholder="Leave a comment (optional)"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                onClick={onSubmitRating}
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </>
          ) : (
            <div className="bg-green-50 p-3 rounded-md text-center text-green-700">
              <p className="font-medium">Thank you for your feedback!</p>
              <p className="text-sm">Your rating has been submitted.</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={onNewRide}>
          Request New Ride
        </Button>
      </CardFooter>
    </Card>
  )
}
