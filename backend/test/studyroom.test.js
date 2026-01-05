const StudyRoom = require('../models/studyRoom'); // Assurez-vous que le chemin est bon
// OU si vous utilisez "import" : import StudyRoom from '../models/studyRoom.js';

// 1. CREATE (POST /api/study-rooms)
exports.createStudyRoom = async (req, res) => {
  try {
    const newRoom = new StudyRoom(req.body);
    const savedRoom = await newRoom.save();
    // Le test attend un statut 201
    res.status(201).json(savedRoom);
  } catch (error) {
    // C'est ici que l'erreur 500 actuelle est générée
    console.error("Error creating room:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. GET BY ID (GET /api/study-rooms/:id)
exports.getStudyRoomById = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    
    // Le test "returns 404 when fetching deleted room" attend ceci :
    if (!room) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE (PUT /api/study-rooms/:id)
exports.updateStudyRoom = async (req, res) => {
  try {
    // { new: true } permet de renvoyer l'objet modifié, ce que le test vérifie
    const updatedRoom = await StudyRoom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. DELETE (DELETE /api/study-rooms/:id)
exports.deleteStudyRoom = async (req, res) => {
  try {
    const deletedRoom = await StudyRoom.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Le test attend un message contenant "deleted"
    res.status(200).json({ message: 'Study room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Si vous avez une fonction pour "getAll", vous pouvez la laisser telle quelle.