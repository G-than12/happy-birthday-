// --- SISTEM RESET & NAVIGASI PROFESIONAL ---
const screenOrder = [
  "screen-lock",
  "screen-intro",
  "screen-gallery",
  "screen-letter",
  "screen-cake",
  "screen-photobooth",
  "screen-flower",
  "screen-fireworks",
  "screen-capsule",
  "screen-music",
  "screen-planet",
];

// Variabel Global
let cakeCamera = null;
let cakeHands = null;

// --- 1. FUNGSI UNTUK RESET ANIMASI BUNGA ---
function replayFlowerAnimation() {
  const flowerScreen = document.getElementById("screen-flower");
  if (!flowerScreen) return;

  const nightDiv = flowerScreen.querySelector(".night");
  const flowersDiv = flowerScreen.querySelector(".flowers");

  if (nightDiv && flowersDiv) {
    const newNight = nightDiv.cloneNode(true);
    const newFlowers = flowersDiv.cloneNode(true);

    nightDiv.remove();
    flowersDiv.remove();

    flowerScreen.appendChild(newNight);
    flowerScreen.appendChild(newFlowers);
  }
}

// --- 2. MANAJEMEN RESET SCREEN ---
function resetScreenState(screenId) {
  if (screenId === "screen-lock") {
    const icon = document.getElementById("lockIcon");
    if (icon) {
      icon.classList.remove("fa-lock-open");
      icon.classList.add("fa-lock");
      icon.style.color = "var(--pop)";
      gsap.set(icon, { x: 0, scale: 1 });
    }
    isUnlocking = false;
  }
  if (screenId === "screen-intro") {
    gsap.set(".intro-title", { scale: 1, opacity: 1 });
    gsap.fromTo(
      ".intro-title",
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.3)" }
    );
  }
  if (screenId === "screen-letter") {
    const envelope = document.querySelector(".envelope");
    if (envelope) envelope.classList.remove("open");
  }
  if (screenId === "screen-cake") {
    isLit = false;
    isBlown = false;
    const cakeImg = document.getElementById("cakeImg");
    if (cakeImg) cakeImg.src = "assets/cake_unlit.gif";

    const matchImg = document.getElementById("matchImg");
    if (matchImg) matchImg.style.display = "none";

    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.innerText = "Waiting for camera...";
      statusText.style.background = "var(--text)";
    }

    const startBtn = document.getElementById("startCamBtn");
    if (startBtn) startBtn.style.display = "inline-block";

    const nextBtns = document.querySelectorAll(
      "#screen-cake .btn-pop:not(#startCamBtn)"
    );
    nextBtns.forEach((btn) => btn.remove());
  }
  if (screenId === "screen-photobooth") {
    if (pbStream) {
      pbStream.getTracks().forEach((track) => track.stop());
      pbStream = null;
    }
    if (renderInterval) {
      clearInterval(renderInterval);
      renderInterval = null;
    }
    const pbVideoEl = document.getElementById("pb-video");
    if (pbVideoEl) pbVideoEl.srcObject = null;
  }
}

function stopCakeCamera() {
  // 1. Matikan Instance Camera Mediapipe
  if (cakeCamera) {
    try {
      cakeCamera.stop(); // Stop engine AI
    } catch (e) {
      console.log(e);
    }
    cakeCamera = null;
  }

  // 2. Matikan MediaPipe Hands instance
  if (cakeHands) {
    try {
      cakeHands.close();
    } catch (e) {}
    cakeHands = null;
  }

  // 3. Matikan Stream Webcam (Hardware)
  const videoEl = document.getElementById("webcam");
  if (videoEl && videoEl.srcObject) {
    const tracks = videoEl.srcObject.getTracks();
    tracks.forEach((track) => {
      track.stop(); // Matikan lampu kamera
      try {
        videoEl.srcObject.removeTrack(track); // Lepas track
      } catch (e) {}
    });
    videoEl.srcObject = null;
  }

  // 4. Matikan Audio Context & mic analyser (Hentikan loop mic)
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (e) {}
    audioCtx = null;
    analyser = null;
  }
}

// --- 3. NAVIGASI (NEXT & PREV) ---
document.addEventListener("keydown", (e) => {
  const currentScreen = document.querySelector(".screen.active");
  if (!currentScreen) return;
  const currentIndex = screenOrder.indexOf(currentScreen.id);

  if (e.key === "ArrowRight") {
    if (currentIndex < screenOrder.length - 1) {
      if (currentScreen.id === "screen-lock") unlockSystem();
      else nextScreen(screenOrder[currentIndex], screenOrder[currentIndex + 1]);
    }
  }
  if (e.key === "ArrowLeft") {
    if (currentIndex > 0) {
      prevScreen(screenOrder[currentIndex], screenOrder[currentIndex - 1]);
    }
  }
});

