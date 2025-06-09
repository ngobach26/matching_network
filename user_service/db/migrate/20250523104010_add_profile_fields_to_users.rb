class AddProfileFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :avatar_url, :string
    add_column :users, :cover_image_url, :string
    add_column :users, :phone_number, :string
    add_column :users, :bio, :text
    add_column :users, :date_of_birth, :date
    add_column :users, :address, :string
  end
end
