---
stepsCompleted: [1, 2, 3]
inputDocuments: []
workflowType: 'research'
lastStep: 3
research_type: 'technical'
research_topic: 'Công cụ chuyển đổi giọng nói thành văn bản cho cuộc họp'
research_goals: 'Xây dựng công cụ speech-to-text từ đầu, miễn phí, có thể customize. Hỗ trợ tiếng Việt (bắt buộc), hoạt động offline, độ chính xác cao. Phục vụ cuộc họp nhóm nhỏ (cả online và offline).'
user_name: 'Minh'
date: '2025-12-17'
web_research_enabled: true
source_verification: true
---

# Technical Research: Speech-to-Text Meeting Tool (Vietnamese Support)

## Technical Research Scope Confirmation

**Research Topic:** Công cụ chuyển đổi giọng nói thành văn bản cho cuộc họp

**Research Goals:** Xây dựng công cụ speech-to-text từ đầu, miễn phí, có thể customize. Hỗ trợ tiếng Việt (bắt buộc), hoạt động offline, độ chính xác cao. Phục vụ cuộc họp nhóm nhỏ (cả online và offline).

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2025-12-17

---

## Technology Stack Analysis

### Programming Languages

**Primary Language: Python 3.8+**

_Best for AI/ML Development:_
- Native support for all major STT frameworks (Whisper, faster-whisper, pyannote)
- Extensive ecosystem for audio processing (librosa, soundfile, pydub)
- Hugging Face Transformers library integration
- NumPy/PyTorch for tensor operations
- Mature data science libraries

_Implementation Requirements:_
- Python 3.8 or higher (required for Whisper)
- PyTorch for model inference
- FFmpeg for audio format handling

