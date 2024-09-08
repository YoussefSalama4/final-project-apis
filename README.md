# final-project-apis

# 🎓 SumCap

**SumCap** is a graduation project application designed to process audio records, whether they come from MP3 files or YouTube links. The application provides several powerful features:

- **Audio Transcription:** Converts audio into text.
- **Text Summarization:** Summarizes the transcribed text into a concise version that highlights key information.
- **Chatbot Integration:** Includes a chatbot capable of answering questions about the content.
- **Topic Detection:** Identifies topics discussed in the audio and maps which parts of the audio correspond to each topic.

## 🔧 Technologies

The APIs for SumCap are built using:

- **Node.js**
- **MongoDB** & **Mongoose**
- **Appwrite**

## 🚀 Features

### User Management

- **Register & Login:** Users can create accounts and log in to access their personal files.
- **Update Information:** Users can update their account details.
- **Delete Account:** Users can delete their accounts.
- **Forgotten Password:** Handle forgotten passwords securely.

### File Management

- **Upload Files:** Users can upload new audio files.
- **Update Files:** Modify existing files.
- **Delete Files:** Remove files as needed.
- **File Storage:** Files are stored in Appwrite cloud storage.

### Post-Processing

- **Transcription:** Convert audio to text that is saved into the DB.
- **Summarization:** Generate a concise summary of the text that is saved into the DB.
- **Topic Detection:** Detect and categorize topics within the audio that is saved into the DB.
