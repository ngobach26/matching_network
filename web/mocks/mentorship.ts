export const mockMentorships = [
  {
    id: "mentorship-1",
    mentor: {
      id: "user-5",
      name: "Dr. Michael Chen",
      title: "Senior Data Scientist",
      company: "DataTech Inc.",
      expertise: ["Machine Learning", "Data Analysis", "Python"],
      rating: 4.9,
    },
    mentee: {
      id: "user-6",
      name: "Emily Johnson",
      goals: ["Learn machine learning", "Career transition to data science"],
      background: "Software Developer with 3 years experience",
    },
    topics: ["Machine Learning Fundamentals", "Career Guidance", "Project Portfolio"],
    matchScore: 95,
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mentorship-2",
    mentor: {
      id: "user-7",
      name: "Sarah Williams",
      title: "Engineering Manager",
      company: "TechGiant",
      expertise: ["Leadership", "Software Architecture", "Career Development"],
      rating: 4.7,
    },
    mentee: {
      id: "user-8",
      name: "David Rodriguez",
      goals: ["Transition to management", "Improve leadership skills"],
      background: "Senior Developer with 7 years experience",
    },
    topics: ["Engineering Management", "Team Leadership", "Technical Decision Making"],
    matchScore: 88,
    status: "pending",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

