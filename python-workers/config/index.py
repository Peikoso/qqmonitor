import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
API_INCIDENTS_URL = os.getenv("API_INCIDENTS_URL")
TOKEN_API = os.getenv("TOKEN_API")