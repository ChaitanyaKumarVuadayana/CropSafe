const URL = "https://teachablemachine.withgoogle.com/models/TOKkU144m/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        // Load the model and metadata
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Setup the webcam
        const flip = true; // Whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // Width, height, flip
        await webcam.setup(); // Request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // Add class labels
            const labelItem = document.createElement("div");
            labelItem.className = "label-item";
            labelItem.innerHTML = `
                <div class="label-name"></div>
                <div class="probability-bar">
                    <div style="width: 0%;"></div>
                    <span>0%</span>
                </div>
            `;
            labelContainer.appendChild(labelItem);
        }
    } catch (error) {
        console.error("Error initializing the model or webcam:", error);
        alert("An error occurred while initializing the webcam or model. Please ensure camera access is granted and try again.");
    }
}

async function loop() {
    webcam.update(); // Update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let highestPrediction = { className: '', probability: 0 };

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className;
        const probability = prediction[i].probability.toFixed(2);

        const labelNameElement = labelContainer.childNodes[i].querySelector(".label-name");
        const barElement = labelContainer.childNodes[i].querySelector(".probability-bar div");
        const percentageElement = labelContainer.childNodes[i].querySelector(".probability-bar span");

        labelNameElement.innerText = classPrediction;
        barElement.style.width = `${probability * 100}%`;
        barElement.style.backgroundColor = `hsl(${(1 - probability) * 120}, 100%, 50%)`; // Color gradient from green to red
        percentageElement.innerText = `${(probability * 100).toFixed(0)}%`;

        if (prediction[i].probability > highestPrediction.probability) {
            highestPrediction = {
                className: prediction[i].className,
                probability: prediction[i].probability
            };
        }
    }

    // Store the highest prediction in localStorage
    localStorage.setItem('highestPrediction', highestPrediction.className);

    // Redirect to solution page after 3 seconds
    setTimeout(() => {
        window.location.href = 'solution.html';
    }, 3000);
}
