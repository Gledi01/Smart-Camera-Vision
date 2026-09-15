const MODEL_URL = "model/";

let model;
let stream;

const camera = document.getElementById("camera");
const startButton = document.getElementById("startButton");
const statusText = document.getElementById("status");
const predictionsBox = document.getElementById("predictions");

startButton.addEventListener("click", startAI);

async function startAI() {
    try {
        startButton.disabled = true;

        // =========================
        // 1. CEK SECURE CONTEXT
        // =========================

        if (!window.isSecureContext) {
            throw new Error(
                "Website tidak menggunakan HTTPS / secure context."
            );
        }

        if (!navigator.mediaDevices) {
            throw new Error(
                "navigator.mediaDevices tidak tersedia di browser."
            );
        }

        statusText.textContent = "Memuat model AI...";

        // =========================
        // 2. LOAD MODEL
        // =========================

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(
            modelURL,
            metadataURL
        );

        statusText.textContent =
            "Model berhasil dimuat. Meminta kamera...";

        // =========================
        // 3. REQUEST CAMERA
        // =========================

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        // =========================
        // 4. TAMPILKAN CAMERA
        // =========================

        camera.srcObject = stream;

        await camera.play();

        statusText.textContent =
            "🟢 Kamera aktif — AI sedang mendeteksi";

        startButton.textContent =
            "Kamera Aktif";

        predict();

    } catch (error) {

        console.error("CAMERA ERROR:", error);

        startButton.disabled = false;

        statusText.innerHTML =
            "❌ <b>" +
            error.name +
            "</b><br>" +
            error.message;

        /*
        Error yang mungkin:

        NotAllowedError
        = izin kamera ditolak / diblokir

        NotFoundError
        = kamera tidak ditemukan

        NotReadableError
        = kamera sedang digunakan aplikasi lain

        OverconstrainedError
        = konfigurasi kamera tidak cocok

        SecurityError
        = akses kamera diblokir browser

        TypeError
        = mediaDevices tidak tersedia
        */

        alert(
            "Camera Error\n\n" +
            error.name +
            "\n\n" +
            error.message
        );
    }
}


// ========================================
// PREDICTION
// ========================================

async function predict() {

    if (!model || !camera.srcObject) {
        return;
    }

    try {

        const predictions =
            await model.predict(camera);

        predictions.sort(
            (a, b) =>
                b.probability - a.probability
        );

        const best = predictions[0];

        const confidence =
            (best.probability * 100).toFixed(1);

        let html = `
            <div class="best">
                ${best.className}
                <br>
                <small>${confidence}%</small>
            </div>
        `;

        for (const prediction of predictions) {

            const percent =
                (prediction.probability * 100).toFixed(1);

            html += `
                <div class="prediction">

                    <div class="label">
                        <span>
                            ${prediction.className}
                        </span>

                        <span>
                            ${percent}%
                        </span>
                    </div>

                    <div class="bar">
                        <div
                            class="fill"
                            style="width:${percent}%"
                        ></div>
                    </div>

                </div>
            `;
        }

        predictionsBox.innerHTML = html;

    } catch (error) {

        console.error(
            "PREDICTION ERROR:",
            error
        );
    }

    requestAnimationFrame(predict);
}

