import {spawnSync} from 'node:child_process';
const ffmpeg='C:/Users/Killua/OneDrive/Documents/ChatGPT/3Dwebsite1/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe';
const root='C:/Users/Killua/.codex/codex-remote-attachments/01a0a101-3aaa-7a22-aeeb-429e96dedc58/31446773-923D-4197-971F-F7E8B031336C/';
const inputs=[['apparel','1-ScreenRecording_11-04-2026-15-42-21_1.mov'],['food','2-ScreenRecording_11-04-2026-15-46-24_1.mov']];
for(const [name,file] of inputs){
  const args=['-y','-i',root+file,'-map','0:v:0','-an','-map_metadata','-1','-vf','fps=60,format=yuv420p','-c:v','libx264','-preset','slow','-crf','19','-movflags','+faststart','dist/assets/web-work/'+name+'-recording.mp4'];
  const r=spawnSync(ffmpeg,args,{encoding:'utf8'});if(r.status)throw Error(r.stderr);
  const p=spawnSync(ffmpeg,['-y','-ss','1','-i',root+file,'-frames:v','1','-q:v','2','dist/assets/web-work/'+name+'-poster.jpg'],{encoding:'utf8'});if(p.status)throw Error(p.stderr);
  console.log(name+' recording and poster ready');
}
