# Cloud Run container for Prody Notes. A Dockerfile makes `gcloud run deploy
# --source` deterministic (vs. buildpack auto-detection).
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sends traffic to $PORT; gunicorn serves the Flask `app` object.
EXPOSE 8080
CMD exec gunicorn --bind :$PORT --workers 2 --threads 4 --timeout 60 main:app
