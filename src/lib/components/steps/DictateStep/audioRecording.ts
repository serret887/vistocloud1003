// Audio recording utilities for DictateStep
export interface RecordingState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  error: string | null;
}

export function createRecordingState(): RecordingState {
  return {
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
    error: null
  };
}

export async function startRecording(
  state: RecordingState,
  onStop: (blob: Blob) => void
): Promise<void> {
  if (typeof MediaRecorder === 'undefined') {
    state.error = 'Voice recording is not supported in this browser';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options: MediaRecorderOptions = {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : undefined
    };
    
    state.mediaRecorder = new MediaRecorder(stream, options);
    state.audioChunks = [];
    
    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };
    
    state.mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if (state.audioChunks.length > 0) {
        const blob = new Blob(state.audioChunks, { 
          type: state.mediaRecorder?.mimeType || 'audio/webm' 
        });
        onStop(blob);
      }
    };
    
    state.mediaRecorder.onerror = () => {
      state.error = 'Recording error occurred';
      state.isRecording = false;
    };
    
    state.mediaRecorder.start();
    state.isRecording = true;
    state.error = null;
  } catch {
    state.error = 'Failed to access microphone. Please check permissions.';
  }
}

export function stopRecording(state: RecordingState): void {
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
    state.isRecording = false;
  }
}



