import json
from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._channels: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, ws: WebSocket, channel: str):
        await ws.accept()
        self._channels[channel].append(ws)

    def disconnect(self, ws: WebSocket, channel: str):
        self._channels[channel] = [c for c in self._channels[channel] if c is not ws]

    async def broadcast(self, channel: str, payload: dict):
        message = json.dumps(payload)
        dead = []
        for ws in self._channels.get(channel, []):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, channel)

    async def broadcast_many(self, channels: list[str], payload: dict):
        for channel in channels:
            await self.broadcast(channel, payload)


manager = ConnectionManager()
