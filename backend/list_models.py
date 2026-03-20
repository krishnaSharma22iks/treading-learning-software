from google import genai
import os

key = "AIzaSyBNB0iWL9HOdHFPe6d9R2hG8bi_pJsS6bo"
client = genai.Client(api_key=key)

try:
    print("Listing available models...")
    for model in client.models.list():
        # print all attributes to find the right one
        print(f"Model ID: {model.name}")
except Exception as e:
    print(f"FAILURE: {str(e)}")
