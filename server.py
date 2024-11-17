import os
import json
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
import asyncio

# Set of active PeerConnections
pcs = set()

# Serve the main index.html file
async def index(request):
    content = open(os.path.join(os.path.dirname(__file__), 'index.html'), 'r').read()
    return web.Response(content_type='text/html', text=content)

# Handle incoming WebRTC offers
async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params['sdp'], type=params['type'])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        print(f"ICE connection state is {pc.iceConnectionState}")
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        print(f"Track {track.kind} received")

        @track.on("ended")
        async def on_ended():
            print(f"Track {track.kind} ended")

    # Capture the requester's IP
    requester_ip = request.remote
    print(f"Connection request from IP: {requester_ip}")

    # Set up the SDP
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        'sdp': pc.localDescription.sdp,
        'type': pc.localDescription.type,
        'ip': requester_ip,
        'message': "You are connected to the MakerLab server!"
    })

# Shutdown handler to close all PeerConnections
async def on_shutdown(app):
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()

# Application setup
app = web.Application()
app.on_shutdown.append(on_shutdown)
app.add_routes([
    web.get('/', index),
    web.post('/offer', offer)
])

if __name__ == '__main__':
    # Run the application
    web.run_app(app, host='0.0.0.0', port=8080)
