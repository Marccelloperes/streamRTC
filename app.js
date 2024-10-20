async function startCall() {
    const localStream = await startWebcam();
    await makeOffer(localStream);
}
