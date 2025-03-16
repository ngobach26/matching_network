class User
  include Mongoid::Document
  include Mongoid::Timestamps

  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: Devise::JWT::RevocationStrategies::JTIMatcher

  field :email, type: String, default: ""
  field :encrypted_password, type: String, default: ""
  field :name, type: String
  field :bio, type: String
  field :preferences, type: Hash

  validates :email, presence: true, uniqueness: true
end
