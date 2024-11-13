const { exec } = require('child_process');
const archiver = require('archiver');
const { uploadToDrive, listFiles, checkPermissions } = require('./googleDrive');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const backupDir = process.env.BACKUP_DIR || './backup';
const deletionDays = parseInt(process.env.DELETION_DAYS, 10) || 10;
const dbName = process.env.DB_NAMES.trim();

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFileName = `${dbName}_${timestamp}`;
    const backupFilePath = path.join(backupDir, backupFileName);
    const zipFilePath = `${backupFilePath}.zip`;

    try {
        // Step 1: Create database backup
        console.log('Starting database backup...');
        await new Promise((resolve, reject) => {
            const command = `mongodump --uri="${process.env.MONGODB_URI}${dbName}" --out="${backupFilePath}"`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error backing up database ${dbName}:`, stderr);
                    reject(error);
                } else {
                    console.log(`Database ${dbName} backed up successfully.`);
                    resolve(stdout);
                }
            });
        });

        // Step 2: Create zip file
        console.log('Creating zip file...');
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                console.log('Zip file created successfully');
                resolve();
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(backupFilePath, false);
            archive.finalize();
        });

        // Step 3: Upload to Google Drive
        console.log('Uploading to Google Drive...');
        const uploadResult = await uploadToDrive(zipFilePath);
        console.log('Backup uploaded successfully');
        console.log('File available at:', uploadResult.webViewLink);

        // Step 4: Clean up local files
        console.log('Cleaning up local files...');
        fs.rmSync(backupFilePath, { recursive: true, force: true });
        fs.unlinkSync(zipFilePath);
        console.log('Local cleanup completed');

        return uploadResult;
    } catch (err) {
        console.error(`Error processing database ${dbName}:`, err);
        throw err;
    }
}

function deleteOldBackups() {
    const now = Date.now();
    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error('Error reading backup directory:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(backupDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (now - stats.ctimeMs > deletionDays * 24 * 60 * 60 * 1000) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting old backup file:', err);
                        else console.log(`Deleted old backup: ${filePath}`);
                    });
                }
            });
        });
    });
}

async function main() {
    try {
        // Check Google Drive permissions first
        const hasPermissions = await checkPermissions();
        if (!hasPermissions) {
            throw new Error('Failed to verify Google Drive permissions');
        }

        if (deletionDays > 0) {
            deleteOldBackups();
        }
        
        await backupDatabase();
    
        
        
        // List all backups in Google Drive
        // console.log('\nListing all backups in Google Drive:');
        // const files = await listFiles();
        // files.forEach(file => {
        //     console.log(`- ${file.name} (Created: ${new Date(file.createdTime).toLocaleString()})`);
        //     console.log(`  Link: ${file.webViewLink}`);
        // });
    } catch (error) {
        console.error('Backup process failed:', error);
        process.exit(1);
    }
}

main();