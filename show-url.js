// This script will print out the URL of your Replit application
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

try {
  console.log('\n--- APPLICATION ACCESS INFORMATION ---');
  console.log('Your application is running on:');
  console.log('http://localhost:5000');
  
  // Try to get the repl hostname
  const hostname = execSync('hostname').toString().trim();
  if (hostname.includes('replit')) {
    console.log(`\nIf you're using Replit, your public URL should be something like:`);
    console.log(`https://${hostname.split('.')[0]}.replit.dev`);
  }
  
  console.log('\nTo access your application:');
  console.log('1. Look for the "Run" button at the top of your Replit editor');
  console.log('2. After running, look for a browser preview or "Open in new tab" button');
  console.log('3. Or check your Replit URL bar for the correct domain');
  console.log('4. If all else fails, try running: curl http://localhost:5000\n');
  
} catch (error) {
  console.log('\n--- APPLICATION ACCESS INFORMATION ---');
  console.log('Could not automatically determine your Replit URL.');
  console.log('Your application is running at: http://localhost:5000');
  console.log('In Replit, look for the "Run" button, then a "Open in a new tab" option.');
  console.log('or check the URL bar in your Replit workspace for the correct domain.\n');
}