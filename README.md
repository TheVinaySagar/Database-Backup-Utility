# MongoDB Backup Utility with Google Drive Integration

A command-line tool for automating MongoDB database backups with seamless Google Drive integration, built with Node.js.

![Screenshot 1](https://github.com/user-attachments/assets/5d36af35-1324-4fe6-83c4-dc8cab565421)
![Screenshot 2](https://github.com/user-attachments/assets/660f41a7-3948-46b2-a323-452bf509d05a)

## Features

- **Multiple Backup Types**: Support for full, incremental, and differential backups
- **Google Drive Integration**: Automatic upload of backups to Google Drive
- **Compression**: ZIP compression to minimize storage requirements
- **Cleanup Management**: Configurable retention policy for local backups
- **Backup Listing**: View all available backups in Google Drive
- **User-friendly CLI**: Interactive command-line interface

## Demo

You can view a video demonstration of the project here:
[Demo Video](https://drive.google.com/file/d/1fKfFCbA94mGE1eXtHobE_fv139IR0dQ5/view?usp=sharing)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB Tools (mongodump utility)
- MongoDB instance to backup
- Google Cloud Platform account with Drive API enabled

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/mongodb-backup-utility.git
cd mongodb-backup-utility
```

2. Install dependencies:
```bash
npm install
```

3. Configure Google Drive credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google Drive API
   - Create a service account and generate a key
   - Download the JSON key file and save it as `credentials.json` in the project root directory

4. Create a `.env` file in the project root with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://username:password@localhost:27017/
DB_NAMES=your_database_name

# Backup Configuration
BACKUP_DIR=./backup
DELETION_DAYS=10

# Google Drive
USEREMAIL=your.email@example.com
```

## Usage

Run the application:

```bash
node app.js
```

The command-line interface will guide you through selecting the type of backup:

1. **Full Backup**: Complete backup of the entire database
2. **Incremental Backup**: Backs up only the changes since the last backup
3. **Differential Backup**: Backs up all changes since the last full backup

After the backup completes:
- The backup will be compressed into a ZIP file
- The ZIP file will be uploaded to a folder named "BbBackupService" in Google Drive
- The folder will be shared with the email specified in your .env file
- Local backup files will be automatically cleaned up
- A list of all backups in Google Drive will be displayed

## Understanding Backup Types

- **Full Backup**: Complete snapshot of your entire database. These are larger files but don't depend on other backups for restoration.
- **Incremental Backup**: Captures only data that changed since the last backup (full or incremental). Smaller and faster, but requires previous backups for restoration.
- **Differential Backup**: Captures all data that changed since the last full backup. Larger than incremental backups but requires only the last full backup for restoration.

## Backup Retention

The utility automatically cleans up local backup files based on the `DELETION_DAYS` setting in your `.env` file. Files older than this number of days will be automatically removed from the local backup directory.

## Security Considerations

- Service account credentials have access only to files created by this application
- MongoDB connection string with credentials is kept secure in the `.env` file
- Both `.env` and `credentials.json` are excluded from version control via `.gitignore`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify your MongoDB URI is correct in the `.env` file
   - Ensure MongoDB is running and accessible
   - Check if authentication credentials are correct

2. **Google Drive Upload Failed**
   - Verify `credentials.json` contains valid service account credentials
   - Check that Google Drive API is enabled for your project
   - Ensure the email in `USEREMAIL` has a valid Google account

3. **Command Not Found: mongodump**
   - Ensure MongoDB Tools are installed and added to your system PATH
   - On most systems, install with: `apt-get install mongodb-tools` or equivalent

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MongoDB documentation
- Google Drive API documentation
- Node.js community
