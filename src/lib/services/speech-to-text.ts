/**
 * Google Speech-to-Text service for voice transcription
 */

/**
 * Transcribe audio blob using Google Speech-to-Text API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.PUBLIC_GOOGLE_AI_API_KEY || import.meta.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY or PUBLIC_GOOGLE_AI_API_KEY environment variable not set');
  }

  try {
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Determine audio format from blob type
    const audioFormat = audioBlob.type.includes('webm') ? 'WEBM_OPUS' : 
                       audioBlob.type.includes('mp3') ? 'MP3' :
                       audioBlob.type.includes('wav') ? 'LINEAR16' : 'WEBM_OPUS';

    console.log('🎤 [SPEECH-TO-TEXT] Transcribing audio:', {
      size: audioBlob.size,
      type: audioBlob.type,
      format: audioFormat
    });

    // Use Google Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: audioFormat,
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'latest_long',
          },
          audio: {
            content: base64Audio.split(',')[1] // Remove data:audio/...;base64, prefix
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [SPEECH-TO-TEXT] API error:', errorData);
      throw new Error(`Speech-to-Text API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn('⚠️ [SPEECH-TO-TEXT] No transcription results');
      return '';
    }

    // Combine all alternatives
    const transcript = data.results
      .map((result: any) => result.alternatives[0]?.transcript || '')
      .join(' ')
      .trim();

    console.log('✅ [SPEECH-TO-TEXT] Transcription complete:', transcript.substring(0, 100) + '...');
    
    return transcript;
  } catch (error) {
    console.error('❌ [SPEECH-TO-TEXT] Transcription error:', error);
    throw error;
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Record audio from microphone and return as blob
 */
export async function recordAudio(durationMs: number = 30000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          stream.getTracks().forEach(track => track.stop());
          resolve(blob);
        };
        
        mediaRecorder.onerror = (error) => {
          stream.getTracks().forEach(track => track.stop());
          reject(error);
        };
        
        mediaRecorder.start();
        
        // Stop recording after duration
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, durationMs);
      })
      .catch(reject);
  });
}

