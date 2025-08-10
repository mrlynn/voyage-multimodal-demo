import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface EnvironmentCheck {
  pdftoppm: {
    available: boolean;
    version?: string;
    error?: string;
  };
  sharp: {
    available: boolean;
    error?: string;
  };
  platform: string;
}

export async function checkEnvironment(): Promise<EnvironmentCheck> {
  const result: EnvironmentCheck = {
    pdftoppm: { available: false },
    sharp: { available: false },
    platform: process.platform
  };

  // Check pdftoppm availability
  try {
    const { stdout } = await Promise.race([
      execAsync('pdftoppm -h'),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Command timeout')), 5000)
      )
    ]);
    
    if (stdout.includes('pdftoppm')) {
      result.pdftoppm.available = true;
      
      // Try to get version
      try {
        const { stderr } = await execAsync('pdftoppm -v');
        const versionMatch = stderr.match(/pdftoppm version (\d+\.\d+\.\d+)/);
        if (versionMatch) {
          result.pdftoppm.version = versionMatch[1];
        }
      } catch {
        // Version detection failed, but tool is available
      }
    }
  } catch (error) {
    result.pdftoppm.error = error instanceof Error ? error.message : 'Command failed';
  }

  // Check Sharp availability
  try {
    await import('sharp');
    result.sharp.available = true;
  } catch (error) {
    result.sharp.available = false;
    result.sharp.error = error instanceof Error ? error.message : 'Import failed';
  }

  return result;
}

export function getInstallInstructions(platform: string): string {
  switch (platform) {
    case 'darwin': // macOS
      return 'Install with: brew install poppler';
    case 'linux':
      return 'Install with: apt-get install poppler-utils (Ubuntu/Debian) or yum install poppler-utils (CentOS/RHEL)';
    case 'win32':
      return 'Install poppler for Windows from: https://github.com/oschwartz10612/poppler-windows';
    default:
      return 'Install poppler-utils package for your operating system';
  }
}