import fs from 'fs';
import path from 'path';

export function startAutoCleaner(directoryPath: string, maxAgeMs = 3600 * 1000) {
  console.log(`[StorageCleaner] Started cleaner on ${directoryPath} (TTL: ${maxAgeMs / 1000}s)`);

  const runCleanup = () => {
    if (!fs.existsSync(directoryPath)) return;

    const now = Date.now();
    const files = fs.readdirSync(directoryPath);

    let deletedCount = 0;
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      try {
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
          deletedCount++;
        }
      } catch (err) {
        // file might be locked or already removed
      }
    }

    if (deletedCount > 0) {
      console.log(`[StorageCleaner] Purged ${deletedCount} expired temporary file(s).`);
    }
  };

  // Run cleanup every 15 minutes
  const interval = setInterval(runCleanup, 15 * 60 * 1000);
  runCleanup();

  return () => clearInterval(interval);
}
