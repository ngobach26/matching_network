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
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "me", to: "users/users#me"
  patch "me", to: "users/users#update"
  get "users", to: "users/users#index"
  resources :payments, only: [ :create ]
  get "/vnpay_return", to: "payments#vnpay_return", as: :vnpay_return
  # Defines the root path route ("/")
  # root "posts#index"
end
