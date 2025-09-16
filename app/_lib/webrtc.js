// // SOLUTION: Add missing variable declarations
// let peerConnection;
// let localStream;
// let remoteDescriptionSet = false; // Missing declaration
// let pendingCandidates = []; // Missing declaration

// const config = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };

// // ========== PUZZLE 2: Connection State Management ==========
// // Implement better connection state tracking to prevent errors when WebRTC functions are called
// // in incorrect sequence or multiple times

// // Update in createPeerConnection function in the WebRTC module
// export function createPeerConnection(
//   onTrack,
//   onCandidate,
//   onConnectionStateChange
// ) {
//   // Close any existing connection first
//   if (peerConnection && peerConnection.connectionState !== "closed") {
//     peerConnection.close();
//   }

//   peerConnection = new RTCPeerConnection(config);
//   remoteDescriptionSet = false;
//   pendingCandidates = [];

//   peerConnection.ontrack = onTrack;

//   // Add connection state logging for debugging
//   peerConnection.onconnectionstatechange = () => {
//     console.log("Connection state changed:", peerConnection.connectionState);
//     // Call the callback with the new state
//     if (onConnectionStateChange) {
//       onConnectionStateChange(peerConnection.connectionState);
//     }
//   };

//   // Add ice connection state logging
//   peerConnection.oniceconnectionstatechange = () => {
//     console.log("ICE connection state:", peerConnection.iceConnectionState);
//     // Also update the connection state based on ICE state
//     if (
//       peerConnection.iceConnectionState === "connected" ||
//       peerConnection.iceConnectionState === "completed"
//     ) {
//       if (onConnectionStateChange) {
//         onConnectionStateChange("connected");
//       }
//     }
//   };

//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       onCandidate(event.candidate);
//     }
//   };

//   return peerConnection;
// }

// // ========== PUZZLE 3: Media Stream Error Handling ==========
// // Improve getUserMediaStream to handle errors gracefully and prevent blinking

// export const checkDevicesAvailability = async () => {
//   try {
//     const devices = await navigator.mediaDevices.enumerateDevices();
//     const videoDevices = devices.filter(
//       (device) => device.kind === "videoinput"
//     );
//     const audioDevices = devices.filter(
//       (device) => device.kind === "audioinput"
//     );

//     return {
//       video: videoDevices.length > 0,
//       audio: audioDevices.length > 0,
//     };
//   } catch (error) {
//     console.error("Error checking devices:", error);
//     return { video: false, audio: false };
//   }
// };

// export const getUserMediaStream = async (type) => {
//   try {
//     const devices = await checkDevicesAvailability();

//     // Set appropriate constraints based on available devices
//     const constraints = {
//       video:
//         type === "video" && devices.video
//           ? {
//               width: { ideal: 640 },
//               height: { ideal: 480 },
//               frameRate: { ideal: 30 },
//             }
//           : false,
//       audio: devices.audio,
//     };

//     if (type === "video" && !devices.video) {
//       console.warn("Video requested but no video devices available");
//     }

//     if (!devices.audio) {
//       console.warn("No audio devices available");
//     }

//     // Return null if we can't satisfy the basic requirements
//     if ((type === "video" && !devices.video) || !devices.audio) {
//       return null;
//     }

//     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//     return stream;
//   } catch (error) {
//     console.error("Error accessing media devices:", error);
//     // Return a more specific error that can be handled in the UI
//     throw {
//       type: error.name,
//       message: error.message,
//       original: error,
//     };
//   }
// };

// // ========== PUZZLE 4: Improve addTracks Function ==========
// // Make addTracks more robust to prevent errors

// export function addTracks(stream) {
//   if (!peerConnection) {
//     console.error("Cannot add tracks: peer connection not initialized");
//     return;
//   }

//   if (!stream) {
//     console.error("Cannot add tracks: stream is null");
//     return;
//   }

//   try {
//     stream.getTracks().forEach((track) => {
//       peerConnection.addTrack(track, stream);
//     });
//   } catch (error) {
//     console.error("Error adding tracks to peer connection:", error);
//   }
// }

// // ========== PUZZLE 5: Fix signaling state errors ==========
// // Ensure offer/answer exchange works properly

// export async function createOffer() {
//   if (!peerConnection || peerConnection.signalingState === "closed") {
//     console.error("Cannot create offer: connection is closed or null");
//     return null;
//   }

//   try {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     return offer;
//   } catch (error) {
//     console.error("Error creating offer:", error);
//     return null;
//   }
// }

