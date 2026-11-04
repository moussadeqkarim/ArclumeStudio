import {spawnSync} from 'node:child_process';
const ffmpeg='C:/Users/Killua/OneDrive/Documents/ChatGPT/3Dwebsite1/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe';
const input='C:/Users/Killua/Videos/From Klickpin.com- Smart tailoring ideas and clever inspiration for beginners for makers and beginners-pin-id-774548835961796852.mp4';
const base='dist/assets/web-work/food-cropped';
for(const args of [
 ['-y','-i',input,'-map','0:v:0','-an','-map_metadata','-1','-vf','crop=536:348:92:618,setsar=1','-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-movflags','+faststart',base+'.mp4'],
 ['-y','-ss','2','-i',input,'-vf','crop=536:348:92:618','-frames:v','1','-q:v','2',base+'.jpg']
]){const r=spawnSync(ffmpeg,args,{encoding:'utf8'});if(r.status)throw Error(r.stderr);}
console.log('Cropped final-design panel at native resolution and frame rate.');