let isUnlocking = false;

function nextScreen(currentId, nextId) {
  const current = document.getElementById(currentId);
  const next = document.getElementById(nextId);

  if (!current || !next) {
    console.error("Screen ID not found:", currentId, nextId);
    return;
  }

  // ==========================================
  // 1. LOGIC KELUAR (CLEANUP SCREEN LAMA)
  // ==========================================

  // Stop Kamera Cake (Penting)
  if (currentId === "screen-cake") {
    stopCakeCamera();
  }

  // Stop Kamera Photobooth & render loop saat keluar ke layar lain
  if (currentId === "screen-photobooth") {
    if (pbStream) {
      pbStream.getTracks().forEach((track) => track.stop());
      pbStream = null;
    }
    if (renderInterval) {
      clearInterval(renderInterval);
      renderInterval = null;
    }
    const pbVideoEl = document.getElementById("pb-video");
    if (pbVideoEl) pbVideoEl.srcObject = null;
  }

  // Matikan Iframe Planet (Agar tidak berat dan putus stream kamera)
  if (currentId === "screen-planet") {
    const frame = document.getElementById("frame-planet");
    if (frame) {
      try {
        if (frame.contentWindow && typeof frame.contentWindow.stopSaturnCamera === "function") {
          frame.contentWindow.stopSaturnCamera();
        }
      } catch (e) {}
      frame.src = "";
    }
  }

  // Matikan Iframe Fireworks (Agar tidak berat)
  if (currentId === "screen-fireworks") {
    const frame = document.getElementById("frame-fireworks");
    if (frame) frame.src = "";
  }

  // [REVISI] JANGAN sembunyikan bunga pakai display:none saat keluar
  // karena itu bikin dia hilang total saat kembali. Biarkan saja.

  resetScreenState(nextId);

  // ==========================================
  // 2. LOGIC MASUK (SETUP SCREEN BARU)
  // ==========================================

  // A. LOGIC GALLERY (Stagger Animation)

  // B. LOGIC PLANET (Lazy Load)
  if (nextId === "screen-planet") {
    const frame = document.getElementById("frame-planet");
    if (frame) frame.src = frame.getAttribute("data-src");
  }

  // C. LOGIC FIREWORKS (FORCE RESTART)
  if (nextId === "screen-fireworks") {
    const frame = document.getElementById("frame-fireworks");
    if (frame) {
      const originalSrc = frame.getAttribute("data-src") || "fireworks/fireworks.html";
      const isHttp = window.location.protocol.startsWith("http");
      frame.src = isHttp ? originalSrc + "?t=" + Date.now() : originalSrc;
    }
  }

  // D. LOGIC FLOWER (FORCE RE-BLOOM)
  if (nextId === "screen-flower") {
    // 1. Jalankan fungsi animasi bawaan (jika ada)
    if (typeof replayFlowerAnimation === "function") {
      replayFlowerAnimation();
    }

    // 2. Reset animasi CSS pada elemen .flowers
    // Caranya: Hapus elemennya dari DOM lalu masukkan lagi (Reflow)
    const flowerContainer = document.querySelector(".flowers");
    if (flowerContainer) {
      const parent = flowerContainer.parentNode;
      const clone = flowerContainer.cloneNode(true);

      // Hapus yang lama
      parent.removeChild(flowerContainer);
      // Masukkan yang baru (ini akan memicu ulang animasi CSS dari 0 detik)
      parent.appendChild(clone);
    }
  }

  // E. LOGIC CAPSULE (Reset Tombol)
  if (nextId === "screen-capsule") {
    const btn =
      document.querySelector(".capsule-controls .btn-main") ||
      document.querySelector(".btn-main");
    if (btn) {
      btn.innerHTML = '<i class="fas fa-save"></i> SIMPAN KAPSUL WAKTU';
      btn.style.background = "";
      btn.disabled = false;
    }
  }

  if (nextId === "screen-photobooth") initPhotobooth();

  // ==========================================
  // 3. TRANSISI ANIMASI (GSAP)
  // ==========================================
  gsap.to(current, {
    opacity: 0,
    y: -50,
    duration: 0.5,
    onComplete: () => {
      current.classList.remove("active");
      next.classList.add("active");

      gsap.fromTo(
        next,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    },
  });
}

function prevScreen(currentId, prevId) {
  const current = document.getElementById(currentId);
  const prev = document.getElementById(prevId);

  if (currentId === "screen-cake") {
    stopCakeCamera();
  }

  if (currentId === "screen-photobooth") {
    if (pbStream) {
      pbStream.getTracks().forEach((track) => track.stop());
      pbStream = null;
    }
    if (renderInterval) {
      clearInterval(renderInterval);
      renderInterval = null;
    }
    const pbVideoEl = document.getElementById("pb-video");
    if (pbVideoEl) pbVideoEl.srcObject = null;
  }

  if (currentId === "screen-planet") {
    const frame = document.getElementById("frame-planet");
    if (frame) {
      try {
        if (frame.contentWindow && typeof frame.contentWindow.stopSaturnCamera === "function") {
          frame.contentWindow.stopSaturnCamera();
        }
      } catch (e) {}
      frame.src = "";
    }
  }

  if (currentId === "screen-fireworks") {
    const frame = document.getElementById("frame-fireworks");
    if (frame) frame.src = "";
  }

  resetScreenState(prevId);

  if (prevId === "screen-flower") {
    // 1. Jalankan fungsi animasi bawaan (jika ada)
    if (typeof replayFlowerAnimation === "function") {
      replayFlowerAnimation();
    }

    // 2. Reset animasi CSS pada elemen .flowers
    // Caranya: Hapus elemennya dari DOM lalu masukkan lagi (Reflow)
    const flowerContainer = document.querySelector(".flowers");
    if (flowerContainer) {
      const parent = flowerContainer.parentNode;
      const clone = flowerContainer.cloneNode(true);

      // Hapus yang lama
      parent.removeChild(flowerContainer);
      // Masukkan yang baru (ini akan memicu ulang animasi CSS dari 0 detik)
      parent.appendChild(clone);
    }
  }

  if (prevId === "screen-fireworks") {
    const frame = document.getElementById("frame-fireworks");
    if (frame) {
      const originalSrc = frame.getAttribute("data-src") || "fireworks/fireworks.html";
      const isHttp = window.location.protocol.startsWith("http");
      frame.src = isHttp ? originalSrc + "?t=" + Date.now() : originalSrc;
    }
  }

  // Jika kembali ke Kue Ulang Tahun (misal dari Photobooth):
  // Kamera otomatis langsung nyala kembali
  if (prevId === "screen-cake") {
    setTimeout(() => {
      initExperience();
    }, 400);
  }

  // Jika kembali ke Photobooth (misal dari Bunga):
  // Pilihan 2: Reset bersih otomatis & kamera langsung nyala di slot 1
  if (prevId === "screen-photobooth") {
    setTimeout(() => {
      resetPhotobooth();
      initPhotobooth();
    }, 400);
  }

  // Jika kembali ke Saturnus:
  if (prevId === "screen-planet") {
    const frame = document.getElementById("frame-planet");
    if (frame) frame.src = frame.getAttribute("data-src");
  }

  gsap.to(current, {
    opacity: 0,
    y: 50,
    duration: 0.5,
    onComplete: () => {
      current.classList.remove("active");
      prev.classList.add("active");
      gsap.fromTo(
        prev,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    },
  });
}

/* Fungsi untuk meminta browser masuk mode fullscreen */
function openFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch((err) => {
      console.log("Error attempting to enable fullscreen:", err);
    });
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen();
  }
}

