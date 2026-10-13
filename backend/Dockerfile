FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY normal_wallets.csv ./normal_wallets.csv
RUN useradd --create-home aegis && mkdir -p /data && chown -R aegis:aegis /app /data
USER aegis
WORKDIR /app/backend
ENV DATABASE_URL=sqlite:////data/aegis.db
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
