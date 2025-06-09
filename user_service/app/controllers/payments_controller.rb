class PaymentsController < ApplicationController
  # POST /payments
  def create
    service_type    = params[:service_type]
    service_id      = params[:service_id]
    amount          = params[:amount]
    currency        = params[:currency] || "VND"
    payment_method  = params[:payment_method] || "vnpay"

    # Nếu là cash thì tạo invoice đã thanh toán, không tạo payment_url
    if payment_method == "cash"
      invoice = Invoice.create!(
        service_type: service_type,
        service_id: service_id,
        amount: amount,
        currency: currency,
        payment_method: payment_method,
        status: "paid"
      )

      render json: {
        success: true,
        invoice_id: invoice.id,
        status: invoice.status
      }, status: :ok
      return
    end

    # Ngược lại, các phương thức khác xử lý thanh toán như cũ
    invoice = Invoice.create!(
      service_type: service_type,
      service_id: service_id,
      amount: amount,
      currency: currency,
      payment_method: payment_method,
      status: "pending"
    )

    return_url = "#{ENV['FRONTEND_BASE_URL']}/ride"
    payment_service = VnpayPaymentService.new(invoice, return_url, request.remote_ip)

    render json: {
      payment_url: payment_service.payment_url,
      invoice_id: invoice.id
    }, status: :ok
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end


  # GET /vnpay_return
  def vnpay_return
    vnp_params = params.to_unsafe_h.select { |k, _| k.start_with?("vnp_") }
    received_hash = vnp_params.delete("vnp_SecureHash")
    vnp_params.delete("vnp_SecureHashType") # nếu có

    # Tạo chuỗi dữ liệu để ký
    sorted_data = vnp_params.sort.map { |k, v| "#{CGI.escape(k)}=#{CGI.escape(v.to_s)}" }.join("&")

    computed_hash = OpenSSL::HMAC.hexdigest(
      "SHA512",
      ENV.fetch("VNP_HASH_SECRET"),
      sorted_data
    )

    txn_ref = vnp_params["vnp_TxnRef"]
    invoice = Invoice.find_by(id: txn_ref)

    if invoice.present? &&
       received_hash == computed_hash &&
       vnp_params["vnp_ResponseCode"] == "00" &&
       vnp_params["vnp_TransactionStatus"] == "00"

      invoice.update(status: "paid")
      RideApiService.update_ride("664abc1234567890deff5678", {
        payment_status: "paid",
        actual_fare: 90000
      })
      render json: {
        status: "success",
        message: "Thanh toán thành công",
        invoice_id: invoice.id
      }, status: :ok

    else
      render json: {
        status: "fail",
        message: "Thanh toán thất bại hoặc không hợp lệ",
        invoice_id: invoice&.id
      }, status: :unprocessable_entity
    end
  end
end
