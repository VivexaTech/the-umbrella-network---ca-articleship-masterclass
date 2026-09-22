/**
 * Hostinger Node.js Application Entry Point
 * 
 * Hostinger's hPanel Node.js Selector defaults to looking for 'app.js' or 'app.cjs'
 * in the project root directory. This wrapper forwards execution directly to the
 * compiled production CommonJS server bundle in 'dist/server.cjs'.
 */

require('./dist/server.cjs');