// --- 4. FITUR UNLOCK & INTRO ---
function unlockSystem() {
  if (isUnlocking) return;
  isUnlocking = true;

  // --- [BARU] Panggil Fullscreen tepat saat diklik ---
  openFullscreen();
  // ---------------------------------------------------

  const icon = document.getElementById("lockIcon");

  document
    .getElementById("bgm")
    .play()
    .catch((e) => {
      console.log("Autoplay audio blocked or failed:", e);
    });

  gsap.to(icon, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });

  setTimeout(() => {
    gsap.to(icon, {
      x: 5,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        icon.classList.remove("fa-lock");
        icon.classList.add("fa-lock-open");
        icon.style.color = "white";

        setTimeout(() => {
          nextScreen("screen-lock", "screen-intro");
          // Pastikan fungsi playIntro() sudah didefinisikan di kode kamu
          if (typeof playIntro === "function") {
            playIntro();
          }
        }, 800);
      },
    });
  }, 200);
}

function playIntro() {
  gsap.to(".intro-title", { scale: 1.1, duration: 3 });
  setTimeout(() => {
    if (document.getElementById("screen-intro").classList.contains("active")) {
      nextScreen("screen-intro", "screen-gallery");
    }
  }, 3500);
}

function openLetter(el) {
  el.classList.toggle("open");
}

