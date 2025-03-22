export const mockAdminStats = {
  usersByRole: {
    rider: 245,
    driver: 187,
    reviewer: 92,
    candidate: 156,
    mentor: 68,
    mentee: 112,
  },
  matchesByScenario: {
    "ride-sharing": 1245,
    "paper-review": 567,
    "job-matching": 892,
    mentorship: 423,
  },
  activeUsers: 578,
  totalMatches: 3127,
  completedMatches: 2845,
  pendingMatches: 282,
  matchSuccessRate: 91,
}

export const mockMatchingConfigs = [
  {
    id: "ride-sharing",
    name: "Ride Sharing",
    description: "Match riders with drivers",
    algorithm: "hungarian",
    attributes: [
      { id: "location", name: "Location Proximity", weight: 40, enabled: true },
      { id: "schedule", name: "Schedule Compatibility", weight: 30, enabled: true },
      { id: "rating", name: "User Rating", weight: 20, enabled: true },
      { id: "preference", name: "User Preferences", weight: 10, enabled: true },
    ],
    settings: {
      oneToMany: true,
      maxMatches: 3,
      minScore: 60,
    },
  },
  {
    id: "paper-review",
    name: "Paper Review",
    description: "Match papers with reviewers",
    algorithm: "gale-shapley",
    attributes: [
      { id: "expertise", name: "Expertise Match", weight: 50, enabled: true },
      { id: "workload", name: "Reviewer Workload", weight: 20, enabled: true },
      { id: "conflicts", name: "Conflict of Interest", weight: 30, enabled: true },
    ],
    settings: {
      oneToMany: true,
      maxMatches: 5,
      minScore: 70,
    },
  },
  {
    id: "job-matching",
    name: "Job Matching",
    description: "Match job seekers with job postings",
    algorithm: "hungarian",
    attributes: [
      { id: "skills", name: "Skills Match", weight: 40, enabled: true },
      { id: "experience", name: "Experience Level", weight: 30, enabled: true },
      { id: "location", name: "Location", weight: 20, enabled: true },
      { id: "salary", name: "Salary Expectations", weight: 10, enabled: true },
    ],
    settings: {
      oneToMany: false,
      maxMatches: 1,
      minScore: 75,
    },
  },
  {
    id: "mentorship",
    name: "Mentorship",
    description: "Match mentors with mentees",
    algorithm: "gale-shapley",
    attributes: [
      { id: "expertise", name: "Expertise Areas", weight: 35, enabled: true },
      { id: "goals", name: "Goals Alignment", weight: 35, enabled: true },
      { id: "availability", name: "Availability", weight: 20, enabled: true },
      { id: "communication", name: "Communication Style", weight: 10, enabled: true },
    ],
    settings: {
      oneToMany: true,
      maxMatches: 3,
      minScore: 65,
    },
  },
]

export const mockAlgorithms = [
  {
    id: "gale-shapley",
    name: "Gale-Shapley",
    description: "Stable matching algorithm that guarantees stable pairs",
  },
  {
    id: "hungarian",
    name: "Hungarian Algorithm",
    description: "Optimal assignment algorithm that minimizes total cost",
  },
  {
    id: "greedy",
    name: "Greedy Matching",
    description: "Simple algorithm that matches based on highest scores first",
  },
]

