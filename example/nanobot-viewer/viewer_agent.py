import os
import sys
import asyncio
import litellm
from pathlib import Path

# Add the example directory to sys.path to find 'bridge' and 'nanobot'
sys.path.append(str(Path(__file__).parent))

from bridge.bridge import ProxyHandler
from nanobot.providers.litellm_provider import LiteLLMProvider

async def main():
    print("--- Nanobot Viewer Example ---")
    print("This example demonstrates AI Protocol Observation using LiteLLM callbacks.")
    
    # 1. Initialize the Bridge (Interception)
    litellm.callbacks = [ProxyHandler()]
    print("[Bridge] Registered ProxyHandler. Logs will be sent to ws://localhost:5175")

    # 2. Setup the Provider
    api_key = os.getenv("OPENAI_API_KEY", "sk-dummy")
    provider = LiteLLMProvider(api_key=api_key)
    
    # 3. Get User Input or use default
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Hello! Tell me a short joke about robots."
    print(f"\n[User]: {prompt}")

    # 4. Perform the AI Call (Intercepted by Bridge)
    try:
        response = await provider.chat(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo"
        )
        print(f"\n[AI]: {response.content}")
        print("\n--- Done ---")
        print("Check your AI Protocol Viewer to see the intercepted communication protocol!")
    except Exception as e:
        print(f"\n[Error]: {e}")

if __name__ == "__main__":
    asyncio.run(main())