// --- 5. CAKE LOGIC (Make a Wish) ---
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const cake = document.getElementById("cakeImg");
const match = document.getElementById("matchImg");
const status = document.getElementById("statusText");
const startBtn = document.getElementById("startCamBtn");
let isLit = false,
  isBlown = false;
let audioCtx, analyser;

async function initExperience() {
  // Jika masih ada instance lama, bersihkan dulu
  if (cakeCamera || cakeHands) {
    stopCakeCamera();
  }

  startBtn.style.display = "none";
  status.innerText = "Membuka kamera...";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true,
    });
    video.srcObject = stream;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    const mic = audioCtx.createMediaStreamSource(stream);
    mic.connect(analyser);

    cakeHands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    cakeHands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0, // Model Lite: jauh lebih ringan & cepat
      minDetectionConfidence: 0.5,
    });
    cakeHands.onResults(onHandResults);

    cakeCamera = new Camera(video, {
      onFrame: async () => {
        if (cakeHands) {
          await cakeHands.send({ image: video });
        }
      },
      width: 320,
      height: 240,
    });
    cakeCamera.start();
    status.innerHTML = "☝️ Pakai telunjuk untuk nyalakan lilin";
    detectBlow();
  } catch (e) {
    console.error(e);
    enableManualMode();
  }
}

function enableManualMode() {
  startBtn.style.display = "inline-block";
  startBtn.innerHTML = "MANUAL MODE: KLIK 🔥";
  startBtn.onclick = () => {
    if (!isLit) {
      isLit = true;
      cake.src = "assets/cake_lit.gif";
      startBtn.innerHTML = "TIUP (KLIK) 🌬️";
    } else {
      triggerCelebration();
      startBtn.style.display = "none";
    }
  };
}

function onHandResults(results) {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks.length > 0) {
    const tip = results.multiHandLandmarks[0][8];
    const x = (1 - tip.x) * 320;
    const y = tip.y * 240;
    match.style.display = "block";
    match.style.left = x - 30 + "px";
    match.style.top = y - 80 + "px";
    if (!isLit && x > 100 && x < 220 && y > 150) {
      isLit = true;
      cake.src = "assets/cake_lit.gif";
      match.style.display = "none";
      status.innerHTML = "🌬️ SEKARANG TIUP LILINNYA!";
      status.style.background = "#fff200";
      status.style.color = "black";
    }
  } else {
    match.style.display = "none";
  }
}

function detectBlow() {
  if (!analyser || isBlown) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  if (data.reduce((a, b) => a + b) / data.length > 40 && isLit)
    triggerCelebration();
  requestAnimationFrame(detectBlow);
}

function triggerCelebration() {
  if (isBlown) return;
  isBlown = true;
  cake.src = "assets/cake_unlit.gif";
  status.innerHTML = "🎉 HAPPY BIRTHDAY CITRA!! 🎉";
  status.style.background = "#051fc2";
  status.style.color = "white";

  // Matikan mic & sembunyikan korek api agar hemat CPU saat selebrasi
  // CATATAN: Kamera webcam TETAP NYALA di latar belakang agar transisi ke Photobooth mulus
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (e) {}
    audioCtx = null;
    analyser = null;
  }
  const matchImg = document.getElementById("matchImg");
  if (matchImg) matchImg.style.display = "none";

  confetti({
    particleCount: 200,
    spread: 80,
    colors: ["#051fc2", "#ff005c", "#fff200"],
  });
  setTimeout(() => {
    const existingBtn = document.querySelector("#screen-cake .btn-to-photobooth");
    if (!existingBtn) {
      const btn = document.createElement("button");
      btn.className = "btn btn-pop btn-to-photobooth";
      btn.innerHTML = "LANJUT: PHOTOBOOTH 📸";
      btn.onclick = () => nextScreen("screen-cake", "screen-photobooth");
      document.getElementById("screen-cake").appendChild(btn);
    }
  }, 2000);
}

function toggleMusic() {
  const a = document.getElementById("bgm");
  a.paused ? a.play() : a.pause();
}

// --- 6. PHOTOBOOTH ENGINE ---
let currentSlot = 1;
let slotsFilled = [false, false, false, false];
let pbStream = null;
let renderInterval = null;
const pbVideo = document.getElementById("pb-video");
const snapBtn = document.getElementById("snapBtn");
const slotNumDisplay = document.getElementById("slotNumDisplay");

