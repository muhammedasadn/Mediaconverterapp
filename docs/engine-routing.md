# Hybrid Engine Routing Specifications

The hybrid router dynamically orchestrates media workloads across client WebAssembly and cloud workers.

## Decision Matrix
1. **File Size**:
   - iOS/Mobile: $\le 35\text{ MB}$ $\rightarrow$ Device wasm; $> 35\text{ MB}$ $\rightarrow$ Cloud.
   - Desktop: $\le 100\text{ MB}$ $\rightarrow$ Device wasm; $> 100\text{ MB}$ $\rightarrow$ Cloud.
2. **Codec Feasibility**:
   - Supported locally: MP3, WAV, AAC, WebM (VP8/VP9), H.264 baseline.
   - Cloud mandatory: AV1, HEVC 10-bit, ProRes, complex multi-pass filters.
3. **RAM & Device Capabilities**:
   - If device memory is constrained or Wasm emits out-of-memory, route to cloud.
4. **User Preference**:
   - Manual override options: `auto`, `device`, `cloud`.
