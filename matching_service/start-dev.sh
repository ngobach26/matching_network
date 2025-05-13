#!/bin/bash

echo "⏳ Waiting for Kafka..."
while ! nc -z kafka 9092; do sleep 1; done
echo "✅ Kafka ready. Starting dev watcher..."

watchmedo auto-restart --patterns="*.py" --recursive -- python app.py
