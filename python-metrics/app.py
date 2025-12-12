import http
from fastapi import FastAPI, Header, HTTPException
from services.metrics_calculator import calculate_metrics
from dotenv import load_dotenv
import os


load_dotenv()

API_TOKEN = os.getenv("TOKEN_API")

app = FastAPI()

@app.get('/metrics/{start_date}/{end_date}')
async def get_metrics(start_date: str, end_date: str, Authorization: str = Header(None)):
    token_api = Authorization.split(" ")[1] if Authorization else None
    
    if token_api != API_TOKEN:
        raise HTTPException(status_code=http.HTTPStatus.UNAUTHORIZED, detail="Invalid API token")
    
    metrics = calculate_metrics(start_date, end_date)
    
    return metrics
