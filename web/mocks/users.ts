export const mockUsers = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    roles: ["rider", "driver"],
    isAdmin: false,
    profileCompleted: {
      rider: true,
      driver: true,
    },
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    roles: ["reviewer", "candidate"],
    isAdmin: false,
    profileCompleted: {
      reviewer: true,
      candidate: true,
    },
  },
  {
    id: "user-3",
    name: "Admin User",
    email: "admin@example.com",
    roles: ["rider", "driver", "reviewer", "candidate", "mentor", "mentee"],
    isAdmin: true,
    profileCompleted: {
      rider: true,
      driver: true,
      reviewer: true,
      candidate: true,
      mentor: true,
      mentee: true,
    },
  },
]