// [BARU] Fungsi update text tombol berdasarkan toggle switch
function updateButtonText() {
  const isTimerOn = document.getElementById("timerToggle")
    ? document.getElementById("timerToggle").checked
    : false;
  const currentNum = document.getElementById("slotNumDisplay")
    ? document.getElementById("slotNumDisplay").innerText
    : currentSlot;

  // Kita manipulasi text tombol snap tanpa merusak ID span didalamnya
  if (snapBtn) {
    if (isTimerOn) {
      snapBtn.innerHTML = `⏱️ TIMER (3s) #<span id="slotNumDisplay">${currentNum}</span>`;
    } else {
      snapBtn.innerHTML = `📸 SNAP #<span id="slotNumDisplay">${currentNum}</span>`;
    }
  }
}

async function initPhotobooth() {
  // Matikan kamera cake jika ada (dari kode global sebelumnya)
  if (typeof stopCakeCamera === "function") stopCakeCamera();

  const videoElement = document.getElementById("webcam"); // Pastikan referensi ke webcam lama dibersihkan
  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach((t) => t.stop());
    videoElement.srcObject = null;
  }

  // Jika stream lama masih ada, matikan dulu
  if (pbStream) {
    try {
      pbStream.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    pbStream = null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
    pbStream = stream;
    pbVideo.srcObject = stream;
    await pbVideo.play().catch(() => {});

    // Reset status slot & canvas
    slotsFilled = [false, false, false, false];
    for (let i = 1; i <= 4; i++) {
      const cvs = document.getElementById(`slot-${i}`);
      if (cvs) {
        const ctx = cvs.getContext("2d");
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        cvs.classList.remove("filled");
        cvs.classList.remove("active");
      }
    }

    const saveOptions = document.getElementById("saveOptions");
    if (saveOptions) saveOptions.style.display = "none";
    if (snapBtn) {
      snapBtn.style.display = "inline-block";
      snapBtn.disabled = false;
    }

    // Aktifkan slot 1 dan mulai render loop kamera
    activateSlot(1);

    // Pastikan UI tombol benar saat awal
    updateButtonText();
  } catch (e) {
    alert("Camera error: " + e.message);
  }
}

function startRenderLoop() {
  if (renderInterval) clearInterval(renderInterval);
  renderInterval = setInterval(() => {
    // Logic asli kamu: render ke canvas yang sedang ACTIVE saja
    const activeCanvas = document.getElementById(`slot-${currentSlot}`);
    if (activeCanvas && activeCanvas.classList.contains("active")) {
      const ctx = activeCanvas.getContext("2d");
      ctx.save();
      ctx.translate(activeCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(pbVideo, 0, 0, activeCanvas.width, activeCanvas.height);
      ctx.restore();
    }
  }, 33);
}

// --- UPDATE LOGIC TIMER POSITION ---

function activateSlot(slotNum) {
  // Sembunyikan opsi save, tampilkan tombol snap
  document.getElementById("saveOptions").style.display = "none";
  snapBtn.style.display = "inline-block";
  snapBtn.disabled = false;

  // Reset active class
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`slot-${i}`).classList.remove("active");
  }

  currentSlot = slotNum;
  document.getElementById(`slot-${currentSlot}`).classList.add("active");

  // [LOGIC BARU] Pindahkan Timer Overlay ke dalam Container Slot yang Aktif
  const activeContainer = document.getElementById(`container-${slotNum}`);
  const timerOverlay = document.getElementById("countdown-overlay");

  if (activeContainer && timerOverlay) {
    // Append akan memindahkan elemen dari tempat lama ke tempat baru
    activeContainer.appendChild(timerOverlay);
  }

  // Update display angka
  if (document.getElementById("slotNumDisplay")) {
    document.getElementById("slotNumDisplay").innerText = currentSlot;
  }
  updateButtonText();

  startRenderLoop();
}

// [BARU] Wrapper Logic untuk menangani Timer vs Instan
function handleSnap() {
  const isTimerOn = document.getElementById("timerToggle").checked;

  if (isTimerOn) {
    startCountdown(3);
  } else {
    snapPhoto(); // Panggil logic asli kamu
  }
}

// Logic Countdown Tetap (Hanya animasinya disesuaikan sedikit biar smooth di pojok)
function startCountdown(seconds) {
  const overlay = document.getElementById("countdown-overlay");

  snapBtn.disabled = true;
  overlay.style.display = "block"; // Ini akan muncul di POJOK KANAN ATAS slot aktif
  overlay.innerText = seconds;

  // Animasi Pop Kecil
  gsap.fromTo(
    overlay,
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3 }
  );

  let counter = seconds;
  const interval = setInterval(() => {
    counter--;
    if (counter > 0) {
      overlay.innerText = counter;
      // Efek detak
      gsap.fromTo(
        overlay,
        { scale: 0.8 },
        { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }
      );
    } else {
      clearInterval(interval);
      overlay.style.display = "none";
      snapPhoto();
      snapBtn.disabled = false;
    }
  }, 1000);
}

