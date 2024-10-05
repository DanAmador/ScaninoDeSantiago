const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Path to the JSON file located in the public folder
const dataFilePath = path.join(__dirname, 'public', 'splats.json');

// Function to read the dataset from the JSON file
const readData = () => {
    try {
        const rawData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
};

// Function to write the updated dataset to the JSON file
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data:', error);
    }
};

// Endpoint to update an entry based on id
app.put('/api/update', (req, res) => {
    const { id, ...updatedFields } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'id is required' });
    }

    const data = readData();

    // Find the index of the entry with the matching id
    const entryIndex = data.findIndex((item) => item.id === id);

    if (entryIndex === -1) {
        return res.status(404).json({ message: 'Entry not found' });
    }

    // Update only the fields that are provided in the request
    const entry = data[entryIndex];
    const updatedEntry = { ...entry, ...updatedFields }; // Merge old entry with new fields

    // Update the dataset with the modified entry
    data[entryIndex] = updatedEntry;

    // Write the updated data back to the JSON file
    writeData(data);

    res.status(200).json({ message: 'Entry updated successfully', updatedEntry });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
