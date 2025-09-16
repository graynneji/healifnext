"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/_lib/supabase";
import styles from "./CallUI.module.css";
import {
  createPeerConnection,
  getUserMediaStream,
  addTracks,
  createOffer,
  handleOffer,
  handleAnswer,
  addIceCandidate,
  closeConnection,
} from "@/app/_lib/webrtc";
import { useDispatch, useSelector } from "react-redux";
import { call } from "@/app/store/callSlice";

export default function CallUI({ inCall, caller, type, channel }) {
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentMediaType, setCurrentMediaType] = useState(type);
  const [callTimeElapsed, setCallTimeElapsed] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const dispatch = useDispatch();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const timerRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const users = useSelector((state) => state.getStoredUsers.users);
  const userId = users[0]?.user_id;

  const isValidCallState = () => inCall && channel && userId;

  // Format time elapsed to mm:ss
  const formatTimeElapsed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Setup media with fallback to audio-only if camera is in use
  const setupMediaWithFallback = async (preferredType) => {
    try {
      // First try with requested media type
      const stream = await getUserMediaStream(preferredType);
      return { stream, mediaType: preferredType };
    } catch (error) {
      console.log("Media error:", error);

      // If video fails but it was requested, try audio-only
      if (
        (error.type === "NotReadableError" ||
          error.original?.name === "NotReadableError") &&
        preferredType === "video"
      ) {
        try {
          console.log("Falling back to audio-only");
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          return { stream: audioOnlyStream, mediaType: "audio" };
        } catch (audioError) {
          console.error("Audio fallback failed:", audioError);
          throw audioError;
        }
      } else {
        throw error;
      }
    }
  };

  const toggleMute = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (!localStream || currentMediaType === "audio") return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const endCall = async () => {
    // Close local streams
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // Notify other user that call has ended
    try {
      await supabase
        .from("call_requests")
        .update({ status: "ended" })
        .eq("channel", channel);
    } catch (error) {
      console.error("Error updating call status:", error);
    }

    // Reset call state in Redux
    dispatch(
      call({ inCall: false, channel: null, type: "video", caller: null })
    );
  };

  // Show controls temporarily when user moves mouse
  const showControlsTemporarily = () => {
    setShowControls(true);

    // Clear existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    // Set new timer to hide controls after 3 seconds
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (!isValidCallState()) {
      return;
    }

    let isComponentMounted = true;
    let supabaseChannel = null;

    setConnectionState("connecting");
    setErrorMessage(null);

    const setup = async () => {
      try {
        // Get media with fallback to audio-only
        const { stream, mediaType } = await setupMediaWithFallback(type);

        if (!isComponentMounted) return;

        if (!stream) {
          setErrorMessage("Could not access microphone or camera");
          setConnectionState("failed");
          return;
        }

        setLocalStream(stream);
        console.log(
          "Local stream tracks:",
          stream.getTracks().map((t) => `${t.kind}:${t.label}:${t.enabled}`)
        );

        setCurrentMediaType(mediaType);

        if (mediaType === "audio" && type === "video") {
          console.log("Using audio-only mode because camera is in use");
        }

        // Set local video/audio stream
        if (localRef.current) {
          localRef.current.srcObject = stream;
        }

        // Create and setup peer connection
        createPeerConnection(
          (event) => {
            if (!isComponentMounted) return;
            console.log("Remote track received", event.streams[0]);
            if (remoteRef.current && event.streams[0]) {
              remoteRef.current.srcObject = event.streams[0];
              setConnectionState("connected");

              // Start call timer when connected
              if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                  setCallTimeElapsed((prev) => prev + 1);
                }, 1000);
              }
            }
          },
          async (candidate) => {
            if (!isComponentMounted) return;

            try {
              const callData = await supabase
                .from("call_requests")
                .select("*")
                .eq("channel", channel)
                .maybeSingle();

              if (!callData.data) {
                console.error("No call data found");
                return;
              }

              const existing = callData.data.candidates || [];
              await supabase
                .from("call_requests")
                .update({ candidates: [...existing, candidate] })
                .eq("channel", channel);
            } catch (error) {
              console.error("Error sending ICE candidate:", error);
            }
          },
          // Add the connection state change callback
          (newState) => {
            if (!isComponentMounted) return;
            console.log("Connection state update:", newState);

            setConnectionState(newState);

            // Start timer when connected
            if (newState === "connected" && !timerRef.current) {
              timerRef.current = setInterval(() => {
                setCallTimeElapsed((prev) => prev + 1);
              }, 1000);
            }
          }
        );

        // Add tracks to peer connection
        addTracks(stream);
        console.log("Added local tracks to peer connection");
        // Handle signaling (offer/answer)
        const isCaller = caller === userId;

        try {
          const callRow = await supabase
            .from("call_requests")
            .select("*")
            .eq("channel", channel)
            .maybeSingle();

          if (!callRow.data) {
            throw new Error("Call data not found");
          }

          if (isCaller) {
            const offer = await createOffer();
            if (!offer) {
              throw new Error("Failed to create offer");
            }

            await supabase
              .from("call_requests")
              .update({ offer, status: "ringing" })
              .eq("channel", channel);
          } else {
            const offer = callRow.data.offer;
            if (!offer) {
              throw new Error("No offer received");
            }
            const answer = await handleOffer(offer);
            console.log(
              "check for both sender and reciever",
              callRow,
              offer,
              answer
            );
            if (!answer) {
              throw new Error("Failed to create answer");
            }

            const { error } = await supabase
              .from("call_requests")
              .update({ answer, status: "answered" })
              .eq("channel", channel);
            ////here/////
            console.log(error);
            if (error) {
              console.error("Error updating call_requests:", error);
              throw error;
            }
          }
        } catch (error) {
          console.error("Signaling error:", error);
          if (isComponentMounted) {
            setErrorMessage(`Connection error: ${error.message}`);
            setConnectionState("failed");
          }
          return;
        }

        // Listen for updates
        supabaseChannel = supabase
          .channel(`rtc-${channel}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "call_requests",
              filter: `channel=eq.${channel}`,
            },
            async (payload) => {
              if (!isComponentMounted) return;

              const { answer, candidates, status } = payload.new;

              // Check if call has been ended by the other user
              if (status === "ended" && inCall) {
                endCall();
                return;
              }
              ///////////////////////////////////////////////////////////////////
              if (candidates?.length) {
                try {
                  // Get previously processed candidates count
                  const processedCount = payload.old?.candidates?.length || 0;

                  // Only process new candidates
                  const newCandidates = candidates.slice(processedCount);

                  if (newCandidates.length > 0) {
                    console.log(
                      `Processing ${newCandidates.length} new ICE candidates`
                    );

                    for (let candidate of newCandidates) {
                      await addIceCandidate(candidate);
                    }
                  }
                } catch (error) {
                  console.error("Error handling ICE candidates:", error);
                }
              }

              //////////////////////////////////////////////////////////////////
              // Handle answer if we're the caller
              if (answer && isCaller) {
                try {
                  await handleAnswer(answer);
                } catch (error) {
                  console.error("Error handling answer:", error);
                }
              }

              // Handle ICE candidates
              if (candidates?.length) {
                try {
                  for (let c of candidates) {
                    await addIceCandidate(c);
                  }
                } catch (error) {
                  console.error("Error handling ICE candidates:", error);
                }
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Call setup error:", error);
        if (isComponentMounted) {
          setErrorMessage(`Setup error: ${error.message || "Unknown error"}`);
          setConnectionState("failed");
        }
      }
    };

    setup();

    ////////////////////////clean up//////////////////////////

    let connectionTimeoutId = null;

    // Set a connection timeout
    connectionTimeoutId = setTimeout(() => {
      if (connectionState === "connecting" && isComponentMounted) {
        console.log(
          "Connection timeout - still connecting after timeout period"
        );
        setErrorMessage("Connection timed out. Please try again.");
        setConnectionState("failed");

        // Optionally trigger cleanup/reconnect here
      }
    }, 30000);

    ///////////////////////////////////////////////////////

    return () => {
      isComponentMounted = false;

      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }

      ///////////////////////cleanup setTimeOut/////////////////

      if (connectionTimeoutId) {
        clearTimeout(connectionTimeoutId);
      }

      //////////////////////////////////////////////////////////
      // Make sure we stop all tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      closeConnection();
      setLocalStream(null);
      setConnectionState("disconnected");
    };
  }, [
    channel,
    inCall,
    type,
    caller,
    userId,
    connectionState,
    endCall,
    isValidCallState,
    localStream,
  ]);

  ////////////Debug Log/////////////////

  const logConnectionState = () => {
    if (!peerConnection) return "No peer connection";

    return {
      signalingState: peerConnection.signalingState,
      iceConnectionState: peerConnection.iceConnectionState,
      iceGatheringState: peerConnection.iceGatheringState,
      connectionState: peerConnection.connectionState,
      remoteDescription: peerConnection.remoteDescription ? "set" : "not set",
      localDescription: peerConnection.localDescription ? "set" : "not set",
    };
  };

  // Add periodic logging in your setup function:
  const debugIntervalId = setInterval(() => {
    console.log("Connection debug:", logConnectionState());
  }, 5000);

  // Clear in cleanup
  clearInterval(debugIntervalId);
  //////////////////////////////////////

  if (!inCall) {
    return null;
  }

  return (
    <div className={styles.callWrapper} onMouseMove={showControlsTemporarily}>
      {errorMessage && (
        <div className={styles.errorMessage}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorText}>{errorMessage}</div>
          <button onClick={endCall} className={styles.endCallButton}>
            Close
          </button>
        </div>
      )}

      {/* Status indicators */}
      <div className={styles.statusBar}>
        <div
          className={`${styles.statusIndicator} ${
            connectionState === "connected" ? styles.connected : ""
          }`}
        >
          {connectionState === "connecting"
            ? "Establishing Connection..."
            : connectionState === "connected"
            ? "Connected"
            : "Disconnected"}
        </div>

        {connectionState === "connected" && (
          <div className={styles.callTimer}>
            {formatTimeElapsed(callTimeElapsed)}
          </div>
        )}

        {muted && <div className={styles.mutedIndicator}>🔇 Muted</div>}
        {!videoEnabled && currentMediaType === "video" && (
          <div className={styles.videoOffIndicator}>🎥 Video Off</div>
        )}
      </div>

      {/* Audio-only mode indicator */}
      {currentMediaType === "audio" && type === "video" && (
        <div className={styles.audioOnlyBanner}>
          <div className={styles.audioOnlyIcon}>🎧</div>
          <div>Audio Only Mode (Camera unavailable)</div>
        </div>
      )}

      {/* Remote video - show placeholder if in audio-only mode */}
      <div
        className={`${styles.videoContainer} ${
          currentMediaType === "audio" ? styles.audioMode : ""
        }`}
      >
        {connectionState === "connected" ? (
          <>
            <video
              ref={remoteRef}
              autoPlay
              playsInline
              className={styles.remoteVideo}
            />
            {currentMediaType === "audio" && (
              <div className={styles.audioAvatar}>
                <div className={styles.avatarIcon}>👤</div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.placeholderVideo}>
            <div className={styles.connectingAnimation}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
            <div className={styles.connectingText}>
              {connectionState === "connecting" ? "Connecting..." : "No Video"}
            </div>
          </div>
        )}
      </div>

      {/* Local video with conditional rendering based on media type */}
      <div
        className={`${styles.localVideoContainer} ${
          !videoEnabled ? styles.videoDisabled : ""
        }`}
      >
        {currentMediaType === "video" ? (
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className={styles.localVideo}
          />
        ) : (
          <div className={styles.localAudioIndicator}>
            <div className={styles.micIcon}>🎤</div>
            <div className={styles.pulsingCircle}></div>
          </div>
        )}
      </div>

      {/* Controls - conditionally shown */}
      <div
        className={`${styles.controls} ${
          showControls ? styles.controlsVisible : styles.controlsHidden
        }`}
      >
        <div className={styles.controlBar}>
          <button
            className={`${styles.iconButton} ${muted ? styles.active : ""}`}
            onClick={toggleMute}
            title={muted ? "Unmute" : "Mute"}
          >
            <div className={styles.buttonIcon}>{muted ? "🔇" : "🎤"}</div>
            <div className={styles.buttonLabel}>
              {muted ? "Unmute" : "Mute"}
            </div>
          </button>

          {/* Only show video toggle if we have video capability */}
          {currentMediaType === "video" && (
            <button
              className={`${styles.iconButton} ${
                !videoEnabled ? styles.active : ""
              }`}
              onClick={toggleVideo}
              title={videoEnabled ? "Stop Video" : "Start Video"}
            >
              <div className={styles.buttonIcon}>
                {videoEnabled ? "🎥" : "🚫"}
              </div>
              <div className={styles.buttonLabel}>
                {videoEnabled ? "Video Off" : "Video On"}
              </div>
            </button>
          )}

          <button
            onClick={endCall}
            className={styles.endCallButton}
            title="End Call"
          >
            <div className={styles.hangupIcon}>📞</div>
            <div className={styles.buttonLabel}>End</div>
          </button>
        </div>
      </div>
    </div>
  );
}
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { supabase } from "@/app/_lib/supabase";
// import styles from "./CallUI.module.css";
// import {
//   createPeerConnection,
//   getUserMediaStream,
//   addTracks,
//   createOffer,
//   handleOffer,
//   handleAnswer,
//   addIceCandidate,
//   closeConnection,
// } from "@/app/_lib/webrtc";
// import { useDispatch, useSelector } from "react-redux";
// import { call } from "@/app/store/callSlice";

// export default function CallUI({ inCall, caller, type, channel }) {
//   const [muted, setMuted] = useState(false);
//   const [videoEnabled, setVideoEnabled] = useState(true);
//   const [connectionState, setConnectionState] = useState("disconnected");
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [currentMediaType, setCurrentMediaType] = useState(type);
//   const [callTimeElapsed, setCallTimeElapsed] = useState(0);
//   const [showControls, setShowControls] = useState(true);

//   const dispatch = useDispatch();
//   const localRef = useRef(null);
//   const remoteRef = useRef(null);
//   const [localStream, setLocalStream] = useState(null);
//   const timerRef = useRef(null);
//   const controlsTimerRef = useRef(null);
//   const signalProcessingRef = useRef({
//     processingAnswer: false,
//     answerProcessed: false,
//     pendingCandidates: [],
//   });

//   const users = useSelector((state) => state.getStoredUsers.users);
//   const userId = users[0]?.user_id;

//   const isValidCallState = () => inCall && channel && userId;

//   // Format time elapsed to mm:ss
//   const formatTimeElapsed = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   // Setup media with fallback to audio-only if camera is in use
//   const setupMediaWithFallback = async (preferredType) => {
//     try {
//       // First try with requested media type
//       const stream = await getUserMediaStream(preferredType);
//       return { stream, mediaType: preferredType };
//     } catch (error) {
//       console.log("Media error:", error);

//       // If video fails but it was requested, try audio-only
//       if (
//         (error.type === "NotReadableError" ||
//           error.original?.name === "NotReadableError") &&
//         preferredType === "video"
//       ) {
//         try {
//           console.log("Falling back to audio-only");
//           const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
//             video: false,
//             audio: true,
//           });
//           return { stream: audioOnlyStream, mediaType: "audio" };
//         } catch (audioError) {
//           console.error("Audio fallback failed:", audioError);
//           throw audioError;
//         }
//       } else {
//         throw error;
//       }
//     }
//   };

//   const toggleMute = () => {
//     if (!localStream) return;

//     const audioTrack = localStream.getAudioTracks()[0];
//     if (audioTrack) {
//       audioTrack.enabled = !audioTrack.enabled;
//       setMuted(!audioTrack.enabled);
//     }
//   };

//   const toggleVideo = () => {
//     if (!localStream || currentMediaType === "audio") return;

//     const videoTrack = localStream.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.enabled = !videoTrack.enabled;
//       setVideoEnabled(videoTrack.enabled);
//     }
//   };

//   const endCall = async () => {
//     // Close local streams
//     if (localStream) {
//       localStream.getTracks().forEach((track) => {
//         track.stop();
//       });
//     }

//     // Notify other user that call has ended
//     try {
//       await supabase
//         .from("call_requests")
//         .update({ status: "ended" })
//         .eq("channel", channel);
//     } catch (error) {
//       console.error("Error updating call status:", error);
//     }

//     // Reset call state in Redux
//     dispatch(
//       call({ inCall: false, channel: null, type: "video", caller: null })
//     );
//   };

//   // Show controls temporarily when user moves mouse
//   const showControlsTemporarily = () => {
//     setShowControls(true);

//     // Clear existing timer
//     if (controlsTimerRef.current) {
//       clearTimeout(controlsTimerRef.current);
//     }

//     // Set new timer to hide controls after 3 seconds
//     controlsTimerRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   // Handle ice candidates safely with proper state checks
//   const processIceCandidates = async (candidates) => {
//     if (!candidates || !candidates.length) return;

//     // If we're still processing the answer, store candidates for later
//     if (signalProcessingRef.current.processingAnswer) {
//       console.log("Storing candidates for later processing");
//       signalProcessingRef.current.pendingCandidates = [
//         ...signalProcessingRef.current.pendingCandidates,
//         ...candidates,
//       ];
//       return;
//     }

//     // Process each candidate carefully
//     for (const candidate of candidates) {
//       try {
//         await addIceCandidate(candidate);
//       } catch (error) {
//         // Log but don't fail - some candidates might be redundant or outdated
//         console.warn("Non-critical ICE candidate error:", error.message);
//       }
//     }
//   };

//   const processAnswer = async (answer) => {
//     if (!answer || signalProcessingRef.current.answerProcessed) return false;

//     signalProcessingRef.current.processingAnswer = true;

//     try {
//       await handleAnswer(answer);
//       signalProcessingRef.current.answerProcessed = true;

//       // Process any pending candidates that arrived before answer was processed
//       if (signalProcessingRef.current.pendingCandidates.length > 0) {
//         console.log("Processing pending candidates after answer");
//         await processIceCandidates(
//           signalProcessingRef.current.pendingCandidates
//         );
//         signalProcessingRef.current.pendingCandidates = [];
//       }

//       return true;
//     } catch (error) {
//       console.error("Error handling answer:", error);
//       return false;
//     } finally {
//       signalProcessingRef.current.processingAnswer = false;
//     }
//   };

//   useEffect(() => {
//     if (!isValidCallState()) {
//       return;
//     }

//     let isComponentMounted = true;
//     let supabaseChannel = null;

//     setConnectionState("connecting");
//     setErrorMessage(null);

//     // Reset signaling state when call starts
//     signalProcessingRef.current = {
//       processingAnswer: false,
//       answerProcessed: false,
//       pendingCandidates: [],
//     };

//     const setup = async () => {
//       try {
//         // Get media with fallback to audio-only
//         const { stream, mediaType } = await setupMediaWithFallback(type);

//         if (!isComponentMounted) return;

//         if (!stream) {
//           setErrorMessage("Could not access microphone or camera");
//           setConnectionState("failed");
//           return;
//         }

//         setLocalStream(stream);
//         setCurrentMediaType(mediaType);

//         if (mediaType === "audio" && type === "video") {
//           console.log("Using audio-only mode because camera is in use");
//         }

//         // Set local video/audio stream
//         if (localRef.current) {
//           localRef.current.srcObject = stream;
//         }

//         // Create and setup peer connection
//         createPeerConnection(
//           (event) => {
//             if (!isComponentMounted) return;

//             if (remoteRef.current && event.streams[0]) {
//               remoteRef.current.srcObject = event.streams[0];
//               setConnectionState("connected");

//               // Start call timer when connected
//               if (!timerRef.current) {
//                 timerRef.current = setInterval(() => {
//                   setCallTimeElapsed((prev) => prev + 1);
//                 }, 1000);
//               }
//             }
//           },
//           async (candidate) => {
//             if (!isComponentMounted) return;

//             try {
//               // Get current candidates before adding new one
//               const callData = await supabase
//                 .from("call_requests")
//                 .select("candidates")
//                 .eq("channel", channel)
//                 .single();

//               if (!callData?.data) {
//                 console.error("No call data found when sending ICE candidate");
//                 return;
//               }

//               // Update with new candidate - make sure we don't send duplicates
//               const existing = callData.data.candidates || [];
//               const candidateStr = JSON.stringify(candidate);

//               if (!existing.some((c) => JSON.stringify(c) === candidateStr)) {
//                 await supabase
//                   .from("call_requests")
//                   .update({
//                     candidates: [...existing, candidate],
//                     candidate_timestamp: new Date().toISOString(),
//                   })
//                   .eq("channel", channel);
//               }
//             } catch (error) {
//               console.error("Error sending ICE candidate:", error);
//             }
//           }
//         );

//         // Add tracks to peer connection
//         addTracks(stream);

//         // Handle signaling (offer/answer)
//         const isCaller = caller === userId;

//         try {
//           const callRow = await supabase
//             .from("call_requests")
//             .select("*")
//             .eq("channel", channel)
//             .maybeSingle();

//           if (!callRow.data) {
//             throw new Error("Call data not found");
//           }

//           if (isCaller) {
//             const offer = await createOffer();
//             if (!offer) {
//               throw new Error("Failed to create offer");
//             }

//             await supabase
//               .from("call_requests")
//               .update({
//                 offer,
//                 status: "ringing",
//                 candidates: [],
//                 candidate_timestamp: new Date().toISOString(),
//               })
//               .eq("channel", channel);
//           } else {
//             const offer = callRow.data.offer;
//             if (!offer) {
//               throw new Error("No offer received");
//             }

//             const answer = await handleOffer(offer);
//             if (!answer) {
//               throw new Error("Failed to create answer");
//             }

//             // Process any candidates that came with the offer
//             if (callRow.data.candidates?.length > 0) {
//               await processIceCandidates(callRow.data.candidates);
//             }

//             await supabase
//               .from("call_requests")
//               .update({
//                 answer,
//                 status: "answered",
//                 candidates: [],
//                 candidate_timestamp: new Date().toISOString(),
//               })
//               .eq("channel", channel);
//           }
//         } catch (error) {
//           console.error("Signaling error:", error);
//           if (isComponentMounted) {
//             setErrorMessage(`Connection error: ${error.message}`);
//             setConnectionState("failed");
//           }
//           return;
//         }

//         // Listen for updates with realtime subscription
//         supabaseChannel = supabase
//           .channel(`rtc-${channel}`)
//           .on(
//             "postgres_changes",
//             {
//               event: "UPDATE",
//               schema: "public",
//               table: "call_requests",
//               filter: `channel=eq.${channel}`,
//             },
//             async (payload) => {
//               if (!isComponentMounted) return;

//               const { answer, candidates, status, candidate_timestamp } =
//                 payload.new;

//               // Check if call has been ended by the other user
//               if (status === "ended" && inCall) {
//                 endCall();
//                 return;
//               }

//               // Process answer if we're the caller and haven't processed it yet
//               if (
//                 answer &&
//                 isCaller &&
//                 !signalProcessingRef.current.answerProcessed
//               ) {
//                 await processAnswer(answer);
//               }

//               // Only process new candidates if timestamp suggests they're new
//               if (candidates?.length > 0) {
//                 await processIceCandidates(candidates);
//               }
//             }
//           )
//           .subscribe();
//       } catch (error) {
//         console.error("Call setup error:", error);
//         if (isComponentMounted) {
//           setErrorMessage(`Setup error: ${error.message || "Unknown error"}`);
//           setConnectionState("failed");
//         }
//       }
//     };

//     setup();

//     return () => {
//       isComponentMounted = false;

//       if (supabaseChannel) {
//         supabase.removeChannel(supabaseChannel);
//       }

//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }

//       if (controlsTimerRef.current) {
//         clearTimeout(controlsTimerRef.current);
//         controlsTimerRef.current = null;
//       }

//       // Make sure we stop all tracks
//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           track.stop();
//         });
//       }

//       closeConnection();
//       setLocalStream(null);
//       setConnectionState("disconnected");
//     };
//   }, [channel, inCall, type, caller, userId]);

//   if (!inCall) {
//     return null;
//   }

//   return (
//     <div className={styles.callWrapper} onMouseMove={showControlsTemporarily}>
//       {errorMessage && (
//         <div className={styles.errorMessage}>
//           <div className={styles.errorIcon}>⚠️</div>
//           <div className={styles.errorText}>{errorMessage}</div>
//           <button onClick={endCall} className={styles.endCallButton}>
//             Close
//           </button>
//         </div>
//       )}

//       {/* Status indicators */}
//       <div className={styles.statusBar}>
//         <div
//           className={`${styles.statusIndicator} ${
//             connectionState === "connected" ? styles.connected : ""
//           }`}
//         >
//           {connectionState === "connecting"
//             ? "Establishing Connection..."
//             : connectionState === "connected"
//             ? "Connected"
//             : "Disconnected"}
//         </div>

//         {connectionState === "connected" && (
//           <div className={styles.callTimer}>
//             {formatTimeElapsed(callTimeElapsed)}
//           </div>
//         )}

//         {muted && <div className={styles.mutedIndicator}>🔇 Muted</div>}
//         {!videoEnabled && currentMediaType === "video" && (
//           <div className={styles.videoOffIndicator}>🎥 Video Off</div>
//         )}
//       </div>

//       {/* Audio-only mode indicator */}
//       {currentMediaType === "audio" && type === "video" && (
//         <div className={styles.audioOnlyBanner}>
//           <div className={styles.audioOnlyIcon}>🎧</div>
//           <div>Audio Only Mode (Camera unavailable)</div>
//         </div>
//       )}

//       {/* Remote video - show placeholder if in audio-only mode */}
//       <div
//         className={`${styles.videoContainer} ${
//           currentMediaType === "audio" ? styles.audioMode : ""
//         }`}
//       >
//         {connectionState === "connected" ? (
//           <>
//             <video
//               ref={remoteRef}
//               autoPlay
//               playsInline
//               className={styles.remoteVideo}
//             />
//             {currentMediaType === "audio" && (
//               <div className={styles.audioAvatar}>
//                 <div className={styles.avatarIcon}>👤</div>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className={styles.placeholderVideo}>
//             <div className={styles.connectingAnimation}>
//               <div className={styles.dot}></div>
//               <div className={styles.dot}></div>
//               <div className={styles.dot}></div>
//             </div>
//             <div className={styles.connectingText}>
//               {connectionState === "connecting" ? "Connecting..." : "No Video"}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Local video with conditional rendering based on media type */}
//       <div
//         className={`${styles.localVideoContainer} ${
//           !videoEnabled ? styles.videoDisabled : ""
//         }`}
//       >
//         {currentMediaType === "video" ? (
//           <video
//             ref={localRef}
//             autoPlay
//             muted
//             playsInline
//             className={styles.localVideo}
//           />
//         ) : (
//           <div className={styles.localAudioIndicator}>
//             <div className={styles.micIcon}>🎤</div>
//             <div className={styles.pulsingCircle}></div>
//           </div>
//         )}
//       </div>

//       {/* Controls - conditionally shown */}
//       <div
//         className={`${styles.controls} ${
//           showControls ? styles.controlsVisible : styles.controlsHidden
//         }`}
//       >
//         <div className={styles.controlBar}>
//           <button
//             className={`${styles.iconButton} ${muted ? styles.active : ""}`}
//             onClick={toggleMute}
//             title={muted ? "Unmute" : "Mute"}
//           >
//             <div className={styles.buttonIcon}>{muted ? "🔇" : "🎤"}</div>
//             <div className={styles.buttonLabel}>
//               {muted ? "Unmute" : "Mute"}
//             </div>
//           </button>

//           {/* Only show video toggle if we have video capability */}
//           {currentMediaType === "video" && (
//             <button
//               className={`${styles.iconButton} ${
//                 !videoEnabled ? styles.active : ""
//               }`}
//               onClick={toggleVideo}
//               title={videoEnabled ? "Stop Video" : "Start Video"}
//             >
//               <div className={styles.buttonIcon}>
//                 {videoEnabled ? "🎥" : "🚫"}
//               </div>
//               <div className={styles.buttonLabel}>
//                 {videoEnabled ? "Video Off" : "Video On"}
//               </div>
//             </button>
//           )}

//           <button
//             onClick={endCall}
//             className={styles.endCallButton}
//             title="End Call"
//           >
//             <div className={styles.hangupIcon}>📞</div>
//             <div className={styles.buttonLabel}>End</div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