function snapPhoto() {
  // Logic asli: Stop render di slot ini & tandai filled
  document.getElementById(`slot-${currentSlot}`).classList.remove("active");
  document.getElementById(`slot-${currentSlot}`).classList.add("filled");
  slotsFilled[currentSlot - 1] = true;

  // Efek Flash Putih (Tambahan kosmetik biar kerasa "Cekrek")
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = 0;
  flash.style.left = 0;
  flash.style.width = "100%";
  flash.style.height = "100%";
  flash.style.backgroundColor = "white";
  flash.style.zIndex = 9999;
  flash.style.pointerEvents = "none";
  document.body.appendChild(flash);
  gsap.to(flash, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => flash.remove(),
  });

  const allFilled = slotsFilled.every(Boolean);

  if (allFilled) {
    // Jika semua penuh, tampilkan Menu Save
    snapBtn.style.display = "none";

    // Tampilkan grup tombol save (yang berisi Save HD, GIF, dan Reset)
    document.getElementById("saveOptions").style.display = "flex";

    // partikel
    // confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    clearInterval(renderInterval); // Stop kamera loop
  } else {
    // Cari slot kosong berikutnya
    let nextEmpty = -1;
    for (let i = 0; i < 4; i++) {
      if (!slotsFilled[i]) {
        nextEmpty = i + 1;
        break;
      }
    }
    if (nextEmpty !== -1) activateSlot(nextEmpty);
  }
}

function resetPhotobooth() {
  slotsFilled = [false, false, false, false];

  // Clear semua canvas
  for (let i = 1; i <= 4; i++) {
    const cvs = document.getElementById(`slot-${i}`);
    if (cvs) {
      const ctx = cvs.getContext("2d");
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      cvs.classList.remove("filled");
      cvs.classList.remove("active");
    }
  }

  // Reset UI
  const saveOptions = document.getElementById("saveOptions");
  if (saveOptions) saveOptions.style.display = "none";
  if (snapBtn) {
    snapBtn.style.display = "inline-block";
    snapBtn.disabled = false;
  }

  // Jika stream belum aktif, inisialisasi kamera; jika sudah, cukup aktifkan slot 1
  if (!pbStream) {
    initPhotobooth();
  } else {
    // Aktifkan slot 1 lagi
    activateSlot(1);
  }
}

// --- 7. CREATIVE DOWNLOAD ENGINE ---

