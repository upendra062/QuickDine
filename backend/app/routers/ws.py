from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ws.manager import manager

router = APIRouter(tags=["websocket"])

VALID_CHANNELS = {"kitchen", "admin", "help"}


@router.websocket("/ws/{channel}")
async def ws_channel(ws: WebSocket, channel: str):
    if channel not in VALID_CHANNELS and not channel.startswith("order_"):
        await ws.close(code=4004)
        return
    await manager.connect(ws, channel)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws, channel)
