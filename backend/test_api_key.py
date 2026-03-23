from google import genai
import os
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("AI_API_KEY")
print("Loaded Key:", key)
client = genai.Client(api_key=key)

try:
    print("Testing Gemini model 'gemini-flash-latest'...")
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents="Say 'API OK' if you hear me."
    )
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILURE: {str(e)}")
