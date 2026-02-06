"""
CORS Configuration for FastAPI Server
Add this to your FastAPI server.py file to enable CORS
"""

from fastapi.middleware.cors import CORSMiddleware

# Add this after creating your FastAPI app instance
# app = FastAPI()

# CORS Configuration - Add these lines
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins like ["http://localhost:5173"]
    allow_credentials=False,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Alternative - More restrictive (recommended for production)
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
"""
