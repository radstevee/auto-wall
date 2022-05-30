const Canvas = require('@napi-rs/canvas');
const cfg = require('../config.json');
const { readFileSync, writeFileSync } = require('fs');
const Weather = require('./weather');
const Cpu_Ram = require('./cpu_ram')

async function run(cmd, args) {
    let { execSync } = require('child_process');
    let command = execSync(cmd, args, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        }
        if (stderr) console.log('Child Process STDERR: \n' + stderr);
    });
    return command.toString().trim();
};

module.exports = { run };


async function drawWallpaper(weather, cpuRam) {
    const canvas = await Canvas.createCanvas(cfg.wallpaperSize[0], cfg.wallpaperSize[1]);
    const ctx = canvas.getContext('2d');
    const backgroundFile = readFileSync(cfg.wallpaper);
    const background = new Canvas.Image();
    background.src = backgroundFile;
    let tempUnits;

    //stretch image on the canvas
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.font = `${cfg.fontSize}px ${cfg.font}`;
    ctx.textAlign = cfg.fontAlign;

    /* draw local time */
    ctx.fillStyle = cfg.fontColors.time;
    const date = new Date();
    const dateParsed = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    ctx.fillText(dateParsed, cfg.coordinates.time[0], cfg.coordinates.time[1]);

    /* draw the cpu and ram usage */

    ctx.fillStyle = cfg.fontColors.cpu;
    ctx.strokeStyle = cfg.fontColors.cpu;

    ctx.fillText(`CPU: `, cfg.coordinates.cpu[0], cfg.coordinates.cpu[1]);
    ctx.fillStyle = cfg.fontColors.cpu_usage;
    ctx.strokeStyle = cfg.fontColors.cpu_usage;
    ctx.fillText(` ${cpuRam.cpu}%`, cfg.coordinates.cpu[0] + (cfg.fontSize * 2), cfg.coordinates.cpu[1]);

    ctx.fillStyle = cfg.fontColors.ram;
    ctx.strokeStyle = cfg.fontColors.ram;
    ctx.fillText(`RAM: `, cfg.coordinates.ram[0], cfg.coordinates.ram[1]);
    ctx.fillStyle = cfg.fontColors.ram_usage;
    ctx.strokeStyle = cfg.fontColors.ram_usage;
    ctx.fillText(` ${cpuRam.ram}%`, cfg.coordinates.ram[0] + (cfg.fontSize * 2), cfg.coordinates.ram[1]);

    /* draw the weather using openweathermap's api */

    if (cfg.units == "metric") tempUnits = "C";
    if (cfg.units == "imperial") tempUnits = "F";

    ctx.fillStyle = cfg.fontColors.weather;
    ctx.strokeStyle = cfg.fontColors.weather;
    ctx.fillText(`Weather: `, cfg.coordinates.weather[0], cfg.coordinates.weather[1]);
    ctx.fillStyle = cfg.fontColors.weather_temp;
    ctx.strokeStyle = cfg.fontColors.weather_temp;
    ctx.fillText(` ${weather.main.temp}°${tempUnits}`, cfg.coordinates.weather[0] + (cfg.fontSize * 5), cfg.coordinates.weather[1]);
    ctx.fillStyle = cfg.fontColors.weather_description;
    ctx.strokeStyle = cfg.fontColors.weather_description;
    ctx.fillText(` ${weather.weather[0].main}`, cfg.coordinates.weather[0] + (cfg.fontSize * 5), cfg.coordinates.weather[1] + (cfg.fontSize * 1.5));

    //save the image
    const outData = await canvas.encode(cfg.outFormat);
    await writeFileSync(`${cfg.wallpaperOut}.${cfg.outFormat}`, outData);

    await run(`feh --bg-scale ${cfg.wallpaperOut}.${cfg.outFormat}`);
}

async function main() {
    const weather = await Weather();
    const cpuRam = await Cpu_Ram();
    drawWallpaper(weather, cpuRam);
    setInterval(async () => {
        const w = await Weather();
        drawWallpaper(weather, cpuRam)
    }, cfg.weatherInterval);

    setInterval(async () => {
        const cpu_ram = await Cpu_Ram();
        drawWallpaper(weather, cpu_ram)
    }, cfg.cpuRamInterval);
}

main();