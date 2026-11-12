# Generate launcher icons + splash PNGs for Kasir POS MANICI (brand: dark green + gold).
# Runs in GitHub Actions before the Gradle build, so no binary files need to be pushed.
import os
from PIL import Image, ImageDraw, ImageFont

GREEN = (14, 42, 30, 255)      # #0e2a1e (MANICI dark green)
GREEN2 = (29, 74, 58, 255)     # #1d4a3a
GOLD = (201, 162, 39, 255)     # #c9a227
GOLD_L = (232, 207, 154, 255)  # #e8cf9a
CREAM = (250, 246, 239, 255)   # #faf6ef

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "apk", "android", "app", "src", "main", "res")

def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def rounded_square(size, radius_frac=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_frac), fill=GREEN)
    return img, d

def draw_M(d, size, color, scale=0.62):
    # huruf "M" tebal di tengah
    f = font(int(size * scale))
    d.text((size / 2, size / 2), "M", font=f, fill=color, anchor="mm")

def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")

# --- launcher icons (mipmap) ---
sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for dpi, s in sizes.items():
    # ic_launcher.png: kotak hijau sudut membulat + M emas
    img, d = rounded_square(s)
    draw_M(d, s, GOLD)
    save(img, os.path.join(ROOT, f"mipmap-{dpi}", "ic_launcher.png"))
    # ic_launcher_round.png: lingkaran hijau + M emas
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, s - 1, s - 1], fill=GREEN)
    draw_M(d, s, GOLD)
    save(img, os.path.join(ROOT, f"mipmap-{dpi}", "ic_launcher_round.png"))
    # ic_launcher_foreground.png: M emas di transparan (adaptive icon)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_M(d, s, GOLD)
    save(img, os.path.join(ROOT, f"mipmap-{dpi}", "ic_launcher_foreground.png"))

# --- splash (drawable) ---
def splash(w, h, path):
    img = Image.new("RGBA", (w, h), GREEN)
    d = ImageDraw.Draw(img)
    # lingkaran emas tipis + "manici"
    cx, cy = w // 2, h // 2 - int(h * 0.03)
    r = int(min(w, h) * 0.16)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD, width=max(3, r // 12))
    draw_M(d, r * 2, GOLD, scale=0.55)
    # teks "manici" di bawah lingkaran
    f = font(int(min(w, h) * 0.07))
    d.text((cx, cy + r + int(h * 0.045)), "manici", font=f, fill=GOLD_L, anchor="mm")
    save(img, path)

splash(512, 512, os.path.join(ROOT, "drawable", "splash.png"))
for dpi, (w, h) in {"mdpi": (320, 470), "hdpi": (480, 640), "xhdpi": (720, 960),
                    "xxhdpi": (1080, 1440), "xxxhdpi": (1440, 1920)}.items():
    splash(w, h, os.path.join(ROOT, f"drawable-port-{dpi}", "splash.png"))
    splash(h, w, os.path.join(ROOT, f"drawable-land-{dpi}", "splash.png"))
print("icons + splash generated")
