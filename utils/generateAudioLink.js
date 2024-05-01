module.exports = (project, bucket, fileID) => {
  return `https://cloud.appwrite.io/v1/storage/buckets/${bucket}/files/${fileID}/view?project=${project}&mode=admin`;
};
