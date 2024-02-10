const express = require('express');

const {
  getAllAudios,
  createAudio,
  getAudio,
  updateAudio,
  getUserAudios,
  deleteAudio,
} = require('./../controllers/audioController');

const router = express.Router();

router.route('/').get(getAllAudios).post(createAudio);

router
  .route('/:id')
  .get(getAudio)
  .patch(updateAudio)
  .delete(deleteAudio);

module.exports = router;
