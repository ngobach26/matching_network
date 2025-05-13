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

  def update
    if current_user.update(user_params)
      render json: {
        message: "Profile updated successfully",
        user: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name
        }
      }, status: :ok
    else
      render json: {
        errors: current_user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def index
    users = User.all.includes(:roles)
    render json: users.map { |user|
      {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.pluck(:name)
      }
    }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:name, :email)
  end
end
