import os
import glob
import numpy as np
from PIL import Image
from scipy.ndimage import label, distance_transform_edt

mascot_dir = 'public/mascots'
files = [
    '01-welcome.png',
    '02-Smart_dashboard.png',
    '03-Attendance_calculator.png',
    '04-CGPA_predictor_and_exams.png',
    '05-Circulars_and_notes.png',
    '06-Request_tracker.png',
    '07-Streaks_and_badges.png',
    '08-Digital_ID_card.png',
    '09-Semester_Wrapped.png',
    '10-Login_call_to_action.png'
]

for filename in files:
    filepath = os.path.join(mascot_dir, filename)
    if not os.path.exists(filepath):
        # try space version
        alt = filepath.replace('_', ' ')
        if os.path.exists(alt):
            filepath = alt
        else:
            print(f"Skipping {filename}, not found")
            continue

    im = Image.open(filepath).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape

    # Sample corners to get bg color
    corners = np.array([arr[0, 0], arr[0, -1], arr[-1, 0], arr[-1, -1]])
    bg_col = np.mean(corners, axis=0)

    # Color difference
    diff = np.linalg.norm(arr - bg_col, axis=2)
    # Background threshold
    is_bg_candidate = (diff < 26) | ((arr[:,:,0] > 235) & (arr[:,:,1] > 235) & (arr[:,:,2] > 233))

    # Connected components from edge
    lbl, num = label(is_bg_candidate)
    border_lbls = set(np.unique(lbl[0, :])).union(
        set(np.unique(lbl[-1, :]))
    ).union(
        set(np.unique(lbl[:, 0]))
    ).union(
        set(np.unique(lbl[:, -1]))
    )
    # 0 is non-candidate, so remove 0 if present
    border_lbls.discard(0)

    is_bg = np.isin(lbl, list(border_lbls))
    fg_mask = ~is_bg

    # Soft alpha around edges using distance transform
    dist_inside = distance_transform_edt(fg_mask)
    alpha = np.clip(dist_inside * 255.0 / 1.5, 0, 255).astype(np.uint8)

    # Convert to RGBA
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.array(im, dtype=np.uint8)
    rgba[:, :, 3] = alpha

    # Find tight bounding box
    coords = np.argwhere(alpha > 10)
    if len(coords) == 0:
        print(f"Error: No foreground in {filename}")
        continue

    min_y, min_x = coords.min(axis=0)
    max_y, max_x = coords.max(axis=0)

    # Crop
    cropped_arr = rgba[min_y:max_y+1, min_x:max_x+1]
    cropped_im = Image.fromarray(cropped_arr, mode='RGBA')

    # Save as webp
    base_name = os.path.splitext(filename)[0].replace(' ', '_')
    webp_path = os.path.join(mascot_dir, f"{base_name}.webp")
    cropped_im.save(webp_path, 'WEBP', quality=95)

    # Also save as transparent png with standard name
    png_path = os.path.join(mascot_dir, f"{base_name}.png")
    cropped_im.save(png_path, 'PNG')

    # And with space if needed
    space_png_path = os.path.join(mascot_dir, f"{base_name.replace('_', ' ')}.png")
    if space_png_path != png_path:
        cropped_im.save(space_png_path, 'PNG')

    print(f"Processed {filename}: Cropped {w}x{h} -> {cropped_im.size[0]}x{cropped_im.size[1]} saved to {webp_path}")

print("All mascots cropped and converted to transparent WebP successfully!")
