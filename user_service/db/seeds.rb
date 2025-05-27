# db/seeds.rb

puts "🌱 Bắt đầu seed..."

require 'faker'
Faker::Config.locale = 'vi'

# --- Seed Roles ---
roles = [
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
def random_avatar_url(i)
  # Unsplash user face photos, change `sig` for different avatar
  "https://randomuser.me/api/portraits/men/#{i % 100}.jpg"
end

def random_cover_url(i)
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80&#{i}"
end

def random_phone
  "09#{rand(100000000..999999999).to_s[0..7]}"
end

20.times do |i|
  # --- USERS ---
  user_name = Faker::Name.name
  user_email = "user#{i+1}@example.com"
  user = User.find_or_initialize_by(email: user_email)
  user.name = user_name
  user.password = "password"
  user.avatar_url = random_avatar_url(i+1)
  user.cover_image_url = random_cover_url(i+1)
  user.phone_number = random_phone
  user.bio = Faker::Lorem.sentence(word_count: 8)
  user.date_of_birth = Faker::Date.birthday(min_age: 18, max_age: 45)
  user.address = Faker::Address.full_address
  if user.save
    puts "✅ Đã tạo/cập nhật user: #{user.email} | #{user.phone_number}"
  else
    puts "⚠️ Lỗi khi tạo user: #{user.email} - #{user.errors.full_messages.join(', ')}"
  end
end

20.times do |i|
  # --- DRIVERS ---
  driver_name = Faker::Name.name
  driver_email = "driver#{i+1}@example.com"
  driver = User.find_or_initialize_by(email: driver_email)
  driver.name = driver_name
  driver.password = "password"
  driver.avatar_url = random_avatar_url(i+21)
  driver.cover_image_url = random_cover_url(i+21)
  driver.phone_number = random_phone
  driver.bio = Faker::Lorem.sentence(word_count: 8)
  driver.date_of_birth = Faker::Date.birthday(min_age: 23, max_age: 50)
  driver.address = Faker::Address.full_address
  if driver.save
    puts "✅ Đã tạo/cập nhật driver: #{driver.email} | #{driver.phone_number}"
    role = Role.find_by(name: "driver")
    if role && !UserRole.exists?(user_id: driver.id, role_id: role.id)
      UserRole.create!(user_id: driver.id, role_id: role.id)
      puts "→ Gán role 'driver' cho #{driver.email}"
    end
  else
    puts "⚠️ Lỗi khi tạo driver: #{driver.email} - #{driver.errors.full_messages.join(', ')}"
  end
end

puts "🌱 Seed hoàn tất!"
