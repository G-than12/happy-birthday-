<div align="center">
  <h1>🎂 Project: Twenty</h1>
  <p><strong>Interactive birthday surprise website for a 20th birthday celebration.</strong></p>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Camera](https://img.shields.io/badge/Webcam-Interactive-4F46E5?style=flat-square)](https://developers.google.com/mediapipe)

</div>

<hr />

## 🚀 Overview

This project is a personalized birthday experience built as a digital surprise journey. It combines a locked-screen intro, gallery memories, a heartfelt birthday letter, camera-based celebration ritual, photobooth, and a flower-fireworks ending into one immersive page.

The experience is designed to feel nostalgic, warm, and memorable while still being lightweight and easy to run locally in any browser.

## ✨ Highlights

- 🎁 Unlock screen and animated intro sequence
- 📷 Memory gallery with custom photo frames
- 💌 Personalized birthday message for the recipient
- 📸 Interactive webcam-based wish ritual and photobooth
- 🎊 Final flower and fireworks celebration scene
- 🎵 Background music and motion effects for a richer experience
- 💾 Save options for image and GIF export

## 🖥️ Preview & Screen Flow

The preview below follows the experience screen by screen. Each screen is interactive and continues the birthday journey in sequence.

### 1. Lock Screen

The experience starts on a locked screen. Tap the lock icon to unlock the website, start the background music, and continue to the intro.

### 2. Welcome Screen

The animated intro welcomes into her new era. After the animation finishes, the website automatically continues to the memories screen.

### 3. Memories Gallery

Four selected memories are displayed in a film-strip layout. Press **READ MESSAGE** to continue to the birthday letter, or **BACK** to return to the welcome screen.

### 4. Birthday Letter

Tap the envelope to open or close the letter. Once the message is open, press **MAKE A WISH** to enter the birthday ritual.

### 5. Make a Wish

Press **START RITUAL** and allow camera access. The webcam and hand-tracking interaction guide the user through lighting the birthday cake before continuing to the photobooth.

### 6. Photobooth

Take four photos to fill the photo strip. Shots can be taken instantly or with a three-second timer. When the strip is complete, save it as an HD image or animated GIF, reset it for another session, or press **SEE GIFT** to continue.

### 7. Flower Gift

An animated flower garden appears with the message **Keep Blooming!** Press **See surprise** to open the next celebration screen.

### 8. Fireworks

The celebration continues with a full-screen fireworks animation. Press the button at the bottom to create a message for the future.

### 9. Future Message

Write a personal wish for at level 25, then press **SIMPAN KAPSUL WAKTU** to download and keep the time-capsule message. Press **A Song** to continue.

### 10. Music Player

The birthday soundtrack is presented as a spinning vinyl player. The center control pauses or resumes the music. Press **See Planet** for the final screen.

### 11. Favorite Planet

The journey ends with an interactive Saturn scene representing favorite planet. Use **BACK** at any time to revisit the previous screen.

```text
Lock → Welcome → Memories → Letter → Make a Wish → Photobooth
     → Flowers → Fireworks → Future Message → Music → Planet
```

## �🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Animation:** GSAP
- **Effects:** Canvas Confetti
- **Camera interaction:** MediaPipe Hands
- **Export support:** GIF.js
- **Asset style:** Custom CSS + visual storytelling layout

## 📁 Project Structure

```text
happy-bitrthday-
├── assets/                  # Images, audio, and visual assets
├── fireworks/               # Fireworks scene component files
├── saturn/                  # Additional creative visual experience
├── flowers.css              # Flower animation styling
├── index.html               # Main birthday experience page
├── main.js                  # Main project logic and interactions
├── scriptmain.js            # Additional script support
├── style.css                # Core styling and layout
├── README.md                # Project documentation
└── ...
```

## 📷 Photo Booth Output

The photobooth supports two export options:

- **SAVE IMG (HD)** — saves the final strip as a high-quality image
- **SAVE GIF (HD)** — saves the result as an animated GIF

This makes the project suitable for sharing the birthday moment as either a still image or a moving memory.

## ▶️ Getting Started

Because this is a frontend project, you can run it directly in a browser or serve it locally.

### Option 1: Open directly

Open the project folder and run `index.html` in your browser.

### Option 2: Start a local server

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## ⚠️ Important Notes

- Some features, such as the webcam ritual and photo booth, require browser camera permission.
- For the best experience, use a modern browser like Chrome or Edge.
- This project is personalized for a birthday concept, so you may want to replace names, photos, and music with your own content.

## 💡 Personalization Ideas

If you want to adapt this project for another special moment:

- Replace the birthday letter message
- Update the image files in the `assets/` folder
- Swap the background music track
- Change the final flower/fireworks text and theme colors
- Customize the design for different events or anniversaries

## 🙌 Credits

This is a custom creative birthday project built with HTML, CSS, and JavaScript as a personal digital surprise.

## 📜 License

This project is intended for personal and educational use. Please respect the original assets and content before reusing or publishing them publicly.

## 💌 Closing Message

A birthday is more than a date—it is a memory, a wish, and a celebration of growth. This project was created to turn that feeling into a small interactive digital experience filled with love, joy, and gratitude.
