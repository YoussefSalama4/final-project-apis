const Audio = require("../models/audioModel");
const User = require("../models/userModel");
const generateAudioLink = require("../utils/generateAudioLink");
const { Client, Storage, InputFile, ID } = require("node-appwrite");

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
  const client = new Client();

  const storage = new Storage(client);

  client
    .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
    .setProject(process.env.PROJECT_ID); // Your project ID
  const { paragraphs, topics } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return next(new AppError("Token is required", 400));
  }
  const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const uploadedFile = req.file;
  if (!uploadedFile) {
    const { audio } = req.body;
    if (!audio) return next(new AppError("No file uploaded or Link Path", 404));
    else {
      const newAudio = await Audio.create({
        ...req.body,
        paragraphs: Array.isArray(paragraphs)
          ? paragraphs
          : JSON.parse(paragraphs),
        topics: Array.isArray(topics) ? topics : JSON.parse(topics),
        owner: user.id,
      });
      res.status(201).json({
        status: "success",
        data: newAudio,
      });
    }
  } else {
    const fileName = uploadedFile.originalname;
    const fileBuffer = uploadedFile.buffer;
    let newFileName = fileName.slice(0, fileName.indexOf("."));
    let fileType = fileName.slice(fileName.indexOf("."));
    newFileName = `${newFileName}${Date.now()}${fileType}`;
    const fileID = ID.unique();
    const promise = storage.createFile(
      process.env.BUCKET_ID,
      fileID,
      InputFile.fromBuffer(fileBuffer, fileName)
    );

    promise.then(
      function (response) {
        console.log(response); // Success
      },
      function (error) {
        return next(new AppError("couldn't upload file", 500));
      }
    );
    const audioLink = generateAudioLink(
      process.env.PROJECT_ID,
      process.env.BUCKET_ID,
      fileID
    );
    const newAudio = await Audio.create({
      ...req.body,
      audio: audioLink,
      paragraphs: Array.isArray(paragraphs)
        ? paragraphs
        : JSON.parse(paragraphs),
      topics: Array.isArray(topics) ? topics : JSON.parse(topics),
      owner: user.id,
      audioName: newFileName,
      appwriteID: fileID,
    });
    res.status(201).json({
      status: "success",
      data: {
        audio: newAudio,
      },
    });
  }
});
exports.updateAudio = catchAsync(async (req, res, next) => {
  if (req.body.audio || req.body.audioName || req.body.owner) {
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
  const client = new Client();

  const storage = new Storage(client);

  client
    .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
    .setProject(process.env.PROJECT_ID); // Your project ID

  const appwriteAudio = await Audio.findById(req.params.id);
  const audio = await Audio.findByIdAndDelete(req.params.id);
  if (!audio) {
    return next(new AppError("Audio not found", 404));
  }
  console.log(appwriteAudio);
  const result = await storage.deleteFile(
    process.env.BUCKET_ID, // bucketId
    appwriteAudio.appwriteID // fileId
  );
  res.status(204).json({
    status: "success",
    data: null,
  });
});
// edit
exports.getUserAudios = catchAsync(async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const targetUser = await User.findById(user.id);
  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }
  const audios = await Audio.find({
    owner: user.id,
  }).select("-__v -owner");
  res.status(200).json({
    status: "success",
    results: audios.length,
    data: {
      audios,
    },
  });
});
