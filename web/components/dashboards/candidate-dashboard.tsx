"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Briefcase, MapPin, Building, DollarSign, Clock, BookmarkPlus, Send, CheckCircle } from "lucide-react"
import { UserProfileButton } from "@/components/user-profile-button"

interface Job {
  id: string
  title: string
  company: string
  companyId?: string
  location: string
  salary: string
  description: string
  requirements: string[]
  posted: string
  saved: boolean
  applied: boolean
  contactPersonId?: string
}

export function CandidateDashboard() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "job-1",
      title: "Frontend Developer",
      company: "TechCorp Inc.",
      companyId: "user-3", // Using a user as a company contact for demo
      location: "San Francisco, CA",
      salary: "$90,000 - $120,000",
      description:
        "We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces and implementing web designs.",
      requirements: [
        "3+ years of experience with React",
        "Strong knowledge of JavaScript, HTML, and CSS",
        "Experience with responsive design",
        "Bachelor's degree in Computer Science or related field",
      ],
      posted: "2 days ago",
      saved: false,
      applied: false,
      contactPersonId: "user-3",
    },
    {
      id: "job-2",
      title: "UX/UI Designer",
      company: "DesignHub",
      companyId: "user-5", // Using a user as a company contact for demo
      location: "Remote",
      salary: "$80,000 - $110,000",
      description:
        "Join our creative team as a UX/UI Designer. You will create user-centered designs for web and mobile applications.",
      requirements: [
        "Portfolio demonstrating UX/UI design skills",
        "Experience with Figma, Sketch, or Adobe XD",
        "Understanding of user research and testing",
        "Strong communication skills",
      ],
      posted: "1 week ago",
      saved: false,
      applied: false,
      contactPersonId: "user-5",
    },
    {
      id: "job-3",
      title: "Full Stack Developer",
      company: "Innovate Solutions",
      companyId: "user-1", // Using a user as a company contact for demo
      location: "New York, NY",
      salary: "$100,000 - $140,000",
      description:
        "We're seeking a Full Stack Developer to work on our enterprise applications. You'll be involved in all aspects of development from database to frontend.",
      requirements: [
        "5+ years of experience in full stack development",
        "Proficiency in Node.js, React, and SQL/NoSQL databases",
        "Experience with cloud services (AWS, Azure, or GCP)",
        "Strong problem-solving skills",
      ],
      posted: "3 days ago",
      saved: true,
      applied: true,
      contactPersonId: "user-1",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  const handleSaveJob = (jobId: string) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job)))
  }

  const handleApplyJob = (job: Job) => {
    setSelectedJob(job)
    setIsApplyDialogOpen(true)
  }

  const handleSubmitApplication = () => {
    if (selectedJob) {
      setJobs((prev) => prev.map((job) => (job.id === selectedJob.id ? { ...job, applied: true } : job)))
      setIsApplied(true)

      // Reset after some time
      setTimeout(() => {
        setIsApplied(false)
        setIsApplyDialogOpen(false)
      }, 2000)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const savedJobs = jobs.filter((job) => job.saved)
  const appliedJobs = jobs.filter((job) => job.applied)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Search</CardTitle>
          <CardDescription>Find your next opportunity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search jobs, companies, or locations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90">Search</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-primary/20 p-2 mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">{filteredJobs.length}</span>
                <span className="text-xs text-muted-foreground">Jobs Found</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mb-2">
                  <BookmarkPlus className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xl font-bold">{savedJobs.length}</span>
                <span className="text-xs text-muted-foreground">Saved Jobs</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 mb-2">
                  <Send className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
                <span className="text-xl font-bold">{appliedJobs.length}</span>
                <span className="text-xs text-muted-foreground">Applications</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No jobs found matching your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                        {job.contactPersonId && (
                          <UserProfileButton
                            userId={job.contactPersonId}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1"
                            label="View Contact"
                          />
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {job.saved && <Badge className="bg-blue-500">Saved</Badge>}
                      {job.applied && <Badge className="bg-green-500">Applied</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 ${job.saved ? "text-blue-500 border-blue-500" : ""}`}
                    onClick={() => handleSaveJob(job.id)}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    {job.saved ? "Saved" : "Save"}
                  </Button>
                  <Button className="flex-1" disabled={job.applied} onClick={() => handleApplyJob(job)}>
                    <Send className="mr-2 h-4 w-4" />
                    {job.applied ? "Applied" : "Apply"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">You haven't saved any jobs yet.</p>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                        {job.contactPersonId && (
                          <UserProfileButton
                            userId={job.contactPersonId}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1"
                            label="View Contact"
                          />
                        )}
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-500">Saved</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-blue-500 border-blue-500"
                    onClick={() => handleSaveJob(job.id)}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Unsave
                  </Button>
                  <Button className="flex-1" disabled={job.applied} onClick={() => handleApplyJob(job)}>
                    <Send className="mr-2 h-4 w-4" />
                    {job.applied ? "Applied" : "Apply"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="applied" className="space-y-4">
          {appliedJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
              </CardContent>
            </Card>
          ) : (
            appliedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                        {job.contactPersonId && (
                          <UserProfileButton
                            userId={job.contactPersonId}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1"
                            label="View Contact"
                          />
                        )}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-500">Applied</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Applied on {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Application
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {!isApplied ? (
            <>
              <DialogHeader>
                <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                <DialogDescription>Submit your application to {selectedJob?.company}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <textarea
                    id="coverLetter"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    placeholder="Explain why you're a good fit for this position..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Input id="resume" type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmitApplication}>
                  Submit Application
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Application Submitted!</h3>
              <p className="text-center text-muted-foreground">
                Your application for {selectedJob?.title} at {selectedJob?.company} has been submitted successfully.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

