import numpy as np

class LinUCBAgent:
    def __init__(self, n_arms, context_dim, alpha=0.4):
        self.n_arms = n_arms
        self.d = context_dim
        self.alpha = alpha
        self.A = [np.identity(self.d) for _ in range(n_arms)]
        self.b = [np.zeros((self.d, 1)) for _ in range(n_arms)]

    def select(self, context):
        context = context.reshape(-1, 1)
        p = []
        for i in range(self.n_arms):
            A_inv = np.linalg.inv(self.A[i])
            theta = A_inv @ self.b[i]
            p_val = float(theta.T @ context + self.alpha * np.sqrt(context.T @ A_inv @ context))
            p.append(p_val)
        return np.argmax(p)

    def update(self, chosen_arm, context, reward):
        context = context.reshape(-1, 1)
        self.A[chosen_arm] += context @ context.T
        self.b[chosen_arm] += reward * context
