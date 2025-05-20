# app/models/invoice.rb
class Invoice < ApplicationRecord
  STATUSES = %w[pending paid failed cancelled]
  PAYMENT_METHODS = %w[vnpay]

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }
  validates :payment_method, inclusion: { in: PAYMENT_METHODS }

  def service_object
    {
      type: service_type,
      id: service_id
    }
  end

  # Dễ check tình trạng
  def paid?
    status == "paid"
  end
end
