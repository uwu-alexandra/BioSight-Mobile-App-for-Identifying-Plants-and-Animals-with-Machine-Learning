from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import json
from pathlib import Path
from werkzeug.utils import secure_filename


root_dir = Path(__file__).parent

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)

# Load class names from JSON only once
with open(root_dir/'class_names_plants.json') as f:
    class_names_flowers = json.load(f)

with open(root_dir/'class_names_animals.json') as f:
    class_names_animals = json.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_data = file.read()

    # Process the image once and resize for both models
    img = tf.io.decode_image(file_data, channels=3)
    img_flower = tf.image.resize(img, [299, 299]) / 255.0
    img_flower = tf.expand_dims(img_flower, 0)
    img_animal = tf.image.resize(img, [224, 224]) / 1.0
    img_animal = tf.expand_dims(img_animal, 0)

    flower_model_path = root_dir/'my_flower_classifier_model'
    animal_model_path = root_dir/'my_animal_classifier_model.h5'
    print(flower_model_path)
    # Load models lazily
    flower_model = tf.keras.models.load_model(flower_model_path, compile=False)
    animal_model = tf.keras.models.load_model(animal_model_path, compile=False)

    # Make predictions
    predictions_flower = flower_model.predict(img_flower)
    predictions_animal = animal_model.predict(img_animal)

    # Determine which model is more confident
    confidence_flower = np.max(predictions_flower)
    confidence_animal = np.max(predictions_animal)

    if confidence_flower > confidence_animal:
        predictions = predictions_flower
        class_names = class_names_flowers
        model_name = "Flower Model"
    else:
        predictions = predictions_animal
        class_names = class_names_animals
        model_name = "Animal Model"

    predicted_class = np.argmax(predictions, axis=1)[0]
    confidence = np.max(predictions) * 100


    if isinstance(class_names, list):
        predicted_class_name = class_names[predicted_class]

    top_predictions = tf.nn.top_k(predictions, k=3)

    prediction_result = {
        'model_used': model_name,
        'predicted_class': predicted_class_name,
        'confidence': f"{confidence:.2f}%",
        'top3': [{'class_name': class_names.get(top_predictions.indices.numpy()[0][i], "Unknown class")
        if isinstance(class_names, dict) else class_names[top_predictions.indices.numpy()[0][i]],
                  'confidence': f"{top_predictions.values.numpy()[0][i] * 100:.2f}%"}
                 for i in range(3)]
    }
    return jsonify(prediction_result)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
