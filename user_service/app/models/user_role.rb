class UserRole < ApplicationRecord
  belongs_to :user, foreign_key: :user_id, optional: true
  belongs_to :role, foreign_key: :role_id, optional: true
end
