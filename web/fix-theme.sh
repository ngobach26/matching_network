# Install dependencies
echo "Installing dependencies..."
npm install

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Start development server
echo "Starting development server..."
npm run dev