// export async function handleOffer(offer) {
//   if (!peerConnection || peerConnection.signalingState === "closed") {
//     console.error("Cannot handle offer: connection is closed or null");
//     return null;
//   }

//   if (!offer) {
//     console.error("Received invalid offer");
//     return null;
//   }

//   try {
//     // Check if we're in the right signaling state to set a remote description
//     if (
//       peerConnection.signalingState !== "stable" &&
//       peerConnection.signalingState !== "have-local-offer"
//     ) {
//       console.warn(
//         `Unexpected signaling state: ${peerConnection.signalingState}, resetting connection`
//       );
//       // Consider resetting connection here if needed
//     }

//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//     console.log("Remote description set successfully from offer");
//     remoteDescriptionSet = true;

//     // Process any pending candidates
//     for (let c of pendingCandidates) {
//       await peerConnection.addIceCandidate(new RTCIceCandidate(c));
//     }
//     pendingCandidates = [];

//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     console.log("Local description (answer) set successfully");
//     return answer;
//   } catch (error) {
//     console.error("Error handling offer:", error);
//     return null;
//   }
// }

// export async function handleAnswer(answer) {
//   if (!peerConnection || peerConnection.signalingState === "closed") {
//     console.error("Cannot handle answer: connection is closed or null");
//     return;
//   }

//   if (!answer) {
//     console.error("Received invalid answer");
//     return;
//   }

//   try {
//     // Check signaling state
//     if (peerConnection.signalingState !== "have-local-offer") {
//       console.warn(
//         `Unexpected signaling state for handling answer: ${peerConnection.signalingState}`
//       );
//       // Consider handling this case - maybe don't set remote description
//     }

//     await peerConnection.setRemoteDescription(
//       new RTCSessionDescription(answer)
//     );
//     console.log("Remote description set successfully from answer");
//     remoteDescriptionSet = true;

//     // Process any pending candidates
//     for (let c of pendingCandidates) {
//       await peerConnection.addIceCandidate(new RTCIceCandidate(c));
//     }
//     pendingCandidates = [];
//   } catch (error) {
//     console.error("Error handling answer:", error);
//   }
// }

// // ========== PUZZLE 6: Fix ICE candidate handling ==========
// // Improve ICE candidate handling

// export async function addIceCandidate(candidate) {
//   if (!peerConnection) {
//     console.error("Cannot add ICE candidate: connection is null");
//     return;
//   }

//   if (!candidate) {
//     console.warn("Empty ICE candidate received");
//     return;
//   }

//   try {
//     if (!remoteDescriptionSet) {
//       console.log("Buffering ICE candidate");
//       pendingCandidates.push(candidate);
//     } else {
//       await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     }
//   } catch (error) {
//     console.error("Error adding ICE candidate:", error);
//   }
// }

// // ========== PUZZLE 7: Robust Connection Cleanup ==========
// // Better connection cleanup to prevent memory leaks and zombie connections

// export function closeConnection() {
//   console.log("Closing WebRTC connection");

//   try {
//     if (peerConnection) {
//       // Remove all event listeners
//       peerConnection.ontrack = null;
//       peerConnection.onicecandidate = null;
//       peerConnection.oniceconnectionstatechange = null;
//       peerConnection.onconnectionstatechange = null;

//       // Close the connection
//       peerConnection.close();
//       peerConnection = null;
//     }

//     // Stop all tracks from local stream
//     if (localStream) {
//       localStream.getTracks().forEach((track) => {
//         track.stop();
//       });
//       localStream = null;
//     }

//     // Reset state variables
//     remoteDescriptionSet = false;
//     pendingCandidates = [];

//     console.log("WebRTC connection closed successfully");
//   } catch (error) {
//     console.error("Error closing connection:", error);
//   }
// }

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// WebRTC utility functions with improved error handling and state management

let peerConnection = null;
let dataChannel = null;

// ICE server configuration
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Create a new RTCPeerConnection
 * @param {Function} onTrack Callback for handling remote tracks
 * @param {Function} onIceCandidate Callback for handling ICE candidates
 * @returns {RTCPeerConnection} The newly created peer connection
 */
export function createPeerConnection(onTrack, onIceCandidate) {
  // Close any existing connection first
  if (peerConnection) {
    closeConnection();
  }

  try {
    peerConnection = new RTCPeerConnection(iceServers);

    // Set up event handlers
    peerConnection.ontrack = onTrack;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log("Connection state changed:", peerConnection.connectionState);
    };

    return peerConnection;
  } catch (error) {
    console.error("Error creating peer connection:", error);
    throw error;
  }
}

