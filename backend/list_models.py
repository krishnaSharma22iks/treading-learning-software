from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
AI_API_KEY = os.getenv("AI_API_KEY")
client = genai.Client(api_key=AI_API_KEY)

print("📡 Fetching available models...")
try:
    models = client.models.list()
    with open("models_list.txt", "w", encoding="utf-8") as f:
        for m in models:
            f.write(f"Name: {m.name}, DisplayName: {m.display_name}\n")
    print("✅ Model list saved to models_list.txt")
except Exception as e:
    print(f"❌ Error: {e}")
