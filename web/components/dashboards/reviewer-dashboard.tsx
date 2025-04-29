"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"

interface Paper {
  id: string
  title: string
  abstract: string
  authors: string
  status: "pending" | "accepted" | "rejected" | "completed"
  dueDate: string
}

export function ReviewerDashboard() {
  const [papers, setPapers] = useState<Paper[]>([
    {
      id: "paper-1",
      title: "Advances in Machine Learning for Natural Language Processing",
      abstract:
        "This paper presents a novel approach to natural language processing using advanced machine learning techniques...",
      authors: "J. Smith, A. Johnson",
      status: "pending",
      dueDate: "2023-09-15",
    },
    {
      id: "paper-2",
      title: "Quantum Computing: A New Paradigm",
      abstract:
        "We explore the potential of quantum computing to revolutionize computational capabilities across various domains...",
      authors: "R. Feynman, L. Susskind",
      status: "pending",
      dueDate: "2023-09-20",
    },
    {
      id: "paper-3",
      title: "Sustainable Energy Solutions for Urban Environments",
      abstract:
        "This research investigates innovative approaches to implementing sustainable energy solutions in densely populated urban areas...",
      authors: "E. Green, T. Eco",
      status: "completed",
      dueDate: "2023-08-30",
    },
  ])

  const handleAcceptPaper = (paperId: string) => {
    setPapers((prev) => prev.map((paper) => (paper.id === paperId ? { ...paper, status: "accepted" as const } : paper)))
  }

  const handleRejectPaper = (paperId: string) => {
    setPapers((prev) => prev.map((paper) => (paper.id === paperId ? { ...paper, status: "rejected" as const } : paper)))
  }

  const pendingPapers = papers.filter((paper) => paper.status === "pending")
  const acceptedPapers = papers.filter((paper) => paper.status === "accepted")
  const rejectedPapers = papers.filter((paper) => paper.status === "rejected")
  const completedPapers = papers.filter((paper) => paper.status === "completed")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paper Review Dashboard</CardTitle>
          <CardDescription>Manage your paper review assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-blue-100 p-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-xl font-bold">{pendingPapers.length}</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-green-100 p-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-xl font-bold">{acceptedPapers.length}</span>
                <span className="text-xs text-muted-foreground">Accepted</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-red-100 p-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-xl font-bold">{rejectedPapers.length}</span>
                <span className="text-xs text-muted-foreground">Rejected</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="rounded-full bg-gray-100 p-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                </div>
                <span className="text-xl font-bold">{completedPapers.length}</span>
                <span className="text-xs text-muted-foreground">Completed</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPapers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending papers to review.</p>
              </CardContent>
            </Card>
          ) : (
            pendingPapers.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <Badge className="bg-blue-500">Pending</Badge>
                  </div>
                  <CardDescription>Authors: {paper.authors}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{paper.abstract}</p>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1 text-orange-500" />
                    <span>Due: {paper.dueDate}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRejectPaper(paper.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => handleAcceptPaper(paper.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedPapers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No accepted papers.</p>
              </CardContent>
            </Card>
          ) : (
            acceptedPapers.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <Badge className="bg-green-500">Accepted</Badge>
                  </div>
                  <CardDescription>Authors: {paper.authors}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{paper.abstract}</p>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1 text-orange-500" />
                    <span>Due: {paper.dueDate}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Start Review</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedPapers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No rejected papers.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedPapers.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <Badge className="bg-red-500">Rejected</Badge>
                  </div>
                  <CardDescription>Authors: {paper.authors}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{paper.abstract}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPapers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No completed reviews.</p>
              </CardContent>
            </Card>
          ) : (
            completedPapers.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <Badge className="bg-gray-500">Completed</Badge>
                  </div>
                  <CardDescription>Authors: {paper.authors}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{paper.abstract}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Review
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

