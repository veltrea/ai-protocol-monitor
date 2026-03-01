import json
import time
import threading
try:
    import websocket
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False
from litellm.integrations.custom_logger import CustomLogger

class ProxyHandler(CustomLogger):
    _instance = None
    _lock = threading.Lock()
    _ws = None

    def __init__(self):
        self.ws_url = "ws://localhost:5175"
        self._ensure_connection()

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = cls()
        return cls._instance

    def _ensure_connection(self):
        if not HAS_WEBSOCKET:
            return

        if ProxyHandler._ws is None or not ProxyHandler._ws.connected:
            try:
                ProxyHandler._ws = websocket.create_connection(self.ws_url, timeout=3)
                print(f"[Bridge] Connected to {self.ws_url}")
            except Exception as e:
                print(f"[Bridge Error] Failed to connect: {e}")
                ProxyHandler._ws = None

    def send_to_viewer(self, direction, content, metadata=None, request_id=None):
        def serializer(obj):
            if hasattr(obj, "to_dict"):
                return obj.to_dict()
            if hasattr(obj, "dict"):
                return obj.dict()
            if hasattr(obj, "__dict__"):
                return obj.__dict__
            try:
                return str(obj)
            except:
                return "<Unserializable Object>"

        try:
            with self._lock:
                self._ensure_connection()
                if ProxyHandler._ws:
                    entry = {
                        "timestamp": int(time.time() * 1000),
                        "direction": direction,
                        "content": content,
                        "metadata": json.loads(json.dumps(metadata, default=serializer)) if metadata else None,
                        "requestId": request_id
                    }
                    ProxyHandler._ws.send(json.dumps(entry))
        except Exception as e:
            print(f"[Bridge Error] Failed to send: {e}")
            ProxyHandler._ws = None # Reset on error

    def log_pre_api_call(self, model, messages, kwargs):
        request_id = kwargs.get("litellm_call_id")
        content = json.dumps({"model": model, "messages": messages}, indent=2, ensure_ascii=False)
        self.send_to_viewer("request", content, metadata=kwargs, request_id=request_id)

    def log_success_event(self, kwargs, response_obj, start_time, end_time):
        request_id = kwargs.get("litellm_call_id")
        
        # Support for streaming chunks is typically handled in log_api_event
        # but for simple completion response:
        if hasattr(response_obj, "choices"):
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

    def log_api_event(self, kwargs, response_obj, start_time, end_time):
        request_id = kwargs.get("litellm_call_id")
        
        # This handles streaming chunks
        if response_obj and hasattr(response_obj, "choices"):
            choice = response_obj.choices[0]
            if hasattr(choice, "delta"):
                delta = choice.delta
                content = getattr(delta, "content", "")
                if content:
                    # 'tool' direction can be used for streaming if we want to distinguish,
                    # but let's stick to 'response' and let the UI handle merging if needed.
                    self.send_to_viewer("response", content, request_id=request_id)
                
                if hasattr(delta, "tool_calls") and delta.tool_calls:
                    for tc in delta.tool_calls:
                        if hasattr(tc, "function") and tc.function:
                            tc_data = {
                                "name": getattr(tc.function, "name", ""),
                                "arguments": getattr(tc.function, "arguments", "")
                            }
                            self.send_to_viewer("tool", json.dumps(tc_data, ensure_ascii=False), request_id=request_id)

    def log_failure_event(self, kwargs, response_obj, start_time, end_time):
        request_id = kwargs.get("litellm_call_id")
        error_msg = str(kwargs.get("exception", "Unknown Error"))
        self.send_to_viewer("raw", f"Error: {error_msg}", request_id=request_id)