/**
 * Get user media stream (video or audio)
 * @param {string} type 'video' or 'audio'
 * @returns {Promise<MediaStream>}
 */
export async function getUserMediaStream(type) {
  try {
    const constraints = {
      audio: true,
      video: type === "video" ? { width: 1280, height: 720 } : false,
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    // Add more context to the error
    error.original = error;
    if (error.name === "NotReadableError") {
      error.message =
        "Camera or microphone is already in use by another application";
    } else if (error.name === "NotAllowedError") {
      error.message = "Permission to use camera or microphone was denied";
    } else if (error.name === "NotFoundError") {
      error.message = "No camera or microphone found";
    }
    throw error;
  }
}

/**
 * Add tracks from media stream to peer connection
 * @param {MediaStream} stream
 */
export function addTracks(stream) {
  if (!peerConnection) {
    throw new Error("Peer connection not initialized");
  }

  try {
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  } catch (error) {
    console.error("Error adding tracks:", error);
    throw error;
  }
}

/**
 * Create an offer
 * @returns {Promise<RTCSessionDescriptionInit>}
 */
export async function createOffer() {
  if (!peerConnection) {
    throw new Error("Peer connection not initialized");
  }

  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection.setLocalDescription(offer);

    // Wait for ICE gathering to complete or timeout after 2 seconds
    await new Promise((resolve) => {
      const checkState = () => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve();
        }
      };

      // Check immediately
      checkState();

      // Set up listeners for future state changes
      const gatheringStateChangeHandler = () => {
        checkState();
      };

      peerConnection.addEventListener(
        "icegatheringstatechange",
        gatheringStateChangeHandler
      );

      // Set a timeout in case gathering takes too long
      setTimeout(() => {
        peerConnection.removeEventListener(
          "icegatheringstatechange",
          gatheringStateChangeHandler
        );
        resolve();
      }, 2000);
    });

    // Use the current local description which may have been updated with ICE candidates
    return peerConnection.localDescription;
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error;
  }
}

/**
 * Handle an offer from a remote peer
 * @param {RTCSessionDescriptionInit} offer
 * @returns {Promise<RTCSessionDescriptionInit>} The created answer
 */
export async function handleOffer(offer) {
  if (!peerConnection) {
    throw new Error("Peer connection not initialized");
  }

  try {
    const rtcOffer = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(rtcOffer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Wait briefly for ICE gathering to progress
    await new Promise((resolve) => {
      const checkState = () => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve();
        }
      };

      checkState();

      const gatheringStateChangeHandler = () => {
        checkState();
      };

      peerConnection.addEventListener(
        "icegatheringstatechange",
        gatheringStateChangeHandler
      );

      setTimeout(() => {
        peerConnection.removeEventListener(
          "icegatheringstatechange",
          gatheringStateChangeHandler
        );
        resolve();
      }, 2000);
    });

    return peerConnection.localDescription;
  } catch (error) {
    console.error("Error handling offer:", error);
    throw error;
  }
}

/**
 * Handle an answer from a remote peer
 * @param {RTCSessionDescriptionInit} answer
 */
export async function handleAnswer(answer) {
  if (!peerConnection) {
    throw new Error("Peer connection not initialized");
  }

  try {
    // Check if we can actually apply this answer
    if (peerConnection.signalingState !== "have-local-offer") {
      console.warn(
        `Cannot set remote answer in state ${peerConnection.signalingState}`
      );
      return;
    }

    const rtcAnswer = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(rtcAnswer);
  } catch (error) {
    console.error("Error handling answer:", error);
    throw error;
  }
}

/**
 * Add an ICE candidate to the peer connection
 * @param {RTCIceCandidateInit} candidate
 */
export async function addIceCandidate(candidate) {
  if (!peerConnection) {
    throw new Error("Peer connection not initialized");
  }

  try {
    // Don't add candidates until we have remote description
    if (peerConnection.remoteDescription === null) {
      throw new Error("Cannot add ICE candidate without remote description");
    }

    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
    throw error;
  }
}

/**
 * Close the WebRTC connection and clean up resources
 */
export function closeConnection() {
  try {
    if (dataChannel) {
      dataChannel.close();
      dataChannel = null;
    }

    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
  } catch (error) {
    console.error("Error closing connection:", error);
  }
}
