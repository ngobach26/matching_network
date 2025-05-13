#!/bin/bash

echo "⏳ Waiting for Kafka to be ready..."

while ! nc -z kafka 9092; do
  sleep 1
done

echo "✅ Kafka is up."

# Hàm tạo topic
create_topic () {
  local topic=$1
  echo "🚀 Creating topic: $topic..."
  kafka-topics --create \
    --topic "$topic" \
    --bootstrap-server kafka:9092 \
    --partitions 1 \
    --replication-factor 1 \
    --if-not-exists
  echo "✅ Topic '$topic' created (or already exists)."
}

# Tạo các topic chính
create_topic "ride-request-events"
create_topic "ride-events"
create_topic "ride-matching-requests"
create_topic "ride-matching-results"
create_topic "ride-matching-retries"
create_topic "ride-matching-failed"


echo "🎉 Ride-related topics initialized."
