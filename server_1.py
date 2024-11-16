import os
import json
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.media import MediaPlayer, MediaRecorder
import asyncio



pcs = set()

async def index(request):
    content = open(os.path.join(os.path.dirname(__file__), 'index.html'), 'r').read()
    return web.Response(content_type='text/html', text=content)

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

        if track.kind == "video":
            local_video = MediaPlayer(os.path.join(os.path.dirname(__file__), 'video.mp4')).video
            pc.addTrack(local_video)

        @track.on("ended")
        async def on_ended():
            print(f"Track {track.kind} ended")

    # Configurar a descrição local (local SDP)
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        'sdp': pc.localDescription.sdp,
        'type': pc.localDescription.type
    })

async def on_shutdown(app):
    # Fechar todas as conexões peer
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()

app = web.Application()
app.on_shutdown.append(on_shutdown)
app.add_routes([web.get('/', index),
                web.post('/offer', offer)])

if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=8080)  # Escutar em todas as interfaces de rede

