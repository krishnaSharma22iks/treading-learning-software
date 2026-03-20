from google import genai
import os

key = "AIzaSyBNB0iWL9HOdHFPe6d9R2hG8bi_pJsS6bo"
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
