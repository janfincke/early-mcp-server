#!/usr/bin/env node

// Manual environment variable loading to avoid dotenv output issues
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  // Read .env file manually and parse it silently
  const envPath = resolve(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf8');
  
  // Parse .env content
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  // If .env file doesn't exist or can't be read, continue silently
}

// Import and run the server
import('./dist/index.js').catch(() => {
  // Error handling removed to prevent stdio interference
  process.exit(1);
});
