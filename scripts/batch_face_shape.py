import cv2
import mediapipe as mp
import os
import glob
import math

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

def get_distance(p1, p2):
    """Calculates the 3D Euclidean distance between two MediaPipe landmarks."""
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

def determine_shape(face_length, cheekbone_width, jaw_width, forehead_width):
    """Applies the heuristic rules to classify the face shape."""
    width_to_length_ratio = cheekbone_width / face_length
    jaw_to_cheek_ratio = jaw_width / cheekbone_width

    if width_to_length_ratio > 0.85:
        if jaw_to_cheek_ratio > 0.85:
            return "Square"
        else:
            return "Round"
    else:
        if jaw_to_cheek_ratio > 0.85:
            return "Oblong"
        elif forehead_width > cheekbone_width and cheekbone_width > jaw_width:
            return "Heart"
        else:
            return "Oval"

def process_images(folder_path):
    """Reads all images in a folder and outputs their face shape."""
    # Find all common image formats
    image_paths = []
    for ext in ('*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG'):
        image_paths.extend(glob.glob(os.path.join(folder_path, ext)))
        
    if not image_paths:
        print(f"No images found in {folder_path}")
        return

    print(f"{'Filename':<30} | {'Shape':<10} | {'W/L Ratio':<10} | {'J/C Ratio':<10}")
    print("-" * 70)

    for img_path in image_paths:
        image = cv2.imread(img_path)
        if image is None:
            continue
            
        # Convert the BGR image to RGB before processing
        results = face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if not results.multi_face_landmarks:
            print(f"{os.path.basename(img_path):<30} | {'No face':<10} | {'-':<10} | {'-':<10}")
            continue
            
        landmarks = results.multi_face_landmarks[0].landmark
        
        # 1. Calculate distances based on standard anchors
        # Top of forehead (10) to bottom of chin (152)
        raw_face_length = get_distance(landmarks[10], landmarks[152])
        face_length = raw_face_length * 1.25 # Apply your vertical distortion multiplier
        
        # Left cheek (234) to right cheek (454)
        cheekbone_width = get_distance(landmarks[234], landmarks[454])
        
        # Left jaw (132) to right jaw (361)
        jaw_width = get_distance(landmarks[132], landmarks[361])
        
        # Left forehead (54) to right forehead (284)
        forehead_width = get_distance(landmarks[54], landmarks[284])
        
        # 2. Determine shape
        shape = determine_shape(face_length, cheekbone_width, jaw_width, forehead_width)
        
        w_l_ratio = cheekbone_width / face_length
        j_c_ratio = jaw_width / cheekbone_width
        
        print(f"{os.path.basename(img_path):<30} | {shape:<10} | {w_l_ratio:<10.3f} | {j_c_ratio:<10.3f}")

if __name__ == "__main__":
    folder = input("Enter the absolute path to the folder containing images: ")
    if os.path.isdir(folder):
        process_images(folder)
    else:
        print("Invalid directory path.")
