const camera = document.getElementById("camera");
const button = document.getElementById("cameraButton");
const status = document.getElementById("status");
const result = document.getElementById("result");
const confidenceText = document.getElementById("confidence");

let model = null;
let stream = null;


// ======================================================
// TOMBOL KAMERA
// ======================================================

button.addEventListener("click", startCamera);


async function startCamera() {

    try {

        button.disabled = true;

        status.textContent =
            "📷 Meminta izin kamera...";


        // ==================================================
        // CEK BROWSER
        // ==================================================

        if (!navigator.mediaDevices) {

            throw new Error(
                "Browser tidak mendukung akses kamera."
            );

        }


        // ==================================================
        // PERMINTAAN IZIN KAMERA
        // ==================================================

        stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }
                },

                audio: false

            });


        // ==================================================
        // KAMERA BERHASIL
        // ==================================================

        camera.srcObject = stream;

        camera.style.display = "block";

        await camera.play();


        status.textContent =
            "🟢 Kamera berhasil diaktifkan";


        button.textContent =
            "🟢 KAMERA AKTIF";


        // ==================================================
        // CEK TEACHABLE MACHINE
        // ==================================================

        if (typeof tmImage === "undefined") {

            throw new Error(
                "Library Teachable Machine gagal dimuat."
            );

        }


        status.textContent =
            "🧠 Memuat model AI...";


        // ==================================================
        // LOAD MODEL
        // ==================================================

        model = await tmImage.load(

            "./model/model.json",

            "./model/metadata.json"

        );


        status.textContent =
            "🟢 AI siap mendeteksi";


        // ==================================================
        // MULAI DETEKSI
        // ==================================================

        detect();


    } catch (error) {

        console.error(
            "ERROR:",
            error
        );


        button.disabled = false;


        status.textContent =
            "❌ " + error.name;


        result.textContent =
            error.message;


        confidenceText.textContent =
            "";


        // Kalau kamera sempat aktif lalu model gagal
        if (stream) {

            stream.getTracks().forEach(
                track => track.stop()
            );

            stream = null;

            camera.srcObject = null;

            camera.style.display = "none";

        }

    }

}


// ======================================================
// AI DETECTION
// ======================================================

async function detect() {

    if (!model) return;


    try {

        const predictions =
            await model.predict(camera);


        // Urutkan confidence terbesar
        predictions.sort(
            (a, b) =>
                b.probability - a.probability
        );


        const best =
            predictions[0];


        const confidence =
            (
                best.probability * 100
            ).toFixed(1);


        result.textContent =
            best.className;


        confidenceText.textContent =
            confidence + "%";


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

    }


    requestAnimationFrame(detect);

}