// [ORIGINAL CODE] Logic ini SAMA PERSIS dengan kodemu sebelumnya
function downloadStripHighQuality() {
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");

  const W = 720;
  const H = 2000;
  tempCanvas.width = W;
  tempCanvas.height = H;

  // Background
  ctx.fillStyle = "#fff200";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffeb3b";
  for (let i = 0; i < W; i += 40) {
    for (let j = 0; j < H; j += 40) {
      ctx.beginPath();
      ctx.arc(i, j, 10, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Kertas Putih
  const paperMargin = 40;
  const paperW = W - paperMargin * 2;
  const paperH = H - paperMargin * 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(paperMargin, paperMargin, paperW, paperH);

  // Border Hiasan
  ctx.strokeStyle = "#ff005c";
  ctx.lineWidth = 8;
  ctx.setLineDash([20, 15]);
  ctx.strokeRect(paperMargin + 10, paperMargin + 10, paperW - 20, paperH - 20);
  ctx.setLineDash([]);

  // Header
  ctx.fillStyle = "#051fc2";
  ctx.font = 'bold 45px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("PROJECT: TWENTY", W / 2, 130);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText("EST. 2005 - 2025", W / 2, 170);

  // FOTO
  const photoW = 480;
  const photoH = 360;
  const startY = 220;
  const gap = 40;

  for (let i = 1; i <= 4; i++) {
    const sourceCanvas = document.getElementById(`slot-${i}`);
    const yPos = startY + (i - 1) * (photoH + gap);
    const xPos = (W - photoW) / 2;

    ctx.fillStyle = "#051fc2";
    ctx.fillRect(xPos + 8, yPos + 8, photoW, photoH);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(xPos, yPos, photoW, photoH);
    ctx.drawImage(sourceCanvas, xPos, yPos, photoW, photoH);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#1a1a1a";
    ctx.strokeRect(xPos, yPos, photoW, photoH);
  }

  // Footer & Stickers
  const footerY = startY + 4 * (photoH + gap) + 20;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = 'bold 30px "Courier New"';
  ctx.fillText("LEVEL 20 UNLOCKED!", W / 2, footerY);

  ctx.font = "70px serif";
  ctx.fillText("👾", W - 80, 120);
  ctx.fillText("💖", 80, footerY + 10);
  ctx.fillText("✨", 80, 120);
  ctx.fillText("🎂", W - 80, footerY + 10);

  const link = document.createElement("a");
  link.download = "Photobooth.png";
  link.href = tempCanvas.toDataURL("image/png");
  link.click();
}

// [BARU] Logic Download GIF
// Ini akan membuat animasi dari 4 foto yang sudah diambil
function createAndDownloadGIF() {
  // --- 1. SETUP TOMBOL (Sesuai Base Code Kamu) ---
  const btn =
    typeof event !== "undefined" && event && event.target
      ? event.target.closest("button") || event.target
      : document.querySelector("#saveOptions button:nth-child(2)");
  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ GENERATING GIF...";
  btn.disabled = true;

  // --- 2. SETUP WORKER (Sesuai Base Code Kamu - TIDAK DIGANTI) ---
  const workerBlob = new Blob(
    [
      `importScripts('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js');`,
    ],
    { type: "application/javascript" }
  );
  const workerUrl = URL.createObjectURL(workerBlob);

  // --- 3. KONFIGURASI GIF ---
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: 600,
    height: 750,
    workerScript: workerUrl,
    background: "#ffffff",
  });

  // --- 4. LOOPING FRAME (Desain Baru Final) ---
  for (let i = 1; i <= 4; i++) {
    const slotCanvas = document.getElementById(`slot-${i}`);
    if (!slotCanvas) continue;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 600;
    tempCanvas.height = 750;
    const ctx = tempCanvas.getContext("2d");

    // A. BACKGROUND PUTIH
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 750);

    // B. BORDERS (Pink Luar & Biru Putus-putus Dalam)
    // 1. Garis Pink Tebal Luar
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#ff005c"; // Warna Pink
    ctx.setLineDash([]); // Reset dash
    ctx.strokeRect(10, 10, 580, 730);

    // 2. Garis Biru Kecil Putus-putus Dalam
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#051fc2"; // Warna Biru Tua
    // [panjang_garis, panjang_jeda] -> membuat efek putus-putus
    ctx.setLineDash([8, 15]); 
    ctx.strokeRect(30, 30, 540, 690); // Posisi agak ke dalam dari garis pink
    ctx.setLineDash([]); // Reset agar gambar lain tidak putus-putus

    // C. HEADER TEXT (Gaya Photobooth)
    ctx.fillStyle = "#1a1a1a";
    ctx.textAlign = "center";
    ctx.font = "bold 45px 'Pixelify Sans', sans-serif";
    ctx.fillText("PROJECT: TWENTY", 300, 85);

    // D. AREA FOTO DENGAN SHADOW TEBAL
    const pW = 520;
    const pH = 390;
    const pX = (600 - pW) / 2;
    const pY = 130;

    // 1. Shadow Tebal(Digambar dulu di belakang)
    ctx.fillStyle = "#051fc2"; // Biru Tua
    // Offset +15px ke kanan bawah untuk efek retro shadow
    ctx.fillRect(pX + 4.5, pY + 4.5, pW, pH);

    // 2. Foto Asli (Digambar di atas shadow)
    ctx.drawImage(slotCanvas, 0, 0, slotCanvas.width, slotCanvas.height, pX, pY, pW, pH);

    // 3. Outline Tipis Hitam di Foto (Opsional, biar lebih tegas)
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.strokeRect(pX, pY, pW, pH);

    // E. EMOTICON STICKERS (Di pojok foto)
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    // Sticker Kiri Atas Foto
    ctx.fillText("", pX + 35, pY + 50); 
    // Sticker Kanan Atas Foto
    ctx.fillText("", pX + pW - 35, pY + 50);

    // F. FOOTER TEXTS
    const footerY = pY + pH;

    // 1. Tanggal (Gaya Pixel kecil)
    ctx.font = "bold 18px 'Pixelify Sans', sans-serif";
    ctx.fillStyle = "#555";
    const date = new Date().toLocaleDateString().toUpperCase();
    ctx.fillText("CAPTURED ON " + date, 300, footerY + 55);

    // 2. Main Footer (Gaya Photobooth)
    ctx.font = "bold 40px 'Pixelify Sans', sans-serif";
    ctx.fillStyle = "#1a1a1a"; 
    ctx.fillText("LEVEL 20 UNLOCKED!", 300, footerY + 115);

    // Tambah frame
    gif.addFrame(tempCanvas, { delay: 600 });
  }

  // --- 5. RENDER & DOWNLOAD (Sesuai Base Code Kamu) ---
  gif.on("finished", function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PROJECT20_MOMENTS.gif";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    btn.innerHTML = originalText;
    btn.disabled = false;
  });

  gif.render();
}

