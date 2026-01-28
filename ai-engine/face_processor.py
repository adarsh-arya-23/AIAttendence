"""
AI Face Recognition Engine for Attendance System
Handles face detection, embedding generation, and recognition
"""

import os
import json
import pickle
import cv2
import face_recognition
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# Configuration
EMBEDDINGS_DIR = Path(__file__).parent / 'embeddings'
UNKNOWN_FACES_DIR = Path(__file__).parent / 'unknown_faces'
CONFIDENCE_THRESHOLD = 0.6  # Lower is more strict (0.0 to 1.0)

# Ensure directories exist
EMBEDDINGS_DIR.mkdir(exist_ok=True)
UNKNOWN_FACES_DIR.mkdir(exist_ok=True)

print("🤖 AI Face Recognition Engine Starting...")
print(f"📁 Embeddings directory: {EMBEDDINGS_DIR}")
print(f"📁 Unknown faces directory: {UNKNOWN_FACES_DIR}")


def load_image(image_path):
    """Load and validate image"""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    # Load image using face_recognition (which uses PIL internally)
    image = face_recognition.load_image_file(image_path)
    return image


def generate_face_embedding(image_path):
    """
    Generate face embedding from a single face image
    Returns: (embedding, face_location) or (None, None) if no face found
    """
    try:
        image = load_image(image_path)
        
        # Detect faces
        face_locations = face_recognition.face_locations(image, model='hog')
        
        if len(face_locations) == 0:
            return None, None
        
        if len(face_locations) > 1:
            print(f"⚠️  Warning: Multiple faces detected in {image_path}, using the first one")
        
        # Generate encoding for the first face
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        if len(face_encodings) == 0:
            return None, None
        
        return face_encodings[0], face_locations[0]
    
    except Exception as e:
        print(f"❌ Error generating embedding: {str(e)}")
        return None, None


def save_embedding(embedding, student_id):
    """Save face embedding to disk"""
    embedding_path = EMBEDDINGS_DIR / f"student_{student_id}.pkl"
    
    with open(embedding_path, 'wb') as f:
        pickle.dump(embedding, f)
    
    return str(embedding_path)


def load_embedding(embedding_path):
    """Load face embedding from disk"""
    if not os.path.exists(embedding_path):
        return None
    
    with open(embedding_path, 'rb') as f:
        embedding = pickle.load(f)
    
    return embedding


def recognize_faces_in_image(image_path, known_students):
    """
    Recognize faces in a classroom image
    
    Args:
        image_path: Path to classroom image
        known_students: List of dicts with {id, roll_number, embedding_path}
    
    Returns:
        {
            'recognized_students': [{student_id, confidence, face_location}],
            'unknown_faces': [{face_location, face_image_path, embedding_path}],
            'total_faces': int
        }
    """
    try:
        print(f"📸 Processing image: {image_path}")
        
        # Load classroom image
        image = load_image(image_path)
        
        # Detect all faces in the image
        print("🔍 Detecting faces...")
        face_locations = face_recognition.face_locations(image, model='hog')
        print(f"✅ Found {len(face_locations)} faces")
        
        if len(face_locations) == 0:
            return {
                'recognized_students': [],
                'unknown_faces': [],
                'total_faces': 0
            }
        
        # Generate encodings for all detected faces
        print("🧬 Generating face encodings...")
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        # Load known student embeddings
        print(f"📚 Loading {len(known_students)} known student embeddings...")
        known_embeddings = []
        known_student_ids = []
        
        for student in known_students:
            if student['embedding_path'] and os.path.exists(student['embedding_path']):
                embedding = load_embedding(student['embedding_path'])
                if embedding is not None:
                    known_embeddings.append(embedding)
                    known_student_ids.append(student['id'])
        
        print(f"✅ Loaded {len(known_embeddings)} valid embeddings")
        
        recognized_students = []
        unknown_faces = []
        
        # Match each detected face
        print("🎯 Matching faces...")
        for idx, face_encoding in enumerate(face_encodings):
            if len(known_embeddings) == 0:
                # No known embeddings, all faces are unknown
                unknown_faces.append({
                    'face_location': face_locations[idx],
                    'face_index': idx
                })
                continue
            
            # Compare with known faces
            face_distances = face_recognition.face_distance(known_embeddings, face_encoding)
            best_match_index = np.argmin(face_distances)
            best_distance = face_distances[best_match_index]
            
            # Convert distance to confidence (0 = perfect match, 1 = no match)
            confidence = 1 - best_distance
            
            if confidence >= CONFIDENCE_THRESHOLD:
                # Recognized student
                student_id = known_student_ids[best_match_index]
                
                # Check if already recognized (avoid duplicates)
                if not any(r['student_id'] == student_id for r in recognized_students):
                    recognized_students.append({
                        'student_id': student_id,
                        'confidence': float(confidence),
                        'face_location': face_locations[idx]
                    })
                    print(f"  ✓ Recognized student {student_id} (confidence: {confidence:.2f})")
            else:
                # Unknown face
                unknown_faces.append({
                    'face_location': face_locations[idx],
                    'face_index': idx,
                    'best_confidence': float(confidence)
                })
                print(f"  ? Unknown face (best match confidence: {confidence:.2f})")
        
        # Save unknown faces as separate images
        print(f"💾 Saving {len(unknown_faces)} unknown faces...")
        for i, unknown in enumerate(unknown_faces):
            top, right, bottom, left = unknown['face_location']
            
            # Extract face region
            face_image = image[top:bottom, left:right]
            
            # Save face image
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            face_filename = f"unknown_{timestamp}_{i}.jpg"
            face_path = UNKNOWN_FACES_DIR / face_filename
            
            # Convert RGB to BGR for OpenCV
            face_image_bgr = cv2.cvtColor(face_image, cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(face_path), face_image_bgr)
            
            # Generate and save embedding for unknown face
            face_encoding = face_encodings[unknown['face_index']]
            embedding_filename = f"unknown_{timestamp}_{i}.pkl"
            embedding_path = EMBEDDINGS_DIR / embedding_filename
            
            with open(embedding_path, 'wb') as f:
                pickle.dump(face_encoding, f)
            
            unknown['face_image_path'] = f"/ai-engine/unknown_faces/{face_filename}"
            unknown['embedding_path'] = str(embedding_path)
            
            # Remove temporary fields
            del unknown['face_index']
        
        print(f"✅ Recognition complete: {len(recognized_students)} recognized, {len(unknown_faces)} unknown")
        
        return {
            'recognized_students': recognized_students,
            'unknown_faces': unknown_faces,
            'total_faces': len(face_locations)
        }
    
    except Exception as e:
        print(f"❌ Recognition error: {str(e)}")
        raise


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'AI Face Recognition Engine is running',
        'embeddings_count': len(list(EMBEDDINGS_DIR.glob('student_*.pkl')))
    })


