# app/controllers/api/s3_controller.rb
class S3Controller < ApplicationController
  before_action :authenticate_user!

  def presign
    file_name = params[:file_name]
    content_type = params[:content_type] || "image/jpeg"

    s3 = Aws::S3::Resource.new(region: ENV["AWS_REGION"])
    obj = s3.bucket(ENV["AWS_BUCKET"]).object("uploads/#{SecureRandom.hex}/#{file_name}")
    url = obj.presigned_url(:put, content_type: content_type, expires_in: 600)
    public_url = obj.public_url # Đây là url để lưu vào DB

    render json: { url: url, s3_url: public_url }
  end
end
