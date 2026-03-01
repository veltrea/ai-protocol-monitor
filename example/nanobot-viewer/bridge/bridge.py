import json
import time
import websocket
from litellm.integrations.custom_logger import CustomLogger

class ProxyHandler(CustomLogger):
    def __init__(self):
        self.ws_url = "ws://localhost:5175"

    def send_to_viewer(self, direction, content, metadata=None, request_id=None):
        def serializer(obj):
            if hasattr(obj, "to_dict"):
                return obj.to_dict()
            if hasattr(obj, "dict"):
                return obj.dict()
            return str(obj)

        try:
            ws = websocket.create_connection(self.ws_url, timeout=1)
            entry = {
                "timestamp": int(time.time() * 1000),
                "direction": direction,
                "content": content,
                "metadata": json.loads(json.dumps(metadata, default=serializer)) if metadata else None,
                "requestId": request_id
            }
            ws.send(json.dumps(entry))
            ws.close()
        except Exception as e:
            print(f"[Bridge Error] Failed to send to viewer: {e}")

    def log_pre_api_call(self, model, messages, kwargs):
        """Called before the API call is made."""
        request_id = kwargs.get("litellm_call_id")
        content = json.dumps({"model": model, "messages": messages}, indent=2, ensure_ascii=False)
        self.send_to_viewer("request", content, metadata=kwargs, request_id=request_id)

    def log_success_event(self, kwargs, response_obj, start_time, end_time):
        """Called on successful API call."""
        request_id = kwargs.get("litellm_call_id")
        
        # Extract content or tool calls
        choice = response_obj.choices[0]
        message = choice.message
        
        content = ""
        if hasattr(message, "content") and message.content:
            content = message.content
        
        if hasattr(message, "tool_calls") and message.tool_calls:
            tool_calls = []
            for tc in message.tool_calls:
                tool_calls.append({
                    "name": tc.function.name,
                    "arguments": tc.function.arguments
                })
            content += "\n[Tool Calls]\n" + json.dumps(tool_calls, indent=2, ensure_ascii=False)

        self.send_to_viewer("response", content, metadata={"usage": getattr(response_obj, "usage", {})}, request_id=request_id)

    def log_failure_event(self, kwargs, response_obj, start_time, end_time):
        """Called on failed API call."""
        request_id = kwargs.get("litellm_call_id")
        error_msg = str(kwargs.get("exception", "Unknown Error"))
        self.send_to_viewer("raw", f"Error: {error_msg}", request_id=request_id)
