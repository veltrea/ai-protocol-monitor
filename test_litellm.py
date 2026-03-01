import os
import sys
import litellm
import time

# Ensure our bridge is findable
sys.path.append(os.getcwd())

# Inject bridge
from bridge.bridge import ProxyHandler
litellm.callbacks = [ProxyHandler()]

print("Triggering mock LiteLLM call...")
try:
    # Use a mock call or a real one with bogus key
    # Simple call to trigger pre_api_call
    litellm.completion(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "test connection"}],
        api_key="sk-dummy",
        mock_response="This is a mock response"
    )
    print("Call completed.")
except Exception as e:
    print(f"Call failed (expected if real API): {e}")

# Give some time for the socket to send
time.sleep(1)
print("Test script finished.")
