import type { RoleType } from "@/context/role-context"

export interface UserRating {
  average: number
  count: number
  testimonials: {
    text: string
    author: string
    rating: number
  }[]
}

export interface UserProfile {
  id: string
  name: string
  username: string
  avatarUrl?: string
  bio?: string
  location?: string
  roles: {
    type: RoleType
    isComplete: boolean
    data?: any
    rating?: UserRating
  }[]
  joinedDate: string
  isPublic: boolean
}

export const mockUsers: UserProfile[] = [
  {
    id: "user-1",
    name: "Michael Johnson",
    username: "michael_j",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Professional driver with 5+ years of experience. Safe and reliable rides guaranteed.",
    location: "San Francisco, CA",
    roles: [
      {
        type: "driver",
        isComplete: true,
        data: {
          vehicle: "Toyota Camry (White)",
          license: "DL-12345",
          year: "2020",
          insurance: "INS-67890",
        },
        rating: {
          average: 4.8,
          count: 120,
          testimonials: [
            {
              text: "Great driver, very punctual and professional!",
              author: "John D.",
              rating: 5,
            },
            {
              text: "Clean car and smooth ride. Would recommend.",
              author: "Sarah T.",
              rating: 5,
            },
            {
              text: "Good experience overall, but was a bit late.",
              author: "Alex M.",
              rating: 4,
            },
          ],
        },
      },
    ],
    joinedDate: "2021-03-15",
    isPublic: true,
  },
  {
    id: "user-2",
    name: "Sarah Thompson",
    username: "sarah_t",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Frequent rider, always on time for pickups.",
    location: "New York, NY",
    roles: [
      {
        type: "rider",
        isComplete: true,
        data: {
          homeAddress: "123 Main St, Downtown",
          workAddress: "456 Park Ave, Uptown",
          preferredPaymentMethod: "Credit Card",
        },
        rating: {
          average: 4.9,
          count: 45,
          testimonials: [
            {
              text: "Great passenger, always ready on time.",
              author: "Michael J.",
              rating: 5,
            },
            {
              text: "Very polite and respectful.",
              author: "David W.",
              rating: 5,
            },
          ],
        },
      },
    ],
    joinedDate: "2022-01-10",
    isPublic: true,
  },
  {
    id: "user-3",
    name: "Dr. Jane Smith",
    username: "dr_jane",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Professor of Computer Science with expertise in AI and Machine Learning.",
    location: "Boston, MA",
    roles: [
      {
        type: "reviewer",
        isComplete: true,
        data: {
          expertise: "Machine Learning, Computer Vision, Natural Language Processing",
          institution: "MIT",
          bio: "Published over 50 papers in top-tier conferences and journals.",
        },
        rating: {
          average: 4.7,
          count: 32,
          testimonials: [
            {
              text: "Thorough review with constructive feedback.",
              author: "Anonymous",
              rating: 5,
            },
            {
              text: "Detailed comments that significantly improved my paper.",
              author: "Anonymous",
              rating: 5,
            },
            {
              text: "Review was a bit delayed, but very comprehensive.",
              author: "Anonymous",
              rating: 4,
            },
          ],
        },
      },
    ],
    joinedDate: "2020-09-05",
    isPublic: true,
  },
  {
    id: "user-4",
    name: "Robert Chen",
    username: "robert_c",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Software Engineer with 8+ years of experience in full-stack development.",
    location: "Seattle, WA",
    roles: [
      {
        type: "candidate",
        isComplete: true,
        data: {
          skills: "JavaScript, React, Node.js, Python, AWS",
          resumeLink: "https://example.com/resume",
          jobPreferences: "Looking for remote senior developer positions in tech startups.",
          location: "Remote or Seattle, WA",
        },
      },
    ],
    joinedDate: "2022-05-20",
    isPublic: true,
  },
  {
    id: "user-5",
    name: "Emily Davis",
    username: "emily_d",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Experienced driver and occasional rider.",
    location: "Chicago, IL",
    roles: [
      {
        type: "driver",
        isComplete: true,
        data: {
          vehicle: "Honda Civic (Blue)",
          license: "DL-67890",
          year: "2021",
          insurance: "INS-12345",
        },
        rating: {
          average: 4.6,
          count: 85,
          testimonials: [
            {
              text: "Very friendly and professional driver.",
              author: "Mark L.",
              rating: 5,
            },
            {
              text: "Clean car and smooth ride.",
              author: "Jessica K.",
              rating: 4,
            },
          ],
        },
      },
      {
        type: "rider",
        isComplete: true,
        data: {
          homeAddress: "789 Oak St, North Side",
          workAddress: "101 Pine Ave, Downtown",
          preferredPaymentMethod: "PayPal",
        },
        rating: {
          average: 4.8,
          count: 12,
          testimonials: [
            {
              text: "Great passenger, always on time.",
              author: "Anonymous",
              rating: 5,
            },
          ],
        },
      },
    ],
    joinedDate: "2021-11-30",
    isPublic: true,
  },
  // Adding more mock users for search functionality
  {
    id: "user-6",
    name: "David Wilson",
    username: "david_w",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Experienced driver with a focus on customer satisfaction.",
    location: "Los Angeles, CA",
    roles: [
      {
        type: "driver",
        isComplete: true,
        data: {
          vehicle: "Tesla Model 3 (Black)",
          license: "DL-54321",
          year: "2022",
          insurance: "INS-98765",
        },
        rating: {
          average: 4.9,
          count: 150,
          testimonials: [
            {
              text: "Best driver I've ever had! Very professional and friendly.",
              author: "Emma S.",
              rating: 5,
            },
            {
              text: "Excellent service and very clean car.",
              author: "James T.",
              rating: 5,
            },
          ],
        },
      },
    ],
    joinedDate: "2021-05-10",
    isPublic: true,
  },
  {
    id: "user-7",
    name: "Jessica Kim",
    username: "jessica_k",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Frequent rider and tech enthusiast.",
    location: "Austin, TX",
    roles: [
      {
        type: "rider",
        isComplete: true,
        data: {
          homeAddress: "456 Tech Blvd, North Austin",
          workAddress: "789 Startup Ave, Downtown",
          preferredPaymentMethod: "Apple Pay",
        },
        rating: {
          average: 4.7,
          count: 35,
          testimonials: [
            {
              text: "Great passenger, always ready when I arrive.",
              author: "David W.",
              rating: 5,
            },
            {
              text: "Pleasant conversation and respectful.",
              author: "Michael J.",
              rating: 4,
            },
          ],
        },
      },
      {
        type: "candidate",
        isComplete: true,
        data: {
          skills: "UX/UI Design, Product Management, Figma, Sketch",
          resumeLink: "https://example.com/jessica-resume",
          jobPreferences: "Looking for product design roles in tech companies.",
          location: "Austin, TX or Remote",
        },
      },
    ],
    joinedDate: "2022-03-15",
    isPublic: true,
  },
  {
    id: "user-8",
    name: "Alex Martinez",
    username: "alex_m",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Academic researcher and reviewer with expertise in computer science.",
    location: "Cambridge, MA",
    roles: [
      {
        type: "reviewer",
        isComplete: true,
        data: {
          expertise: "Artificial Intelligence, Robotics, Computer Vision",
          institution: "Harvard University",
          bio: "Associate Professor with over 30 published papers in top journals.",
        },
        rating: {
          average: 4.8,
          count: 40,
          testimonials: [
            {
              text: "Excellent reviewer with insightful comments.",
              author: "Anonymous",
              rating: 5,
            },
            {
              text: "Very thorough and constructive feedback.",
              author: "Anonymous",
              rating: 5,
            },
          ],
        },
      },
    ],
    joinedDate: "2020-11-20",
    isPublic: true,
  },
  {
    id: "user-9",
    name: "Olivia Johnson",
    username: "olivia_j",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Software developer looking for new opportunities in tech.",
    location: "Denver, CO",
    roles: [
      {
        type: "candidate",
        isComplete: true,
        data: {
          skills: "Java, Spring Boot, React, AWS, Docker",
          resumeLink: "https://example.com/olivia-resume",
          jobPreferences: "Seeking senior backend developer roles in fintech or healthcare.",
          location: "Denver, CO or Remote",
        },
      },
      {
        type: "rider",
        isComplete: true,
        data: {
          homeAddress: "123 Mountain View, Denver",
          workAddress: "456 Tech Park, Downtown Denver",
          preferredPaymentMethod: "Credit Card",
        },
        rating: {
          average: 4.6,
          count: 25,
          testimonials: [
            {
              text: "Great passenger, always on time.",
              author: "David W.",
              rating: 5,
            },
          ],
        },
      },
    ],
    joinedDate: "2022-01-05",
    isPublic: true,
  },
  {
    id: "user-10",
    name: "James Taylor",
    username: "james_t",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Part-time driver and music enthusiast.",
    location: "Nashville, TN",
    roles: [
      {
        type: "driver",
        isComplete: true,
        data: {
          vehicle: "Hyundai Sonata (Silver)",
          license: "DL-78901",
          year: "2019",
          insurance: "INS-23456",
        },
        rating: {
          average: 4.7,
          count: 65,
          testimonials: [
            {
              text: "Great conversation and smooth ride!",
              author: "Jessica K.",
              rating: 5,
            },
            {
              text: "Very knowledgeable about the city.",
              author: "Robert C.",
              rating: 4,
            },
          ],
        },
      },
    ],
    joinedDate: "2021-08-15",
    isPublic: true,
  },
]

export function getUserById(id: string): UserProfile | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function getUsersByRole(role: RoleType): UserProfile[] {
  return mockUsers.filter((user) => user.isPublic && user.roles.some((r) => r.type === role))
}

