# 🤖 AI Engine (Python)

The heavy-lifting layer responsible for face detection, embedding generation, and facial recognition.

## 🚀 Technologies
- **Python 3.11**
- **OpenCV** (Image processing)
- **face_recognition** (State-of-the-art dlib wrapper)
- **Flask** (Micro-web framework)

## 📁 Key Files
- `face_processor.py`: The main processing engine.
- `/embeddings/`: Stores 128D facial embeddings as `.pkl` files.
- `/unknown_faces/`: Stores captures of unrecognized faces for admin review.

## 🛠️ Accuracy Factors
- **Resolution**: High-quality images (720p+) recommended.
- **Lighting**: Even lighting significantly improves recognition accuracy.
- **Threshold**: Currently set at 0.6 distance (configurable in backend requests).

## 📦 Running Locally
```bash
pip install -r requirements.txt
python face_processor.py
```

## 🐳 Dockerization
The AI Engine is containerized with all necessary C++ dependencies (`cmake`, `build-essential`) pre-installed, making it very easy to run on Windows without native dependency issues.
