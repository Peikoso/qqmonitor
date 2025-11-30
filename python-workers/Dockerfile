FROM python:3.12-slim


WORKDIR /python-workers

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "worker/runner_scheduler.py"]  # será sobrescrito pelo compose