// server.js (CommonJS)
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json());

// OPTIONAL: serve the public folder so /splats.json is reachable from this server
app.use(express.static(path.join(__dirname, '../public')));

// Path to JSON file
const dataFilePath = path.join(__dirname, '../public', 'splats.json');

// --- helpers ---
const readData = () => {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('Error reading data:', e);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing data:', e);
  }
};

// shallow check for plain objects (arrays should replace)
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// deep merge that replaces arrays/tuples but recursively merges objects
const mergeDeep = (target, source) => {
  if (!isPlainObject(target) || !isPlainObject(source)) return source;
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    out[key] = Array.isArray(sv) ? sv : isPlainObject(sv) ? mergeDeep(isPlainObject(tv) ? tv : {}, sv) : sv;
  }
  return out;
};

// --- routes ---

// Update by localUrl (unique id)
// Body: Partial<ParsedSplat> & { localUrl: string }
app.put('/api/update', (req, res) => {
  console.log("Received update request:", req.body);
  const { localUrl, ...patch } = req.body || {};

  if (!localUrl || typeof localUrl !== 'string') {
    return res.status(400).json({ message: 'localUrl is required' });
  }

  const data = readData();
  const idx = data.findIndex((it) => it.localUrl === localUrl);
  if (idx === -1) return res.status(404).json({ message: 'Entry not found' });

  const current = data[idx];

  // Never allow changing the identity in this endpoint
  if (patch.localUrl && patch.localUrl !== localUrl) {
    delete patch.localUrl;
  }

  // Merge top-level, but keep nested clip/transform deep
  const next = { ...current };

  if (patch.clip) {
    next.clip = mergeDeep(current.clip || {}, patch.clip);
    delete patch.clip;
  }
  if (patch.transform) {
    next.transform = mergeDeep(current.transform || {}, patch.transform);
    delete patch.transform;
  }

  // Merge remaining flat fields (name/date/location etc.)
  Object.assign(next, patch);

  data[idx] = next;
  writeData(data);

  return res.status(200).json({ message: 'Entry updated successfully', updatedEntry: next });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
