const hdConstraints = {
    video: { width: { exact:  1280} , height: { exact: 720 } },
  };
  
  const stream = await navigator.mediaDevices.getUserMedia(hdConstraints);


  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((localMediaStream) => {
      const video = document.querySelector("video");
      video.srcObject = localMediaStream;
    })
    .catch((error) => {
      console.log("Rejected!", error);
    });

    if (!navigator.mediaDevices?.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
      } else {
        // List cameras and microphones.
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            let audioSource = null;
            let videoSource = null;
      
            devices.forEach((device) => {
              if (device.kind === "audioinput") {
                audioSource = device.deviceId;
              } else if (device.kind === "videoinput") {
                videoSource = device.deviceId;
              }
            });
            sourceSelected(audioSource, videoSource);
          })
          .catch((err) => {
            console.error(`${err.name}: ${err.message}`);
          });
      }
      
      async function sourceSelected(audioSource, videoSource) {
        const constraints = {
          audio: { deviceId: audioSource },
          video: { deviceId: videoSource },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
      }