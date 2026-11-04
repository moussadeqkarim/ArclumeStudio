import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const base='C:/Users/Killua/OneDrive/Documents/ChatGPT/3Dwebsite1';
const require=createRequire(base+'/package.json');
const sharp=require('sharp');
const ffmpeg=base+'/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe';
const sets={footwear:[base+'/sneaker-store/qa/jordan-white-red-replacement.png',base+'/sneaker-store/qa/airmax-jordan-carousel.png'],sovrai:[base+'/qa/sovrai-immersive.png',base+'/qa/sovrai-published-strong-rose.png']};
for(const [name,inputs] of Object.entries(sets)){
  const filter="[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[a];[1:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[b];[a][b]blend=all_expr='A*(0.5+0.5*cos(2*PI*T/8))+B*(0.5-0.5*cos(2*PI*T/8))'[out]";
  await sharp(inputs[0]).resize(1280,720,{fit:'contain'}).webp({quality:90}).toFile('dist/assets/web-work/'+name+'-current.webp');
  const r=spawnSync(ffmpeg,['-y','-loop','1','-framerate','60','-t','8','-i',inputs[0],'-loop','1','-framerate','60','-t','8','-i',inputs[1],'-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart','dist/assets/web-work/'+name+'-current.mp4'],{encoding:'utf8'});
  if(r.status)throw Error(r.stderr);console.log(name+' loop encoded');
}
