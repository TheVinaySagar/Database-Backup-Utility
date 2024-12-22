### Database Backup utility
![Screenshot 2024-11-13 184807](https://github.com/user-attachments/assets/5d36af35-1324-4fe6-83c4-dc8cab565421)
![Screenshot 2024-11-13 184858](https://github.com/user-attachments/assets/660f41a7-3948-46b2-a323-452bf509d05a)

## Demo Video: You can view a video demonstration of the project at the following link:

https://drive.google.com/file/d/1fKfFCbA94mGE1eXtHobE_fv139IR0dQ5/view?usp=sharing


# DB Backup CLI Tool with Google Drive Integration

A command-line utility for automated database backups with seamless Google Drive integration, built with Node.js.

## Features

- Automated database backup generation
- Secure Google Drive integration for remote storage
- Configurable backup schedules
- Support for multiple database types
- Compression and encryption options
- Retention policy management
- Command-line interface for easy interaction

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Access to the database you want to backup
- Google Cloud Platform account with Drive API enabled

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/db-backup-cli.git
cd db-backup-cli
```

2. Install dependencies:
```bash
npm install
```

3. Configure Google Drive credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google Drive API
   - Create credentials (OAuth 2.0 client ID)
   - Download the credentials file and rename it to `credentials.json`
   - Place it in the project's root directory

## Configuration

Create a `.env` file in the project root with the following variables:

```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_TYPE=mysql|postgres|mongodb
BACKUP_PATH=./backups
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
RETENTION_DAYS=7
```

## Usage

### Basic Commands

1. Create a backup:
```bash
npm run backup
```

2. Create and upload to Google Drive:
```bash
npm run backup:drive
```

3. List existing backups:
```bash
npm run list
```

4. Clean old backups:
```bash
npm run clean
```

### Advanced Usage

#### Schedule Automated Backups

Add a cron job or use the built-in scheduler:

```bash
npm run schedule "0 0 * * *"  # Runs daily at midnight
```

#### Custom Backup Options

```bash
npm run backup -- --compress --encrypt --retention=30
```

## Backup Strategy

The tool implements the following backup strategy:
1. Creates a full backup of the specified database
2. Compresses the backup file to save storage space
3. Encrypts the backup (if enabled)
4. Uploads to Google Drive with proper naming convention
5. Manages retention policy by removing old backups
6. Validates backup integrity

## Security

- All sensitive information is stored in environment variables
- Backups can be encrypted using AES-256 encryption
- Google Drive API uses OAuth 2.0 for secure authentication
- No sensitive data is logged or exposed in error messages

## Error Handling

The tool implements robust error handling:
- Database connection issues
- Google Drive API errors
- File system operations
- Network connectivity problems
- Authentication failures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/yourusername/db-backup-cli/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about your setup and the issue

## Acknowledgments

- Google Drive API documentation
- Node.js community
- Database backup best practices guides

## Roadmap

- [ ] Add support for incremental backups
- [ ] Implement backup verification tools
- [ ] Add more cloud storage providers
- [ ] Create a web interface for backup management
- [ ] Add email notifications for backup status
