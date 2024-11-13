const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
class GoogleDriveService {
    constructor() {
        const credentialsPath = path.join(__dirname, 'credentials.json');
        if (!fs.existsSync(credentialsPath)) {
            throw new Error('credentials.json file not found!');
        }

        const credentials = require(credentialsPath);
        if (!credentials.client_email || !credentials.private_key) {
            throw new Error('Invalid credentials file: missing client_email or private_key');
        }

        this.serviceAccountEmail = credentials.client_email;
        this.userEmail = process.env.USEREMAIL; // Replace with your email
        this.folderName = 'BbBackupService';
        this.authenticate(credentials);
    }

    authenticate(credentials) {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: credentials,
                scopes: [
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/drive.metadata.readonly'
                ]
            });

            this.driveService = google.drive({ version: 'v3', auth });
        } catch (error) {
            console.error('Authentication error:', error.message);
            throw new Error('Failed to authenticate with Google Drive');
        }
    }

    async checkPermissions() {
        try {
            // Test API access by attempting to list files
            await this.driveService.files.list({
                pageSize: 1,
                fields: 'files(id, name)',
            });
            return true;
        } catch (error) {
            console.error('Permissions check failed:', error.message);
            return false;
        }
    }

    async getFolderId() {
        try {
            const response = await this.driveService.files.list({
                q: `name='${this.folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id)',
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            }
            return null;
        } catch (error) {
            console.error('Error getting folder ID:', error.message);
            throw error;
        }
    }

    async createFolder() {
        try {
            console.log(`Creating new folder: ${this.folderName}`);
            const fileMetadata = {
                name: this.folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };

            const response = await this.driveService.files.create({
                requestBody: fileMetadata,
                fields: 'id'
            });

            const folderId = response.data.id;
            console.log(`Created folder with ID: ${folderId}`);

            // Share the folder with user
            await this.shareWithUser(folderId, this.userEmail);
            console.log(`Shared folder with ${this.userEmail}`);

            return folderId;
        } catch (error) {
            console.error('Error in createFolder:', error.message);
            throw error;
        }
    }

    async uploadToDrive(filePath) {
        try {
            const hasPermissions = await this.checkPermissions();
            if (!hasPermissions) {
                throw new Error('Failed permissions check');
            }

            console.log('Starting upload to Google Drive...');
            const fileName = path.basename(filePath);
            
            let folderId = await this.getFolderId();
            if (!folderId) {
                console.log('Backup folder not found, creating new one...');
                folderId = await this.createFolder();
            } else {
                // Ensure the existing folder is shared
                await this.shareWithUser(folderId, this.userEmail);
            }
            console.log(`Using folder ID: ${folderId}`);

            const fileMetadata = {
                name: fileName,
                parents: [folderId]
            };

            const media = {
                mimeType: 'application/zip',
                body: fs.createReadStream(filePath)
            };

            console.log('Uploading file...');
            const response = await this.driveService.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id,name,webViewLink,permissions',
            });

            // Share the uploaded file
            await this.shareWithUser(response.data.id, this.userEmail);
            console.log(`Shared file with ${this.userEmail}`);

            console.log('Upload successful!');
            console.log('File ID:', response.data.id);
            console.log('Web View Link:', response.data.webViewLink);

            return response.data;
        } catch (error) {
            console.error('Error in uploadToDrive:', error.message);
            if (error.response) {
                console.error('Error details:', error.response.data);
            }
            throw error;
        }
    }

    async shareWithUser(fileId, userEmail) {
        try {
            // First check if the user already has access
            const permissions = await this.driveService.permissions.list({
                fileId: fileId
            });

            const existingPermission = permissions.data.permissions.find(
                p => p.emailAddress === userEmail
            );

            if (existingPermission) {
                console.log(`User ${userEmail} already has access to file ${fileId}`);
                return true;
            }

            const permission = {
                type: 'user',
                role: 'reader',
                emailAddress: userEmail
            };

            await this.driveService.permissions.create({
                fileId: fileId,
                requestBody: permission,
                sendNotificationEmail: false,
            });

            console.log(`Shared file ${fileId} with ${userEmail}`);
            return true;
        } catch (error) {
            console.error('Error sharing file:', error.message);
            return false;
        }
    }

    async listFiles() {
        try {
            const folderId = await this.getFolderId();
            if (!folderId) {
                return [];
            }

            const response = await this.driveService.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, webViewLink, createdTime)',
                orderBy: 'createdTime desc'
            });

            return response.data.files;
        } catch (error) {
            console.error('Error listing files:', error.message);
            throw error;
        }
    }
}

const driveService = new GoogleDriveService();

module.exports = {
    uploadToDrive: (filePath) => driveService.uploadToDrive(filePath),
    listFiles: () => driveService.listFiles(),
    checkPermissions: () => driveService.checkPermissions(),
    shareWithUser: (fileId, userEmail) => driveService.shareWithUser(fileId, userEmail)
};