_Sources:_
- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [Hugging Face Transformers Documentation](https://huggingface.co/docs/transformers)

**Frontend Language: JavaScript/TypeScript**

_For Desktop UI Development:_
- Electron framework (if chosen): JavaScript/TypeScript with Node.js backend
- Tauri framework (if chosen): JavaScript/TypeScript frontend + Rust backend
- Web Audio API for audio capture and visualization
- React/Vue/Svelte for UI components

_Audio Capabilities:_
- getUserMedia API for microphone access
- Web Audio API for real-time audio processing
- desktopCapturer (Electron) for system audio capture

_Sources:_
- [Electron desktopCapturer API](https://www.electronjs.org/docs/latest/api/desktop-capturer)
- [Web Audio API in Electron](https://blog.scottlogic.com/2016/07/05/audio-api-electron.html)

**Alternative: Rust**

_For High-Performance Applications:_
- Tauri backend development
- whisper.cpp integration (C++ library with Rust bindings)
- Excellent memory safety and performance
- cpal library for cross-platform audio I/O
- rodio for audio playback

_Trade-off:_
- Steeper learning curve than Python/JavaScript
- Less mature STT ecosystem compared to Python
- Requires FFI bridges for Python ML models

_Sources:_
- [Tauri Audio Processing](https://www.genspark.ai/spark/audio-processing-in-tauri-apps/8a3063c6-f61b-4d73-890e-60f5999d8f3c)
- [TaurScribe GitHub](https://github.com/machowdh/taurscribe)

**C/C++**

_For Optimized Deployment:_
- whisper.cpp: Pure C/C++ Whisper implementation
- 4x faster CPU inference than Python
- Cross-platform (Windows, macOS, Linux, iOS, Android, WASM)
- Minimal dependencies
- Lower memory footprint

_Use Case:_
- Resource-constrained environments
- Embedded systems
- Browser-based deployment (WebAssembly)

_Sources:_
- [whisper.cpp GitHub](https://github.com/ggml-org/whisper.cpp)
- [How to use whisper.cpp](https://blog.unrealspeech.com/how-to-use-whisper-cpp-in-python-complete-guide/)

---

### Development Frameworks and Libraries

**Speech-to-Text Core: OpenAI Whisper Ecosystem**

_Vanilla Whisper (OpenAI/whisper):_
- Trained on 680,000 hours of multilingual data
- Transformer-based encoder-decoder architecture
- 5 model sizes: tiny (39M) to large (1.55B parameters)
- Multilingual support (99+ languages)
- Built-in language detection and translation
- **Limitation:** 30-second audio chunks, can hallucinate on silence

_Performance Benchmarks:_
- Large-v2: Highest accuracy but slowest
- Medium: Balanced performance
- Turbo (809M): New optimized variant for speed+quality
- Base/Small: Real-time capable
- Tiny: Fastest, lowest accuracy

_Sources:_
- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [Best Open Source STT Models 2025](https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2025-benchmarks)

**faster-whisper (Recommended for Production)**

_Performance Improvements:_
- 4x faster than vanilla Whisper
- CTranslate2-based reimplementation
- 58% VRAM reduction (GPU)
- 73% VRAM reduction with INT8 quantization
- Same accuracy as original Whisper

_Benchmark (13-minute audio):_
- GPU Time: 54s vs 4m30s (vanilla) = 5x faster
- GPU VRAM: 4.7 GB vs 11.3 GB = 58% reduction
- CPU Time: 2m44s vs >10 minutes = 3.7x faster

_Installation:_
```bash
pip install faster-whisper
```

_Sources:_
- [faster-whisper GitHub](https://github.com/SYSTRAN/faster-whisper)
- [5 Ways to Speed Up Whisper](https://modal.com/blog/faster-transcription)

**Vietnamese STT Models (Specialized)**

**1. ChunkFormer-large-vie** ⭐ **Best WER for Vietnamese**

_Performance:_
- VIVOS WER: **4.18%** (Rank #1)
- Common Voice VI WER: **6.66%** (Rank #1)
- VLSP Task-1 WER: **14.09%** (Rank #1)
- Parameters: 110M (14x smaller than PhoWhisper-large)
- Memory: 80% reduction vs baseline

_Architecture:_
- Masked Chunking Conformer
- Handles hours of audio without memory overflow
- Efficient long-form transcription

_Use Case:_
- **Recommended for Vietnamese meeting transcription**
- Best accuracy-efficiency ratio
- Handles long recordings

_Model ID:_
```
khanhld/chunkformer-large-vie
```

_Sources:_
- [ChunkFormer on Hugging Face](https://huggingface.co/khanhld/chunkformer-large-vie)
- Vietnamese STT Research Report (Section 1.1)

**2. PhoWhisper Series (VinAI Research)**

_Published:_ ICLR 2024

_Model Variants:_

| Model | Parameters | VIVOS WER | Use Case |
|-------|-----------|-----------|----------|
| PhoWhisper-tiny | 39M | 10.41% | Edge devices, real-time |
| PhoWhisper-base | 74M | 8.46% | CPU-only deployment |
| PhoWhisper-small | 244M | 6.33% | Balanced accuracy/size |
| PhoWhisper-medium | 769M | 4.97% | High accuracy priority |
| PhoWhisper-large | 1.55B | 4.67% | Maximum accuracy |

_Training Data:_
- 844 hours of diverse Vietnamese accents
- Northern, Central, Southern dialects
- VIVOS, Common Voice, VLSP datasets

_Advantages:_
- 5 size options for different constraints
- Robust across Vietnamese dialects
- Fine-tuned from multilingual Whisper

_Model IDs:_
```
vinai/PhoWhisper-tiny
vinai/PhoWhisper-base
vinai/PhoWhisper-small
vinai/PhoWhisper-medium
vinai/PhoWhisper-large
```

_Sources:_
- [PhoWhisper Paper (ICLR 2024)](https://openreview.net/pdf?id=x3c3MkJfpG)
- [PhoWhisper GitHub](https://github.com/VinAIResearch/PhoWhisper)
- Vietnamese STT Research Report (Section 1.1)

**3. Wav2Vec2-Based Vietnamese Models**

_Available Models:_
- `nguyenvulebinh/wav2vec2-base-vietnamese-250h` (with 4-gram LM)
- `khanhld/wav2vec2-base-vietnamese-160h` (pure CTC)

_Trade-offs:_
- Smaller model size than Whisper
- No built-in language detection
- Requires 16kHz audio, <10s duration
- Good for real-time streaming applications

_Sources:_
- [Wav2Vec2 Vietnamese on Hugging Face](https://huggingface.co/nguyenvulebinh/wav2vec2-base-vietnamese-250h)

**Speaker Diarization: pyannote.audio**

_Current Version:_ pyannote/speaker-diarization-3.1

_Capabilities:_
- State-of-the-art speaker segmentation
- SE-ResNet-34 speaker embeddings
- Block-online k-means clustering
- **RTF < 0.1 on CPU** (lightweight version)
- RTF ~2.5% on GPU (V100)

_Pipeline Components:_
1. Voice Activity Detection (VAD)
2. Speaker embedding extraction
3. Clustering (k-means with look-ahead)

_Installation:_
```bash
pip install pyannote.audio
```

_Usage:_
```python
from pyannote.audio import Pipeline
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1")
diarization = pipeline("audio.wav")
```

_Sources:_
- [pyannote.audio GitHub](https://github.com/pyannote/pyannote-audio)
- [Speaker Diarization 3.1 Model](https://huggingface.co/pyannote/speaker-diarization-3.1)
- [Lightweight Speaker Diarization Paper](https://asmp-eurasipjournals.springeropen.com/articles/10.1186/s13636-024-00382-2)

**Real-Time Diarization: diart**

_Features:_
- Streaming speaker diarization
- Rolling buffer (500ms updates)
- Incremental clustering
- Improves accuracy as conversation progresses

_Use Case:_
- Live meeting transcription
- Real-time applications

_Sources:_
- [diart GitHub](https://github.com/juanmc2005/diart)

**Hugging Face Transformers**

_Integration Library:_
- Unified API for all STT models
- WhisperProcessor, Wav2Vec2Processor
- Easy model switching and comparison
- Pipeline abstraction for simple use

_Installation:_
```bash
pip install transformers torch torchaudio
```

_Sources:_
- [Fine-Tune Whisper Tutorial](https://huggingface.co/blog/fine-tune-whisper)
- Vietnamese STT Research Report (Section 4.1)

---

### Database and Storage Technologies

**Audio File Storage**

_Recommended Format:_ FLAC (Free Lossless Audio Codec)
- Lossless compression (50-60% size reduction)
- Perfect audio quality preservation
- Widely supported

_Alternative Formats:_
- WAV: Uncompressed, highest quality, largest size
- MP3: Lossy compression, acceptable for speech but not optimal

_Storage Requirements:_
- 1-hour meeting (FLAC): ~200-300 MB
- Transcripts (JSON): ~100-500 KB per hour

_Sources:_
- [Best Audio Formats for STT](https://www.assemblyai.com/blog/best-audio-file-formats-for-speech-to-text)

**Transcript Storage**

_Format Options:_
1. **JSON** (structured data with timestamps)
2. **Plain text** (human-readable)
3. **SRT/VTT** (subtitle formats)
4. **SQLite** (local database for searchable transcripts)

_Metadata to Store:_
- Audio file path
- Transcript text (segmented)
- Word-level timestamps
- Speaker labels
- Confidence scores
- Processing metadata (model used, date, duration)

---

### Development Tools and Platforms

**Audio Processing: FFmpeg**

_Essential for:_
- Format conversion (MP3, WAV, M4A → required format)
- Sample rate conversion (e.g., 44.1kHz → 16kHz)
- Audio normalization
- Channel conversion (stereo → mono)

_Installation:_
- macOS: `brew install ffmpeg`
- Ubuntu: `apt install ffmpeg`
- Windows: Download from ffmpeg.org

_Python Integration:_
```bash
pip install ffmpeg-python
```

_Sources:_
- [Whisper Processing Guide](https://cookbook.openai.com/examples/whisper_processing_guide)

**Desktop Application Frameworks**

**Electron**

_Pros:_
- Bundled Chromium (consistent cross-platform)
- Full Web Audio API support
- Mature audio processing ecosystem
- getUserMedia + desktopCapturer APIs
- Large community and plugin ecosystem
- Extensive npm packages

_Cons:_
- Bundle size: ~85MB
- Memory usage: 200-400MB idle
- Startup time: 1-2 seconds

_Audio Features:_
- Built-in HTML5 audio support
- Real-time audio processing via Web Audio API
- System audio capture (desktopCapturer)
- Node.js audio modules access

_Best For:_
- Rapid development with JavaScript/TypeScript
- Complex audio/video workflows
- Teams experienced with web technologies

_Sources:_
- [Electron vs Tauri Comparison](https://www.levminer.com/blog/tauri-vs-electron)
- [Web Audio API in Electron](https://blog.scottlogic.com/2016/07/05/audio-api-electron.html)

**Tauri**

_Pros:_
- Bundle size: 2.5-10MB (10x smaller)
- Memory usage: 20-40MB idle (10x more efficient)
- Startup time: <0.5 seconds
- Rust backend (security, performance)
- OS native WebView (no bundled browser)

_Cons:_
- Audio processing more complex (Rust-based)
- No built-in real-time audio transfer backend ↔ frontend
- Smaller ecosystem vs Electron
- Cross-platform audio capture requires custom implementation

_Audio Features:_
- tauri-plugin-mic-recorder for microphone
- tauri-plugin-ffmpeg for transcoding
- Rust cpal/rodio for advanced audio processing
- HTML audio element for playback

_Best For:_
- Performance-critical applications
- Small installer size requirement
- Security-sensitive deployments
- Teams comfortable with Rust

_Real-World Example:_
- TaurScribe: Desktop transcription app using Tauri + Whisper + PyAudio

_Sources:_
- [Tauri vs Electron](https://blog.logrocket.com/tauri-electron-comparison-migration-guide/)
- [Audio Processing in Tauri](https://www.genspark.ai/spark/audio-processing-in-tauri-apps/8a3063c6-f61b-4d73-890e-60f5999d8f3c)
- [TaurScribe GitHub](https://github.com/machowdh/taurscribe)

**Build Systems & Packaging**

_Electron:_
- electron-builder for packaging
- electron-forge for project scaffolding
- Auto-update via electron-updater

_Tauri:_
- tauri-cli for building
- Native installers (DMG, MSI, AppImage, DEB)
- Built-in auto-update mechanism

**Testing Frameworks**

_Python Backend:_
- pytest for unit testing
- unittest for standard library testing
- Audio testing: librosa for waveform comparison

_JavaScript Frontend:_
- Jest for unit testing
- Playwright/Cypress for E2E testing
- Audio mocking libraries

---

### Cloud Infrastructure and Deployment

**Local/Offline Deployment (Recommended)**

_Advantages:_
- Complete privacy (no audio uploaded)
- No API costs
- No internet dependency
- Compliant with data regulations

_Whisper Offline Capabilities:_
- Full offline functionality
- Models downloaded once, cached locally
- No external API calls required

_System Requirements:_
- CPU: Modern multi-core (Intel/AMD/Apple Silicon)
- RAM: 8GB minimum, 16GB recommended
- Storage: 3GB per large model, 150MB per tiny model
- GPU (optional): NVIDIA with CUDA for 5x speedup

_Sources:_
- [Offline Speech Recognition with Whisper](https://www.assemblyai.com/blog/offline-speech-recognition-whisper-browser-node-js)
- [Whisper In-Browser Implementation](https://medium.com/data-science-collective/implementing-whisper-openai-in-browser-for-offline-audio-transcription-adab61be7af7)

**Optional: Cloud Deployment**

_Use Cases:_
- Scalable transcription service
- Mobile app backend
- Web-based interface

_Platforms:_
- RunPod: GPU instances for Whisper inference
- AWS Lambda: Serverless functions (limited by execution time)
- Google Cloud Run: Container-based deployment
- Hugging Face Inference API: Managed STT endpoint

_Cost Considerations:_
- GPU instance: $0.50-$2.00/hour
- API calls: $0.006-$0.025 per minute (commercial STT APIs)
- Local deployment: $0 ongoing cost (hardware amortized)

---

### Technology Adoption Trends

**2025 STT Landscape**

_Dominant Architecture: Transformer-Based Models_
- Whisper family (OpenAI, PhoWhisper, faster-whisper)
- Wav2Vec 2.0 / Conformer variants
- NVIDIA Canary (SALM architecture)

_Performance Evolution:_
- 2024 Industry Average: 92% accuracy
- 2025 State-of-the-Art: 96% accuracy (clean audio)
- Vietnamese-specific: 95.82% (ChunkFormer, 4.18% WER)

_Sources:_
- [AI Transcription Accuracy 2025](https://www.transcribetube.com/blog/ai-transcription-accuracy)
- [STT Accuracy Benchmarks](https://voicetonotes.ai/blog/state-of-ai-transcription-accuracy/)

**Emerging Technologies**

_1. Quantization & Optimization_
- INT8 quantization: 50% memory, minimal accuracy loss
- faster-whisper: 4x speedup with CTranslate2
- whisper.cpp: Pure C++ for maximum efficiency
- TensorRT: GPU acceleration framework

_2. Chunk-Wise Processing_
- ChunkFormer architecture: 80% memory reduction
- Handles unlimited audio length
- Better suited for long meetings

_3. Browser-Based STT_
- WebAssembly (WASM) Whisper implementations
- Transformers.js for client-side inference
- Complete offline capability in browser

_Sources:_
- [ChunkFormer Paper](https://www.aimodels.fyi/papers/arxiv/chunkformer-masked-chunking-conformer-long-form-speech)
- [Whisper In-Browser](https://medium.com/data-science-collective/implementing-whisper-openai-in-browser-for-offline-audio-transcription-adab61be7af7)

**Vietnamese STT Evolution**

_Timeline:_
- 2019: VAIS wins VLSP competition (4.85% WER)
- 2024: PhoWhisper published (ICLR), 4.67% WER
- 2025: ChunkFormer achieves 4.18% WER (current best)

_Dataset Growth:_
- 2020: ~500 hours public Vietnamese data
- 2024: 3000+ hours (Bud500, ViMD, VLSP, viVoice, phoaudiobook)
- Dialect coverage: 63 provincial dialects (ViMD dataset)

_Community Trends:_
- Open-source models dominate (ChunkFormer, PhoWhisper)
- Fine-tuning from multilingual Whisper standard practice
- LoRA fine-tuning for domain adaptation
- Multi-dialect support increasing priority

_Sources:_
- Vietnamese STT Research Report (Sections 1, 2, 3)

**Migration Patterns**

_From:_
- Google Cloud Speech-to-Text API (paid, cloud-only)
- Azure Speech Services (paid, privacy concerns)
- Proprietary solutions (vendor lock-in)

_To:_
- OpenAI Whisper (free, open-source, offline)
- faster-whisper (production-optimized)
- PhoWhisper/ChunkFormer (Vietnamese-specific)

_Drivers:_
- Privacy regulations (GDPR, data sovereignty)
- Cost reduction (no per-minute API fees)
- Customization requirements
- Offline operation needs

**Legacy Technology**

_Deprecated/Declining:_
- Mozilla DeepSpeech (archived 2021)
- Kaldi (academic, complex setup)
- CMU Sphinx (outdated)

_Reason:_
- Transformer models (Whisper) significantly outperform RNN/HMM approaches
- Easier to use, better documented
- Active development and community support

---

### Recommended Technology Stack for Vietnamese Meeting Transcription

**Core STT Engine:**
1. **Primary**: ChunkFormer-large-vie or PhoWhisper-medium
2. **Fallback**: faster-whisper (multilingual Whisper)
3. **Real-time**: PhoWhisper-small or Whisper base

**Desktop Framework:**
- **Performance-Critical**: Tauri + Rust backend + Python STT subprocess
- **Rapid Development**: Electron + Python backend (subprocess)

**Speaker Diarization:**
- pyannote.audio (version 3.1)
- diart for streaming applications

**Audio Processing:**
- FFmpeg for format conversion
- Web Audio API / PyAudio for capture
- librosa/soundfile for Python audio I/O

**Programming Languages:**
- **Backend**: Python 3.8+ (ML/STT processing)
- **Frontend**: TypeScript/JavaScript (UI)
- **Optional**: Rust (Tauri backend, whisper.cpp integration)

**Deployment:**
- Fully offline desktop application
- Models cached locally
- No cloud dependencies

**Development Tools:**
- VS Code with Python/Rust/TypeScript extensions
- Git for version control
- pytest for backend testing
- Playwright for frontend E2E testing

---

## Integration Patterns Analysis

### Python ML Model Integration Patterns

**Subprocess Integration (Recommended)**

_Architecture:_
- Frontend (Electron/Tauri) spawns Python backend as subprocess
- Communication via stdin/stdout or local socket
- Clean separation between UI and ML processing
- Easier deployment and dependency management

_Implementation Pattern:_
```javascript
// Electron/Tauri frontend
const { spawn } = require('child_process');
const pythonProcess = spawn('python', ['backend/transcribe.py']);

pythonProcess.stdout.on('data', (data) => {
  const result = JSON.parse(data.toString());
  // Handle transcription result
});

pythonProcess.stdin.write(JSON.stringify({
  action: 'transcribe',
  audioPath: '/path/to/audio.wav'
}));
```

_Advantages:_
- Isolated Python environment
- Can restart Python process if it crashes
- No complex FFI (Foreign Function Interface) required
- Works consistently across platforms

_Sources:_
- [Electron IPC Patterns](https://www.electronjs.org/docs/latest/tutorial/ipc)
- Architecture Research Report (Section 2.3)

**In-Process Integration (Alternative)**

_For Node.js/Electron:_
- Use `node-ffi` or `node-gyp` for C++ extensions
- Integrate whisper.cpp directly via N-API
- Lower latency but more complex

_For Tauri:_
- Rust backend can call Python via PyO3
- Or integrate whisper.cpp directly (Rust bindings)
- Native performance but steeper learning curve

_Trade-offs:_
- Lower latency (no IPC overhead)
- More complex dependency management
- Harder to debug and maintain
- Platform-specific compilation required

### Audio Pipeline Integration

**Audio Capture Integration**

**1. Microphone Input**

_Electron Pattern:_
```javascript
// Frontend: Web Audio API
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const audioData = e.inputBuffer.getChannelData(0);
      // Send to backend via IPC or WebSocket
      sendToBackend(audioData);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  });
```

_Tauri Pattern:_
```rust
// Backend: cpal library
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

let host = cpal::default_host();
let device = host.default_input_device().expect("no input device");
let config = device.default_input_config().expect("Failed to get config");

let stream = device.build_input_stream(
    &config.into(),
    move |data: &[f32], _: &cpal::InputCallbackInfo| {
        // Process audio data
        send_to_stt_engine(data);
    },
    |err| eprintln!("Error: {}", err),
)?;
```

_Sources:_
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [cpal Rust Audio Library](https://github.com/RustAudio/cpal)

**2. System Audio Capture**

_Electron (macOS/Windows):_
```javascript
const { desktopCapturer } = require('electron');

desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
  navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sources[0].id
      }
    },
    video: false
  }).then(stream => {
    // Process system audio
  });
});
```

_Tauri (Platform-Specific):_
- macOS: Core Audio framework via Rust bindings
- Windows: WASAPI via windows-rs crate
- Linux: PulseAudio via libpulse-binding

_Sources:_
- [Electron desktopCapturer](https://www.electronjs.org/docs/latest/api/desktop-capturer)
- [TaurScribe Implementation](https://github.com/machowdh/taurscribe)

**Audio Buffering and Queueing**

_Pattern: Producer-Consumer with Circular Buffer_

```python
import queue
import threading

audio_queue = queue.Queue(maxsize=100)

def audio_producer():
    """Capture audio and add to queue"""
    while recording:
        audio_chunk = capture_audio()  # 30-second chunks
        audio_queue.put(audio_chunk)

def audio_consumer():
    """Process audio from queue"""
    while True:
        audio_chunk = audio_queue.get()
        result = model.transcribe(audio_chunk)
        emit_result(result)
```

_Advantages:_
- Decouples capture from processing
- Handles varying processing speeds
- Prevents audio loss during heavy processing

**Format Conversion Pipeline**

_FFmpeg Integration Pattern:_

```python
import subprocess
import tempfile

def convert_audio(input_path, output_path):
    """Convert any audio format to 16kHz mono WAV"""
    command = [
        'ffmpeg',
        '-i', input_path,
        '-ar', '16000',      # Sample rate
        '-ac', '1',          # Mono channel
        '-c:a', 'pcm_s16le', # PCM encoding
        output_path
    ]
    subprocess.run(command, check=True, capture_output=True)
```

_Sources:_
- [FFmpeg Audio Processing](https://ffmpeg.org/ffmpeg-filters.html#Audio-Filters)
- [Whisper Processing Guide](https://cookbook.openai.com/examples/whisper_processing_guide)

### Desktop App Communication Patterns

**Electron IPC Patterns**

**1. Main Process ↔ Renderer Process**

_Main Process (Backend):_
```javascript
const { ipcMain } = require('electron');

ipcMain.handle('transcribe-audio', async (event, audioPath) => {
  // Spawn Python subprocess or call native module
  const result = await transcribeAudio(audioPath);
  return result;
});
```

_Renderer Process (Frontend):_
```javascript
const { ipcRenderer } = require('electron');

async function transcribe(audioPath) {
  const result = await ipcRenderer.invoke('transcribe-audio', audioPath);
  displayTranscript(result);
}
```

_Pattern: Request-Response_
- Use `invoke/handle` for async operations
- Returns Promise for clean async/await
- Automatic error propagation

**2. Progress Updates**

_Pattern: Event Broadcasting_

```javascript
// Main process
function transcribeWithProgress(audioPath) {
  pythonProcess.stdout.on('data', (data) => {
    const update = JSON.parse(data);
    if (update.type === 'progress') {
      mainWindow.webContents.send('transcribe-progress', update.progress);
    } else if (update.type === 'complete') {
      mainWindow.webContents.send('transcribe-complete', update.result);
    }
  });
}

// Renderer process
ipcRenderer.on('transcribe-progress', (event, progress) => {
  updateProgressBar(progress);
});

ipcRenderer.on('transcribe-complete', (event, result) => {
  displayTranscript(result);
});
```

_Sources:_
- [Electron IPC Tutorial](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)

**Tauri Command/Invoke Patterns**

**Rust Backend Commands:**

```rust
use tauri::command;

#[command]
async fn transcribe_audio(audio_path: String) -> Result<String, String> {
    // Call Python subprocess or whisper.cpp
    let result = run_transcription(&audio_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[command]
async fn get_transcribe_progress() -> Result<f32, String> {
    // Return current progress
    Ok(PROGRESS.load(Ordering::Relaxed))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            transcribe_audio,
            get_transcribe_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Frontend Invocation:**

```typescript
import { invoke } from '@tauri-apps/api';

async function transcribeAudio(audioPath: string) {
  try {
    const result = await invoke('transcribe_audio', { audioPath });
    displayTranscript(result);
  } catch (error) {
    console.error('Transcription failed:', error);
  }
}

// Poll for progress (or use events for real-time updates)
const interval = setInterval(async () => {
  const progress = await invoke('get_transcribe_progress');
  updateProgressBar(progress);
  if (progress >= 100) clearInterval(interval);
}, 500);
```

_Sources:_
- [Tauri Command System](https://tauri.app/v1/guides/features/command/)
- [Tauri IPC](https://tauri.app/v1/guides/features/ipc/)

**WebSocket Pattern (Alternative for Real-Time)**

_Use Case: Real-time transcription with live audio streaming_

```python
# Python backend
import asyncio
import websockets
import json

async def transcribe_handler(websocket, path):
    async for message in websocket:
        audio_chunk = json.loads(message)
        result = model.transcribe(audio_chunk['data'])
        await websocket.send(json.stringify({
            'type': 'partial',
            'text': result['text']
        }))

start_server = websockets.serve(transcribe_handler, "localhost", 8765)
asyncio.get_event_loop().run_until_complete(start_server)
```

```javascript
// Frontend
const ws = new WebSocket('ws://localhost:8765');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'partial') {
    updateLiveTranscript(data.text);
  }
};

// Send audio chunks
function sendAudioChunk(audioData) {
  ws.send(JSON.stringify({ data: audioData }));
}
```

_Advantages:_
- True real-time bidirectional communication
- Lower latency than polling
- Standard protocol, widely supported

_Sources:_
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Python websockets Library](https://websockets.readthedocs.io/)

### File I/O and Export Integration

**Audio File Input Handling**

_Pattern: File Dialog → Validation → Conversion → Processing_

```javascript
// Electron file dialog
const { dialog } = require('electron');

async function openAudioFile() {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['wav', 'mp3', 'm4a', 'flac', 'ogg'] }
    ]
  });

  if (!result.canceled) {
    const audioPath = result.filePaths[0];
    await processAudioFile(audioPath);
  }
}

async function processAudioFile(audioPath) {
  // 1. Validate file
  if (!isValidAudioFile(audioPath)) {
    throw new Error('Invalid audio file');
  }

  // 2. Convert to required format (if needed)
  const convertedPath = await convertToWav16k(audioPath);

  // 3. Send to transcription
  const result = await transcribe(convertedPath);

  // 4. Display results
  displayTranscript(result);
}
```

_Sources:_
- [Electron Dialog API](https://www.electronjs.org/docs/latest/api/dialog)

**Transcript Export Formats**

**1. JSON Export**

```python
import json
from datetime import datetime

def export_json(transcript, audio_filename, output_path):
    data = {
        'metadata': {
            'audio_file': audio_filename,
            'date': datetime.now().isoformat(),
            'model': 'PhoWhisper-medium',
            'duration': transcript['duration']
        },
        'segments': [
            {
                'start': seg['start'],
                'end': seg['end'],
                'text': seg['text'],
                'speaker': seg.get('speaker', 'Unknown'),
                'confidence': seg.get('confidence', 1.0)
            }
            for seg in transcript['segments']
        ]
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
```

**2. SRT Subtitle Export**

```python
def export_srt(transcript, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, seg in enumerate(transcript['segments'], 1):
            start = format_timestamp_srt(seg['start'])
            end = format_timestamp_srt(seg['end'])
            speaker = seg.get('speaker', 'Speaker')

            f.write(f"{i}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"[{speaker}]: {seg['text']}\n\n")

def format_timestamp_srt(seconds):
    """Convert seconds to SRT format: 00:00:00,000"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
```

**3. Plain Text Export**

```python
def export_text(transcript, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        for seg in transcript['segments']:
            speaker = seg.get('speaker', 'Unknown')
            timestamp = format_timestamp_human(seg['start'])
            f.write(f"[{timestamp}] {speaker}: {seg['text']}\n")

def format_timestamp_human(seconds):
    """Convert seconds to human-readable: 00:05:23"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"
```

_Sources:_
- [SRT Format Specification](https://en.wikipedia.org/wiki/SubRip)
- Architecture Research Report (Section 2.4)

**Database Integration for Transcript Storage**

_SQLite Pattern (Local Database):_

```python
import sqlite3
from datetime import datetime

class TranscriptDatabase:
    def __init__(self, db_path='transcripts.db'):
        self.conn = sqlite3.connect(db_path)
        self.create_tables()

    def create_tables(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS transcripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                audio_filename TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                duration REAL,
                model_used TEXT,
                full_text TEXT
            )
        ''')

        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS segments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transcript_id INTEGER,
                start_time REAL,
                end_time REAL,
                speaker TEXT,
                text TEXT,
                confidence REAL,
                FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
            )
        ''')
        self.conn.commit()

    def save_transcript(self, audio_filename, segments, model_used):
        cursor = self.conn.cursor()

        # Insert transcript metadata
        duration = segments[-1]['end'] if segments else 0
        full_text = ' '.join(seg['text'] for seg in segments)

        cursor.execute('''
            INSERT INTO transcripts (audio_filename, duration, model_used, full_text)
            VALUES (?, ?, ?, ?)
        ''', (audio_filename, duration, model_used, full_text))

        transcript_id = cursor.lastrowid

        # Insert segments
        for seg in segments:
            cursor.execute('''
                INSERT INTO segments (transcript_id, start_time, end_time, speaker, text, confidence)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (transcript_id, seg['start'], seg['end'],
                  seg.get('speaker'), seg['text'], seg.get('confidence', 1.0)))

        self.conn.commit()
        return transcript_id

    def search_transcripts(self, query):
        cursor = self.conn.execute('''
            SELECT id, audio_filename, created_at, full_text
            FROM transcripts
            WHERE full_text LIKE ?
            ORDER BY created_at DESC
        ''', (f'%{query}%',))

        return cursor.fetchall()
```

_Advantages:_
- Full-text search capabilities
- Structured storage with relationships
- Local, no server required
- SQL query power for analysis

_Sources:_
- [SQLite Python Documentation](https://docs.python.org/3/library/sqlite3.html)

### Third-Party Library Integration

**FFmpeg Integration**

_Subprocess Pattern (Recommended):_

```python
import subprocess
import os

class FFmpegProcessor:
    @staticmethod
    def convert_to_wav(input_path, output_path):
        """Convert any audio format to 16kHz mono WAV"""
        command = [
            'ffmpeg',
            '-i', input_path,
            '-ar', '16000',          # 16kHz sample rate
            '-ac', '1',              # Mono
            '-c:a', 'pcm_s16le',     # PCM 16-bit
            '-y',                    # Overwrite output
            output_path
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg failed: {result.stderr}")

        return output_path

    @staticmethod
    def extract_audio_from_video(video_path, output_path):
        """Extract audio track from video file"""
        command = [
            'ffmpeg',
            '-i', video_path,
            '-vn',                   # No video
            '-ar', '16000',
            '-ac', '1',
            '-c:a', 'pcm_s16le',
            '-y',
            output_path
        ]

        subprocess.run(command, check=True, capture_output=True)
        return output_path

    @staticmethod
    def get_audio_duration(audio_path):
        """Get audio file duration in seconds"""
        command = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            audio_path
        ]

        result = subprocess.run(command, capture_output=True, text=True)
        return float(result.stdout.strip())
```

_Sources:_
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Whisper Processing Guide](https://cookbook.openai.com/examples/whisper_processing_guide)

**pyannote.audio + Whisper Integration**

_Pipeline Pattern: Sequential Processing_

```python
from faster_whisper import WhisperModel
from pyannote.audio import Pipeline
import torch

class TranscriptionPipeline:
    def __init__(self, whisper_model='medium', device='cuda'):
        # Initialize Whisper
        self.whisper = WhisperModel(
            whisper_model,
            device=device,
            compute_type='int8' if device == 'cuda' else 'int8'
        )

        # Initialize pyannote diarization
        self.diarization = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token="YOUR_HF_TOKEN"
        )

        if torch.cuda.is_available():
            self.diarization.to(torch.device('cuda'))

    def transcribe_with_speakers(self, audio_path):
        # Step 1: Run speaker diarization
        diarization = self.diarization(audio_path)

        # Step 2: Run Whisper transcription
        segments, info = self.whisper.transcribe(
            audio_path,
            word_timestamps=True,
            language='vi'  # Vietnamese
        )

        # Step 3: Merge diarization with transcription
        result = self.merge_speaker_labels(segments, diarization)

        return result

    def merge_speaker_labels(self, transcription_segments, diarization):
        """Assign speaker labels to transcription segments"""
        result = []

        for segment in transcription_segments:
            start = segment.start
            end = segment.end
            text = segment.text

            # Find overlapping speaker from diarization
            speaker = self.find_speaker_at_time(diarization, start, end)

            result.append({
                'start': start,
                'end': end,
                'text': text,
                'speaker': speaker
            })

        return result

    def find_speaker_at_time(self, diarization, start, end):
        """Find speaker label for given time range"""
        mid_time = (start + end) / 2

        for turn, _, speaker in diarization.itertracks(yield_label=True):
            if turn.start <= mid_time <= turn.end:
                return speaker

        return 'Unknown'
```

_Parallel Processing Pattern (Faster):_

```python
import concurrent.futures

def transcribe_with_parallel_processing(audio_path):
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        # Run both pipelines in parallel
        future_whisper = executor.submit(run_whisper, audio_path)
        future_diarization = executor.submit(run_diarization, audio_path)

        # Wait for both to complete
        transcription = future_whisper.result()
        diarization = future_diarization.result()

        # Merge results
        return merge_results(transcription, diarization)
```

_Sources:_
- [pyannote.audio Documentation](https://github.com/pyannote/pyannote-audio)
- [faster-whisper GitHub](https://github.com/SYSTRAN/faster-whisper)
- Architecture Research Report (Section 1.4)

**Hugging Face Transformers Integration**

_For PhoWhisper or ChunkFormer:_

```python
from transformers import AutoProcessor, AutoModelForCTC
import torch

class VietnameseSTT:
    def __init__(self, model_name='khanhld/chunkformer-large-vie'):
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = AutoModelForCTC.from_pretrained(model_name)

        # Move to GPU if available
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

    def transcribe(self, audio_path):
        import librosa

        # Load audio
        audio, sr = librosa.load(audio_path, sr=16000)

        # Process audio
        inputs = self.processor(
            audio,
            sampling_rate=16000,
            return_tensors='pt',
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Inference
        with torch.no_grad():
            logits = self.model(**inputs).logits

        # Decode
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.batch_decode(predicted_ids)[0]

        return transcription
```

_Model Caching Strategy:_

```python
from pathlib import Path
import os

class ModelManager:
    def __init__(self, cache_dir='./models'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)

        # Set Hugging Face cache
        os.environ['TRANSFORMERS_CACHE'] = str(self.cache_dir)

    def load_model(self, model_name, force_download=False):
        model_path = self.cache_dir / model_name.replace('/', '_')

        if model_path.exists() and not force_download:
            # Load from cache
            return AutoModelForCTC.from_pretrained(str(model_path))
        else:
            # Download and cache
            model = AutoModelForCTC.from_pretrained(model_name)
            model.save_pretrained(str(model_path))
            return model
```

_Sources:_
- [Hugging Face Transformers Documentation](https://huggingface.co/docs/transformers)
- Vietnamese STT Research Report (Section 4.1)

### Integration Security Patterns

**API Key Management**

_Pattern: Environment Variables + Keychain_

```python
import os
from keyring import get_password, set_password

class SecureConfig:
    SERVICE_NAME = 'meeting-transcription-app'

    @staticmethod
    def get_api_key(key_name):
        # Try environment variable first
        key = os.getenv(key_name)
        if key:
            return key

        # Try system keychain
        key = get_password(SecureConfig.SERVICE_NAME, key_name)
        return key

    @staticmethod
    def set_api_key(key_name, key_value):
        # Store in system keychain
        set_password(SecureConfig.SERVICE_NAME, key_name, key_value)

# Usage
hf_token = SecureConfig.get_api_key('HUGGINGFACE_TOKEN')
```

**Data Encryption for Sensitive Transcripts**

_Pattern: At-Rest Encryption_

```python
from cryptography.fernet import Fernet
import json

class TranscriptEncryption:
    def __init__(self, key_path='encryption.key'):
        self.key_path = key_path
        self.cipher = self._load_or_generate_key()

    def _load_or_generate_key(self):
        if os.path.exists(self.key_path):
            with open(self.key_path, 'rb') as f:
                key = f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_path, 'wb') as f:
                f.write(key)

        return Fernet(key)

    def encrypt_transcript(self, transcript_data):
        json_data = json.dumps(transcript_data)
        encrypted = self.cipher.encrypt(json_data.encode())
        return encrypted

    def decrypt_transcript(self, encrypted_data):
        decrypted = self.cipher.decrypt(encrypted_data)
        return json.loads(decrypted.decode())
```

_Sources:_
- [Python Cryptography Library](https://cryptography.io/)

---

### Recommended Integration Architecture

**For Vietnamese Meeting Transcription Tool:**

```
┌─────────────────────────────────────────────────────────┐
│                     Desktop App                          │
│                  (Electron or Tauri)                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Frontend (TypeScript)                  │ │
│  │  - Audio capture (Web Audio API / getUserMedia)   │ │
│  │  - Waveform visualization                          │ │
│  │  - Transcript display and editing                  │ │
│  │  - Export controls                                 │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │                                     │
│                    │ IPC / Commands                      │
│                    ↓                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Backend Bridge (Node.js / Rust)            │ │
│  │  - IPC handler                                     │ │
│  │  - Python subprocess management                    │ │
│  │  - File system access                              │ │
│  └─────────────────┬──────────────────────────────────┘ │
└────────────────────┼────────────────────────────────────┘
                     │ stdin/stdout or Socket
                     ↓
┌─────────────────────────────────────────────────────────┐
│           Python STT Backend (Subprocess)               │
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │  Audio Processing Pipeline           │               │
│  │  - FFmpeg format conversion          │               │
│  │  - Sample rate normalization         │               │
│  │  - Chunking with overlap             │               │
│  └─────────────┬────────────────────────┘               │
│                ↓                                         │
│  ┌──────────────────────────────────────┐               │
│  │  Parallel Processing                 │               │
│  │  ┌──────────────┐  ┌───────────────┐│               │
│  │  │  ChunkFormer │  │  pyannote     ││               │
│  │  │  or          │  │  speaker      ││               │
│  │  │  PhoWhisper  │  │  diarization  ││               │
│  │  └──────┬───────┘  └───────┬───────┘│               │
│  │         └───────────────┬────────────┘               │
│  └─────────────────────────┼────────────┘               │
│                            ↓                             │
│  ┌──────────────────────────────────────┐               │
│  │  Result Merger & Post-Processing     │               │
│  │  - Assign speaker labels             │               │
│  │  - Format timestamps                 │               │
│  │  - Generate output                   │               │
│  └─────────────┬────────────────────────┘               │
└────────────────┼────────────────────────────────────────┘
                 │ JSON Response
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  Storage Layer                           │
│  - SQLite database (searchable transcripts)             │
│  - File system (audio files, exports)                   │
│  - Encrypted storage (sensitive transcripts)            │
└─────────────────────────────────────────────────────────┘
```

**Key Integration Points:**

1. **Frontend ↔ Backend**: IPC (Electron) or Commands (Tauri)
2. **Backend ↔ Python**: Subprocess with JSON over stdin/stdout
3. **Python ↔ Models**: Hugging Face Transformers API
4. **Python ↔ FFmpeg**: Subprocess for audio conversion
5. **Python ↔ Storage**: SQLite for transcripts, file system for audio

**Benefits of This Architecture:**
- Clean separation of concerns
- Easy to test each component independently
- Language-appropriate: TypeScript for UI, Python for ML
- Scalable: Can move Python backend to server later
- Maintainable: Standard patterns, minimal custom IPC

---

