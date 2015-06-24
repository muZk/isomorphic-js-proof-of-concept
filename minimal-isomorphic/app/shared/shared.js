console.log('shared.js loaded');

var isServer = typeof window === 'undefined';
var isClient = typeof window !== 'undefined';

if(isServer)
  console.log('shared.js running on server');

if(isClient)
  console.log('shared.js running on client');
