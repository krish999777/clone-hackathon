const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.join(__dirname, 'data', 'data.json');

app.use(cors());
app.use(bodyParser.json());

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

app.get('/api/donations', (req, res) => {
  const all = readData();
  res.json(all);
});

app.post('/api/donations', (req, res) => {
  const d = req.body || {};
  const now = new Date().toISOString();
  const record = {
    id: d.id || uuidv4(),
    itemName: d.itemName || '',
    meals: Number(d.meals || 0),
    veg: Boolean(d.veg),
    preparedOn: d.preparedOn || now,
    expiryOn: d.expiryOn || now,
    address: d.address || '',
    coordinates: d.coordinates || null,
    contactName: d.contactName || '',
    contactPhone: d.contactPhone || '',
    contactType: d.contactType || 'Individual',
    status: d.status || 'notAccepted',
    createdAt: d.createdAt || now
  };
  const all = readData();
  all.push(record);
  writeData(all);
  res.status(201).json(record);
});

app.put('/api/donations/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const all = readData();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  all[idx] = { ...all[idx], ...updates };
  writeData(all);
  res.json(all[idx]);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
