const Audio = require('../models/audioModel');
const jwt = require('jsonwebtoken');

exports.getAllAudios = async (req, res) => {
  try {
    const audios = await Audio.find();
    res.status(200).json({
      status: 'success',
      results: audios.length,
      data: {
        audios,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getAudio = async (req, res) => {
  try {
    console.log(req.headers['authorization']);
    // const decoded = await jwt.verify(token, secretKey);
    const audio = await Audio.findById(req.params.id);
    //Audio.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        audio,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.createAudio = async (req, res) => {
  try {
    const newAudio = await Audio.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        audio: newAudio,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.updateAudio = async (req, res) => {
  try {
    const audio = await Audio.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        audio,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.deleteAudio = async (req, res) => {
  try {
    await Audio.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
// edit
exports.getUserAudios = async (req, res) => {
  try {
    const token =
      req.headers['authorization'].split(' ')[1];
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );
    console.log(user);
    const audios = await Audio.find({
      owner: token,
    });
    res.status(200).json({
      status: 'success',
      results: audios.length,
      data: {
        audios,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
