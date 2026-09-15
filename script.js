const MODEL_URL = "./model/";

let model;
let webcam;

const camera = document.getElementById("camera");
const startButton = document.getElementById("startButton");
const statusText = document.getElementById("status");
const predictionsBox = document.getElementById("predictions");

startButton.addEventListener("click", startAI);

async function startAI() {
    try {
        startButton.disabled = true;
        statusText.textContent = "Memuat model AI...";

        // Load model Teachable Machine
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        statusText.textContent = "Meminta izin kamera...";

        // Meminta akses kamera
        const stream = await navigator.mediaDevices.getUserMedia({
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

        camera.srcObject = stream;

        await camera.play();

        statusText.textContent = "AI aktif";

        predict();

    } catch (error) {
        console.error(error);

        statusText.textContent =
            "Gagal mengakses kamera atau model.";

        startButton.disabled = false;

        alert(
            "Kamera tidak bisa digunakan.\n\n" +
            "Pastikan izin kamera diberikan dan website menggunakan HTTPS atau localhost."
        );
    }
}


async function predict() {

    if (!model) return;

    try {

        const predictions = await model.predict(camera);

        // Urutkan dari confidence tertinggi
        predictions.sort((a, b) =>
            b.probability - a.probability
        );

        const best = predictions[0];

        const confidence =
            (best.probability * 100).toFixed(1);

        // Hasil terbaik
        let html = `
            <div class="best">
                ${best.className}
                <br>
                <small>${confidence}%</small>
            </div>
        `;

        // Semua class
        for (const prediction of predictions) {

            const percent =
                (prediction.probability * 100).toFixed(1);

            html += `
                <div class="prediction">

                    <div class="label">
                        <span>${prediction.className}</span>
                        <span>${percent}%</span>
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
        console.error(error);
    }

    // Prediksi terus-menerus
    requestAnimationFrame(predict);
}