@app.route('/generate-embedding', methods=['POST'])
def generate_embedding_endpoint():
    """
    Generate face embedding from student photo
    Request: { image_path: str }
    Response: { success: bool, embedding_path: str, message: str }
    """
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        
        if not image_path:
            return jsonify({'success': False, 'error': 'image_path required'}), 400
        
        # Extract student ID from filename or use timestamp
        filename = os.path.basename(image_path)
        student_id = filename.split('-')[0] if '-' in filename else datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Generate embedding
        embedding, face_location = generate_face_embedding(image_path)
        
        if embedding is None:
            return jsonify({
                'success': False,
                'error': 'No face detected in image'
            }), 400
        
        # Save embedding
        embedding_path = save_embedding(embedding, student_id)
        
        return jsonify({
            'success': True,
            'embedding_path': embedding_path,
            'message': 'Face embedding generated successfully'
        })
    
    except Exception as e:
        print(f"❌ Generate embedding error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/recognize-faces', methods=['POST'])
def recognize_faces_endpoint():
    """
    Recognize faces in classroom image
    Request: {
        image_path: str,
        students: [{id, roll_number, embedding_path}]
    }
    Response: {
        success: bool,
        recognized_students: [...],
        unknown_faces: [...],
        total_faces: int
    }
    """
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        students = data.get('students', [])
        
        if not image_path:
            return jsonify({'success': False, 'error': 'image_path required'}), 400
        
        if not students:
            return jsonify({'success': False, 'error': 'students list required'}), 400
        
        # Recognize faces
        result = recognize_faces_in_image(image_path, students)
        
        return jsonify({
            'success': True,
            **result
        })
    
    except Exception as e:
        print(f"❌ Recognize faces error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/update-threshold', methods=['POST'])
def update_threshold():
    """Update confidence threshold"""
    global CONFIDENCE_THRESHOLD
    
    data = request.get_json()
    new_threshold = data.get('threshold')
    
    if new_threshold is None or not (0 <= new_threshold <= 1):
        return jsonify({'error': 'Threshold must be between 0 and 1'}), 400
    
    CONFIDENCE_THRESHOLD = new_threshold
    
    return jsonify({
        'success': True,
        'threshold': CONFIDENCE_THRESHOLD,
        'message': 'Threshold updated successfully'
    })


if __name__ == '__main__':
    # Use environment variable for port, default to 5001
    port = int(os.environ.get('PORT', 5001))
    
    print("\n" + "="*50)
    print("🚀 AI Face Recognition Engine Starting (Production Mode)")
    print("="*50)
    print(f"📊 Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    print(f"🌐 Server port: {port}")
    print("="*50 + "\n")
    
    # In production, we usually run with Gunicorn, but this allows local runs
    app.run(host='0.0.0.0', port=port, debug=False)
