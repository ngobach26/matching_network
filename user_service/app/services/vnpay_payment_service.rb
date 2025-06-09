require "cgi"
require "openssl"
require "active_support/time"
require "bigdecimal"

class VnpayPaymentService
  def initialize(invoice, return_url, ip_addr, bank_code: nil)
    @invoice      = invoice
    @return_url   = return_url
    @ip_addr      = ip_addr
    @bank_code    = bank_code
    @vnp_url      = ENV.fetch("VNP_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
    @tmn_code     = ENV.fetch("VNP_TMN_CODE")
    @secret       = ENV.fetch("VNP_HASH_SECRET")
  end

  def payment_url
    time_vn = Time.now.in_time_zone("Asia/Ho_Chi_Minh")

    params = {
      "vnp_Version"   => "2.1.0",
      "vnp_Command"   => "pay",
      "vnp_TmnCode"   => @tmn_code,
      "vnp_Locale"    => "vn",
      "vnp_CurrCode"  => "VND",
      "vnp_TxnRef"    => @invoice.id.to_s,
      "vnp_OrderInfo" => "Thanh toan cho ma GD:#{@invoice.id}",
      "vnp_OrderType" => "other",
      "vnp_Amount"    => (BigDecimal(@invoice.amount.to_s) * 100).to_i,
      "vnp_ReturnUrl" => @return_url,
      "vnp_IpAddr"    => @ip_addr,
      "vnp_CreateDate"=> time_vn.strftime("%Y%m%d%H%M%S")
    }

    params["vnp_BankCode"] = @bank_code if @bank_code.present?

    # 1. Sắp xếp key ↑ A-Z
    sorted = params.sort.to_h

    # 2. Build chuỗi đã urlencode key & value rồi ký
    hash_data = sorted.map { |k, v| "#{CGI.escape(k)}=#{CGI.escape(v.to_s)}" }.join("&")
    secure    = OpenSSL::HMAC.hexdigest("SHA512", @secret, hash_data)

    "#{@vnp_url}?#{hash_data}&vnp_SecureHash=#{secure}"
  end
end