function toggleLetter(e) {
  if (e.target.closest("#btnWish") || e.target.id === "btnWish") {
    return;
  }

  const envelope = document.getElementById("envelopeItem");
  envelope.classList.toggle("open");
}
function goToCake(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  nextScreen("screen-letter", "screen-cake");
}

// --- FITUR TIME CAPSULE ---

// 1. Set Tanggal Hari Ini Otomatis
function initCapsule() {
  const dateElement = document.getElementById("currentDate");
  const today = new Date();
  // Format tanggal: DD/MM/YYYY
  const dateString = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (dateElement) {
    dateElement.innerText = dateString;
  }
}

// Panggil fungsi ini saat halaman dimuat
window.addEventListener("DOMContentLoaded", initCapsule);

// 2. Fungsi Simpan & Download Gambar
// --- FUNGSI SAVE CAPSULE (FIXED: TEXT TIDAK KEPOTONG) ---
// --- 1. FUNGSI SAVE CAPSULE (UPDATED) ---
function saveCapsule() {
  const textarea = document.getElementById("futureNote");
  const printView = document.getElementById("futureNote-print");
  const container = document.querySelector(".terminal-container"); // Area yang mau difoto
  const btn = document.querySelector(".btn-main");

  // 1. Cek apakah ada isinya
  if (textarea.value.trim() === "") {
    alert("Tulis pesan dulu dong untuk masa depan! 😠");
    return;
  }

  // 2. Ubah tombol jadi loading
  const originalText = btn.innerHTML;
  btn.innerHTML = "MENCETAK KAPSUL... 🖨️";
  btn.disabled = true;

  // --- [TRIK RAHASIA MULAI] ---

  // Salin tulisan dari textarea ke div cetak
  printView.innerText = textarea.value;

  // Aktifkan mode cetak (sembunyikan textarea, munculkan div panjang)
  container.classList.add("printing-mode");

  // --- [TRIK RAHASIA SELESAI] ---

  // 3. Mulai Screenshot
  html2canvas(document.getElementById("capture-area"), {
    scale: 2, // Resolusi tinggi
    backgroundColor: "#ffffff", // Background putih di luar terminal
    useCORS: true,
    // Opsi ini memaksa html2canvas merender tinggi penuh
    windowHeight: document.getElementById("capture-area").scrollHeight + 100,
  })
    .then((canvas) => {
      // Download Gambar
      const link = document.createElement("a");
      link.download = "TIME_CAPSULE_LEVEL_20.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      // 4. Kembalikan Tampilan Seperti Semula
      container.classList.remove("printing-mode"); // Textarea muncul lagi

      btn.innerHTML = "TERSIMPAN!";
      btn.style.backgroundColor = "#27c93f";

      // [PERBAIKAN PENTING]
      // Kita nyalakan lagi tombolnya agar user bisa simpan ulang jika diedit
      btn.disabled = false;
    })
    .catch((err) => {
      console.error("Gagal capture:", err);
      alert("Yah, gagal menyimpan gambar. Coba lagi ya.");
      // Jangan lupa kembalikan tampilan jika error
      container.classList.remove("printing-mode");
      btn.innerHTML = originalText;
      btn.disabled = false;
    });
}

// --- 2. LOGIKA RESET TOMBOL SAAT MENGETIK ULANG ---
// Letakkan kode ini di bawah fungsi saveCapsule atau di bagian paling bawah file JS
const futureNoteArea = document.getElementById("futureNote");
if (futureNoteArea) {
  futureNoteArea.addEventListener("input", function () {
    const btn = document.querySelector(".btn-main"); // Pastikan selector tombol sama
    // Cek jika tombol sedang dalam status "TERSIMPAN" (warnanya hijau)
    if (btn && btn.style.backgroundColor === "rgb(39, 201, 63)") {
      // Reset Text & Warna ke awal
      btn.innerHTML = '<i class="fas fa-save"></i> SIMPAN KAPSUL WAKTU'; // Sesuaikan teks asli tombolmu
      btn.style.backgroundColor = ""; // Hapus warna hijau (kembali ke CSS)
      btn.disabled = false;
    }
  });
}
