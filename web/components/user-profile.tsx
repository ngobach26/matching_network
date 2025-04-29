"use client"

import { useState } from "react"
import type { UserProfile as UserProfileType } from "@/data/users"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Car, User, FileText, Briefcase, MapPin, Calendar, Star, MessageCircle, Shield } from "lucide-react"

interface UserProfileProps {
  user: UserProfileType
  isOpen: boolean
  onClose: () => void
}

export function UserProfile({ user, isOpen, onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<string>(user.roles.length > 0 ? user.roles[0].type : "info")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleIcon = (type: string) => {
    switch (type) {
      case "rider":
        return <User className="h-5 w-5" />
      case "driver":
        return <Car className="h-5 w-5" />
      case "reviewer":
        return <FileText className="h-5 w-5" />
      case "candidate":
        return <Briefcase className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getRoleName = (type: string) => {
    switch (type) {
      case "rider":
        return "Rider"
      case "driver":
        return "Driver"
      case "reviewer":
        return "Reviewer"
      case "candidate":
        return "Candidate"
      default:
        return type
    }
  }

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const renderRoleContent = (role: (typeof user.roles)[0]) => {
    switch (role.type) {
      case "driver":
        return (
          <div className="space-y-4">
            {role.data && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-medium">{role.data.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{role.data.year}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Status</p>
                  <Badge className="mt-1 bg-green-500">Verified</Badge>
                </div>
              </>
            )}

            {role.rating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Rating</p>
                  {renderRatingStars(role.rating.average)}
                </div>
                <p className="text-sm text-muted-foreground">Based on {role.rating.count} rides</p>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <p className="font-medium">Recent Reviews</p>
                  {role.rating.testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-sm">{testimonial.text}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">— {testimonial.author}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "rider":
        return (
          <div className="space-y-4">
            {role.rating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Rider Rating</p>
                  {renderRatingStars(role.rating.average)}
                </div>
                <p className="text-sm text-muted-foreground">Based on {role.rating.count} rides</p>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <p className="font-medium">Driver Feedback</p>
                  {role.rating.testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-sm">{testimonial.text}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">— {testimonial.author}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "reviewer":
        return (
          <div className="space-y-4">
            {role.data && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Areas of Expertise</p>
                  <p className="font-medium">{role.data.expertise}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{role.data.institution}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-sm">{role.data.bio}</p>
                </div>
              </>
            )}

            {role.rating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Reviewer Rating</p>
                  {renderRatingStars(role.rating.average)}
                </div>
                <p className="text-sm text-muted-foreground">Based on {role.rating.count} reviews</p>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <p className="font-medium">Author Feedback</p>
                  {role.rating.testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-sm">{testimonial.text}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">— {testimonial.author}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "candidate":
        return (
          <div className="space-y-4">
            {role.data && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <p className="font-medium">{role.data.skills}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Preferences</p>
                  <p className="text-sm">{role.data.jobPreferences}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Location</p>
                  <p className="font-medium">{role.data.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resume</p>
                  <Button variant="outline" size="sm" className="mt-1" asChild>
                    <a href={role.data.resumeLink} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{user.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-primary" />
                <span>Verified User</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mt-2">
          {user.roles.map((role) => (
            <Badge key={role.type} variant="outline" className="flex items-center gap-1">
              {getRoleIcon(role.type)}
              <span>{getRoleName(role.type)}</span>
            </Badge>
          ))}
        </div>

        {user.bio && (
          <div className="mt-2">
            <p className="text-sm">{user.bio}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {user.roles.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${user.roles.length}, 1fr)` }}>
              {user.roles.map((role) => (
                <TabsTrigger key={role.type} value={role.type} className="flex items-center gap-1">
                  {getRoleIcon(role.type)}
                  <span className="hidden sm:inline">{getRoleName(role.type)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {user.roles.map((role) => (
              <TabsContent key={role.type} value={role.type} className="mt-4">
                {renderRoleContent(role)}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={onClose}>
            Close
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => {
              alert("Message feature coming soon!")
              onClose()
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
