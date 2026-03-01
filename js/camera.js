/**
 * Camera Module - Handles camera access and capture
 */
const Camera = (function() {
    'use strict';

    let currentStream = null;
    let videoElement = null;
    let canvasElement = null;
    let useFrontCamera = false;

    /**
     * Initialize camera with video element
     */
    function init(videoEl, canvasEl) {
        videoElement = videoEl;
        canvasElement = canvasEl;
    }

    /**
     * Start camera stream
     */
    async function startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            // Stop existing stream if any
            if (currentStream) {
                stopCamera();
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            currentStream = stream;
            
            if (videoElement) {
                videoElement.srcObject = stream;
                await videoElement.play();
            }

            return { success: true };
        } catch (error) {
            console.error('Camera error:', error);
            return { 
                success: false, 
                error: getErrorMessage(error) 
            };
        }
    }

    /**
     * Stop camera stream
     */
    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        
        if (videoElement) {
            videoElement.srcObject = null;
        }
    }

    /**
     * Switch between front and back camera
     */
    async function switchCamera() {
        useFrontCamera = !useFrontCamera;
        return await startCamera();
    }

    /**
     * Capture current frame from video
     */
    function captureFrame() {
        if (!videoElement || !canvasElement) {
            return null;
        }

        const context = canvasElement.getContext('2d');
        
        // Set canvas size to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(videoElement, 0, 0);
        
        // Return as data URL
        return canvasElement.toDataURL('image/jpeg', 0.9);
    }

    /**
     * Load image from file input
     */
    function loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Get user-friendly error message
     */
    function getErrorMessage(error) {
        switch (error.name) {
            case 'NotAllowedError':
                return 'Camera permission denied. Please allow camera access in your browser settings.';
            case 'NotFoundError':
                return 'No camera found on this device.';
            case 'NotReadableError':
                return 'Camera is already in use by another application.';
            case 'OverconstrainedError':
                return 'Camera does not meet the required constraints.';
            default:
                return 'Unable to access camera. Please try again.';
        }
    }

    /**
     * Check if camera is available
     */
    async function checkCameraAvailability() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            return cameras.length > 0;
        } catch (error) {
            return false;
        }
    }

    // Public API
    return {
        init,
        startCamera,
        stopCamera,
        switchCamera,
        captureFrame,
        loadImageFromFile,
        checkCameraAvailability
    };
})();

