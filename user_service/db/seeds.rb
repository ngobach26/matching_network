# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# db/seeds.rb

puts "🌱 Bắt đầu seed..."

# --- Seed Roles ---
roles = [
  { name: 'rider', description: 'Người yêu cầu chuyến đi' },
  { name: 'driver', description: 'Người điều khiển phương tiện' }
]

roles.each do |role_attrs|
  role = Role.find_or_initialize_by(name: role_attrs[:name])
  role.description = role_attrs[:description]
  if role.save
    puts "✅ Đã tạo hoặc cập nhật role: #{role.name}"
  else
    puts "⚠️ Lỗi khi tạo role: #{role.name} - #{role.errors.full_messages.join(', ')}"
  end
end

# --- Seed Users ---
users = [
  {
    name: "Rider User",
    email: "rider@example.com",
    password: "password",
    roles: [ "rider" ]
  },
  {
    name: "Driver User",
    email: "driver@example.com",
    password: "password",
    roles: [ "driver" ]
  }
]

users.each do |user_attrs|
  user = User.find_or_initialize_by(email: user_attrs[:email])
  user.name = user_attrs[:name]
  user.password = user_attrs[:password]
  if user.save
    puts "✅ Đã tạo hoặc cập nhật user: #{user.email}"

    user_attrs[:roles].each do |role_name|
      role = Role.find_by(name: role_name)
      if role && !UserRole.exists?(user_id: user.id, role_id: role.id)
        UserRole.create!(user_id: user.id, role_id: role.id)
        puts "→ Gán role '#{role_name}' cho #{user.email}"
      end
    end
  else
    puts "⚠️ Lỗi khi tạo user: #{user.email} - #{user.errors.full_messages.join(', ')}"
  end
end

puts "🌱 Seed hoàn tất!"
