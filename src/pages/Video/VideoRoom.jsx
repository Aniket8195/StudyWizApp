import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import './VideoRoom.css';

const VideoRoom = () => {
    const user = localStorage.getItem('user');
    const userId = JSON.parse(user).userId;
    const username = JSON.parse(user).username;
    const { roomId } = useParams();
    const [peers, setPeers] = useState(new Map());
    const [streams, setStreams] = useState(new Map());
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [participants, setParticipants] = useState([]);
    
    const localVideoRef = useRef();
    const localStreamRef = useRef();
    const stompClientRef = useRef();
    const peerConnectionsRef = useRef(new Map());

    useEffect(() => {
        console.log('Initializing VideoRoom with roomId:', roomId);
        setupWebSocket();
        setupLocalStream();
        
        return () => {
            console.log('Cleaning up room resources');
            cleanupRoom();
        };
    }, [roomId]);

    const setupWebSocket = () => {
    console.log('Setting up WebSocket connection');
    const client = new Client({
        brokerURL: 'ws://localhost:8093/video-websocket/ws',
        // connectHeaders: {
        //     login: 'guest',
        //     passcode: 'guest'
        // },
        debug: function (str) {
            console.log('STOMP debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => {
            return new WebSocket('ws://localhost:8093/video-websocket/ws');
        },
        onStompError: (frame) => {
            console.error('STOMP error:', frame.headers.message);
            console.error('Server reported error:', frame.body);
        }
    });

    client.onConnect = (frame) => {
        console.log('WebSocket connected:', frame);
        client.subscribe(`/topic/room/${roomId}/userJoined`, handleUserJoined);
        client.subscribe(`/topic/room/${roomId}/userLeft`, handleUserLeft);
        client.subscribe(`/topic/room/${roomId}/signal/${userId}`, handleSignal);
        
        client.publish({
            destination: `/app/room/${roomId}/join`,
            body: JSON.stringify({ userId, username })
        });
        console.log('Announced join to room:', roomId);
    };

    client.onStompError = (error) => {
        console.error('STOMP error:', error);
    };

    client.activate();
    stompClientRef.current = client;
};

    const setupLocalStream = async () => {
        console.log('Setting up local video and audio stream');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    };

    const createPeerConnection = (remoteUserId) => {
        console.log('Creating peer connection for user:', remoteUserId);
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        localStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStreamRef.current);
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate to user:', remoteUserId);
                sendSignal(remoteUserId, {
                    type: 'ice-candidate',
                    data: event.candidate
                });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log('Received remote stream from user:', remoteUserId);
            setStreams(prev => new Map(prev.set(remoteUserId, event.streams[0])));
        };

        peerConnectionsRef.current.set(remoteUserId, peerConnection);
        return peerConnection;
    };

    const handleUserJoined = async (message) => {
        const newUser = JSON.parse(message.body);
        console.log('User joined:', newUser);
        setParticipants(prev => [...prev, newUser]);

        const peerConnection = createPeerConnection(newUser.userId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        sendSignal(newUser.userId, {
            type: 'offer',
            data: offer
        });
    };

    const handleUserLeft = (message) => {
        const userId = JSON.parse(message.body);
        console.log('User left:', userId);
        cleanupPeer(userId);
        setParticipants(prev => prev.filter(p => p.userId !== userId));
    };

    const handleSignal = async (message) => {
        const signal = JSON.parse(message.body);
        const { from, type, data } = signal;
        console.log('Received signal from user:', from, 'Type:', type);

        let peerConnection = peerConnectionsRef.current.get(from);
        if (!peerConnection) {
            peerConnection = createPeerConnection(from);
        }

        switch (type) {
            case 'offer':
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
                {
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    sendSignal(from, { type: 'answer', data: answer });
                }
                break;

            case 'answer':
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
                break;

            case 'ice-candidate':
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                break;
        }
    };

    const sendSignal = (toUserId, signal) => {
        console.log('Sending signal to user:', toUserId, 'Signal:', signal);
        stompClientRef.current.publish({
            destination: `/app/room/${roomId}/signal/${toUserId}`,
            body: JSON.stringify({
                from: userId,
                ...signal
            })
        });
    };

    const toggleAudio = () => {
        console.log('Toggling audio');
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsAudioEnabled(!isAudioEnabled);
    };

    const toggleVideo = () => {
        console.log('Toggling video');
        localStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsVideoEnabled(!isVideoEnabled);
    };

    const leaveRoom = () => {
        console.log('Leaving room');
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/room/${roomId}/leave`,
                body: JSON.stringify({ userId })
            });
        } else {
            console.error("STOMP client is not connected");
        }
        cleanupRoom();
        window.location.href = '/dashboard';
    };

    const cleanupPeer = (userId) => {
        console.log('Cleaning up peer connection for user:', userId);
        const peerConnection = peerConnectionsRef.current.get(userId);
        if (peerConnection) {
            peerConnection.close();
            peerConnectionsRef.current.delete(userId);
        }
        setStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(userId);
            return newStreams;
        });
    };

    const cleanupRoom = () => {
        console.log('Cleaning up all resources');
        peerConnectionsRef.current.forEach((_, userId) => {
            cleanupPeer(userId);
        });

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
        }
    };

    return (
        <div className="video-room">
            <div className="video-grid">
                <div className="video-container local-video">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                    />
                    <div className="video-overlay">
                        <span>You</span>
                    </div>
                </div>
                
                {Array.from(streams).map(([userId, stream]) => (
                    <div key={userId} className="video-container">
                        <video
                            autoPlay
                            playsInline
                            ref={el => {
                                if (el) el.srcObject = stream;
                            }}
                        />
                        <div className="video-overlay">
                            <span>{participants.find(p => p.userId === userId)?.username}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="controls-bar">
                <button 
                    className={`control-button ${!isAudioEnabled ? 'disabled' : ''}`}
                    onClick={toggleAudio}
                >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                </button>
                
                <button 
                    className={`control-button ${!isVideoEnabled ? 'disabled' : ''}`}
                    onClick={toggleVideo}
                >
                    {isVideoEnabled ? <Camera /> : <CameraOff />}
                </button>
                
                <button 
                    className="control-button leave"
                    onClick={leaveRoom}
                >
                    <PhoneOff />
                </button>

                <div className="participants-count">
                    <Users />
                    <span>{participants.length + 1}</span>
                </div>
            </div>
        </div>
    );
};

export default VideoRoom;
