const { exec } = require('child_process');
exec('pkill node', (err) => console.log(err));
