FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

COPY start-dev.sh .
RUN chmod +x start-dev.sh

CMD ["./start-dev.sh"]
