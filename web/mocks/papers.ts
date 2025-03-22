export const mockPapers = [
  {
    id: "paper-1",
    title: "Advances in Machine Learning for Natural Language Processing",
    authors: ["John Smith", "Jane Doe"],
    abstract:
      "This paper explores recent advances in machine learning techniques for natural language processing tasks...",
    keywords: ["machine learning", "NLP", "deep learning"],
    topic: "Computer Science",
    length: 12,
    status: "pending",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "paper-2",
    title: "Quantum Computing: Current State and Future Directions",
    authors: ["Robert Johnson", "Maria Garcia"],
    abstract: "We review the current state of quantum computing research and discuss potential future directions...",
    keywords: ["quantum computing", "quantum algorithms", "qubits"],
    topic: "Physics",
    length: 15,
    status: "pending",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "paper-3",
    title: "Sustainable Energy Solutions for Urban Environments",
    authors: ["David Chen", "Sarah Williams"],
    abstract: "This paper examines sustainable energy solutions that can be implemented in urban environments...",
    keywords: ["sustainable energy", "urban planning", "renewable resources"],
    topic: "Environmental Science",
    length: 10,
    status: "pending",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

