def categorize_face_shape(L, Wf, Wc, Wj, angle_left, angle_right):
    if Wc == 0:
        return {"shape": "Unknown", "process": []}
    
    ratio_L = L / Wc 
    rf = Wf / Wc     
    rj = Wj / Wc     
    
    jaw_angle = (angle_left + angle_right) / 2
    is_sharp_jaw = jaw_angle <= 122 # Calibrated for MediaPipe noise
    
    primary = "Oval"
    process = []
    
    # 1. PEAR CHECK
    if Wj > Wc and Wj > Wf:
        primary = "Pear"
        process.append("Jaw is widest point => PEAR")
        
    # 2. UNIFORM / ROUND / SQUARE (High Jaw Ratio)
    elif rj >= 0.835:
        if is_sharp_jaw:
            primary = "Square"
            process.append(f"Wide Jaw ({rj:.2f}) & Sharp Angle ({jaw_angle:.1f}) => SQUARE")
        else:
            primary = "Round"
            process.append(f"Wide Jaw ({rj:.2f}) & Soft Angle ({jaw_angle:.1f}) => ROUND")
            
    # 3. HEART CHECK (Narrower Jaw, Wide Forehead)
    elif rf >= 0.76 and rj < 0.835:
        primary = "Heart"
        process.append(f"Forehead ({rf:.2f}) > Jaw ({rj:.2f}) => HEART")
        
    # 4. TAPERED (Oval / Oblong / Diamond)
    else:
        if ratio_L >= 1.19:
            primary = "Oblong"
            process.append(f"Narrow face & High Length ({ratio_L:.2f}) => OBLONG")
        elif rf < 0.72 and rj < 0.78:
            primary = "Diamond"
            process.append("Double tapered => DIAMOND")
        else:
            primary = "Oval"
            process.append(f"Narrow face & Balanced Length ({ratio_L:.2f}) => OVAL")
            
    return {
        "shape": primary,
        "process": process,
        "ratioL": ratio_L,
        "rf": rf,
        "rj": rj,
        "jawAngle": jaw_angle
    }
