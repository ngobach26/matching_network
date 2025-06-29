class Users::UsersController < ApplicationController
  before_action :authenticate_user!

  def me
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        name: current_user.name,
        roles: current_user.roles.pluck(:name),
        avatar_url: current_user.avatar_url,
        cover_image_url: current_user.cover_image_url,
        phone_number: current_user.phone_number,
        bio: current_user.bio,
        date_of_birth: current_user.date_of_birth&.iso8601,
        address: current_user.address
      }
    }
  end

  def show
    user = User.includes(:roles).find_by(id: params[:id])
    if user
      render json: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles.pluck(:name),
          avatar_url: user.avatar_url,
          cover_image_url: user.cover_image_url,
          phone_number: user.phone_number,
          bio: user.bio,
          date_of_birth: user.date_of_birth&.iso8601,
          address: user.address,
          created_at: user.created_at&.iso8601,
          updated_at: user.updated_at&.iso8601
        }
      }, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end

  def update
    if current_user.update(user_params)
      render json: {
        user: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name,
          roles: current_user.roles.pluck(:name),
          avatar_url: current_user.avatar_url,
          cover_image_url: current_user.cover_image_url,
          phone_number: current_user.phone_number,
          bio: current_user.bio,
          date_of_birth: current_user.date_of_birth&.iso8601,
          address: current_user.address,
          created_at: current_user.created_at&.iso8601,
          updated_at: current_user.updated_at&.iso8601
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
        roles: user.roles.pluck(:name),
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        phone_number: user.phone_number,
        bio: user.bio,
        date_of_birth: user.date_of_birth&.iso8601,
        address: user.address,
        created_at: user.created_at&.iso8601,
        updated_at: user.updated_at&.iso8601
      }
    }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(
      :name,
      :email,
      :phone_number,
      :date_of_birth,
      :address,
      :bio,
      :avatar_url,
      :cover_image_url
    )
  end
end
