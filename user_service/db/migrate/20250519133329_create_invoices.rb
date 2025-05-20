# db/migrate/xxxxx_create_invoices.rb
class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices do |t|
      t.string :service_type
      t.string :service_id

      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :currency, default: 'VND'

      t.string :payment_method          # vnpay, cod, momo, etc.
      t.string :status, default: 'pending'  # pending, paid, failed, cancelled

      t.datetime :paid_at
      t.text :meta_data                 # JSON lưu info phụ (có thể dùng PostgreSQL jsonb nếu muốn)

      t.timestamps
    end

    add_index :invoices, [ :service_type, :service_id ], name: "index_invoices_on_service"
  end
end
