(line) => line.replace(/\x1b\[[0-9;]*m/g, '').length;
