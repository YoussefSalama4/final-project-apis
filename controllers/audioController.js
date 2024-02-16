const Audio = require("../models/audioModel");
const AWS = require("aws-sdk");

const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
exports.getAllAudios = catchAsync(async (req, res, next) => {
  const audios = await Audio.find();
  res.status(200).json({
    status: "success",
    results: audios.length,
    data: {
      audios,
    },
  });
});
exports.getAudio = catchAsync(async (req, res, next) => {
  console.log(req.headers["authorization"]);
  // const decoded = await jwt.verify(token, secretKey);
  const audio = await Audio.findById(req.params.id);
  //Audio.findOne({_id: req.params.id})
  if (!audio) {
    return next(new AppError("No Audio found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      audio,
    },
  });
});
exports.createAudio = catchAsync(async (req, res, next) => {
  const s3 = new AWS.S3();
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return next(new AppError("Token is required", 400));
  }
  const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const uploadedFile = req.file;
  if (req.file.mimetype.split("/")[0] !== "audio") {
    return next(new AppError("You must upload only audio", 400));
  }
  if (!uploadedFile) {
    return next(new AppError("No file uploaded", 404));
  }
  const fileName = uploadedFile.originalname;
  const fileBuffer = uploadedFile.buffer;
  let newFileName = fileName.slice(0, fileName.indexOf("."));
  let fileType = fileName.slice(fileName.indexOf("."));
  newFileName = `${newFileName}${Date.now()}${fileType}`;

  const bucketName = "sumcap-uploads";
  const key = newFileName;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  const newAudio = await Audio.create({
    ...req.body,
    audio: result.Location,
    owner: user.id,
    audioName: newFileName,
  });
  res.status(201).json({
    status: "success",
    data: newAudio,
  });
});
exports.updateAudio = catchAsync(async (req, res, next) => {
  if (req.body.audio || req.body.audioName) {
    return next(
      new AppError("it's not allowed to update audio name or audio url", 400)
    );
  }
  const audio = await Audio.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!audio) {
    return next(new AppError("No Audio found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      audio,
    },
  });
});
exports.deleteAudio = catchAsync(async (req, res, next) => {
  const s3 = new AWS.S3();
  const deletedAudio = await Audio.findById(req.params.id);

  if (!deletedAudio) {
    return next(new AppError("No Audio found with that ID", 404));
  }
  const bucketName = "sumcap-uploads";
  const key = deletedAudio.audioName;

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }
  });
  await Audio.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
// edit
exports.getUserAudios = catchAsync(async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const audios = await Audio.find({
    owner: user.id,
  });
  res.status(200).json({
    status: "success",
    results: audios.length,
    data: {
      audios,
    },
  });
});
