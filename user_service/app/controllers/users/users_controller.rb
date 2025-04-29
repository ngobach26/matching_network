class Users::UsersController < ApplicationController
  before_action :authenticate_user!

  def me
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        name: current_user.name,
        roles: current_user.roles.pluck(:name)
      }
    }
  end
end
