# app/controllers/users/passwords_controller.rb
class Users::PasswordsController < ApplicationController
  before_action :authenticate_user!
  respond_to :json

  # PATCH /api/users/password
  def update
    user = current_user

    if user.update_with_password(password_update_params)
      render json: {
        status: { code: 200, message: "Password updated successfully." }
      }
    else
      render json: {
        status: { code: 422, message: "Password update failed.", errors: user.errors.full_messages }
      }, status: :unprocessable_entity
    end
  end

  private

  def password_update_params
    params.require(:user).permit(:current_password, :password, :password_confirmation)
  end
end
