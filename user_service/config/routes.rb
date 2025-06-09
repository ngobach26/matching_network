Rails.application.routes.draw do
  devise_for :users, path: "", path_names: {
    sign_in: "login",
    sign_out: "logout",
    registration: "signup"
  },
  controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # User profile routes
  get "me", to: "users/users#me"
  patch "me", to: "users/users#update"
  get "users", to: "users/users#index"
  get "users/:id", to: "users/users#show" # <-- thêm dòng này

  # Payments
  resources :payments, only: [ :create ]
  get "/vnpay_return", to: "payments#vnpay_return", as: :vnpay_return

  # root "posts#index"
end
