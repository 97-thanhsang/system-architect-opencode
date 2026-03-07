import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface OpencodeOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

@Injectable()
export class OpencodeService {
  private readonly logger = new Logger(OpencodeService.name);

  async executeCommand(
    options: OpencodeOptions,
    onProgress?: (data: string) => void,
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve, reject) => {
      const { command, args = [], cwd, env = {}, timeout = 300000 } = options;
      
      this.logger.debug(`Executing: ${command} ${args.join(' ')}`);
      
      const childProcess = spawn(command, args, {
        cwd,
        env: { ...process.env, ...env },
        shell: true,
      });

      let output = '';
      let errorOutput = '';
      let timeoutId: NodeJS.Timeout;

      // Set timeout
      if (timeout) {
        timeoutId = setTimeout(() => {
          childProcess.kill('SIGTERM');
          reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);
      }

      // Handle stdout
      childProcess.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        output += chunk;
        
        if (onProgress) {
          onProgress(chunk);
        }
        
        this.logger.debug(`stdout: ${chunk}`);
      });

      // Handle stderr
      childProcess.stderr?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        errorOutput += chunk;
        
        if (onProgress) {
          onProgress(chunk);
        }
        
        this.logger.debug(`stderr: ${chunk}`);
      });

      // Handle process completion
      childProcess.on('close', (code: number) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (code === 0) {
          resolve({
            success: true,
            output: output.trim(),
          });
        } else {
          resolve({
            success: false,
            output: output.trim(),
            error: errorOutput.trim() || `Process exited with code ${code}`,
          });
        }
      });

      // Handle errors
      childProcess.on('error', (error: Error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        reject(error);
      });
    });
  }

  async spawnOpencodeProcess(
    taskId: string,
    command: string,
    args: string[],
    projectPath: string,
    outputPath: string,
  ): Promise<ChildProcess> {
    const logFile = path.join(outputPath, `task-${taskId}.log`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    const childProcess = spawn('opencode', [command, ...args], {
      cwd: projectPath,
      env: {
        ...process.env,
        TASK_ID: taskId,
        OUTPUT_PATH: outputPath,
      },
    });

    childProcess.stdout?.pipe(logStream);
    childProcess.stderr?.pipe(logStream);

    return childProcess;
  }

  copyOutputFiles(sourcePath: string, destinationPath: string): void {
    if (!fs.existsSync(sourcePath)) {
      this.logger.warn(`Source path does not exist: ${sourcePath}`);
      return;
    }

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    const files = fs.readdirSync(sourcePath);
    
    for (const file of files) {
      const srcFile = path.join(sourcePath, file);
      const destFile = path.join(destinationPath, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        this.copyOutputFiles(srcFile, destFile);
      } else {
        fs.copyFileSync(srcFile, destFile);
        this.logger.debug(`Copied: ${srcFile} -> ${destFile}`);
      }
    }
  }
}
