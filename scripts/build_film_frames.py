#!/usr/bin/env python3
"""Build 180 PEMESA scroll frames from the animation inside a filmed monitor.

The result reproduces the recorded motion, not an original 3D geometry.
Use footage you have permission to publish. See docs/scroll-film.md.
"""
import argparse
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

def smooth(a,b,v):
    p=np.clip((v-a)/(b-a),0,1)
    return p*p*(3-2*p)

def generate(video, destination, count=180):
    destination=Path(destination)
    destination.mkdir(parents=True,exist_ok=True)
    cap=cv2.VideoCapture(str(video))
    if not cap.isOpened(): raise RuntimeError("Cannot open source video")
    fps=float(cap.get(cv2.CAP_PROP_FPS))
    duration=cap.get(cv2.CAP_PROP_FRAME_COUNT)/fps
    if duration<4:raise RuntimeError("Source clip too short")
    times=np.linspace(.10,min(duration-.18,8.10),count)
    targets=[round(float(t)*fps) for t in times]
    width,height=1280,720
    x=np.arange(width)[None,:]
    y=np.arange(height)[:,None]
    alpha_x=smooth(355,505,x)*(1-smooth(1190,1278,x))
    alpha_y=smooth(21,80,y)*(1-smooth(665,710,y))
    alpha=(alpha_x*alpha_y).astype(np.float32)[:,:,None]
    bg=np.array([200.,208.,220.],dtype=np.float32)
    next_frame=0
    for i in range(targets[-1]+1):
        ok,frame=cap.read()
        if not ok:raise RuntimeError(f"Cannot decode input frame {i}")
        if i<targets[next_frame]:continue
        # Detect the bright browser-toolbar edge and dark monitor-bottom edge.
        mini=cv2.resize(frame,(540,960),interpolation=cv2.INTER_AREA)
        gray=cv2.cvtColor(mini,cv2.COLOR_BGR2GRAY)
        luminance=gray[:,45:475].mean(axis=1)
        edge=np.convolve(np.diff(luminance),np.ones(5)/5,mode='same')
        top=int(np.argmax(edge[215:360])+215)
        bottom=int(np.argmin(edge[425:625])+425)
        if not (245<=bottom-top<=335):bottom=top+289
        top=max(0,2*top+8);bottom=min(frame.shape[0],2*bottom-7)
        crop=frame[top:bottom,36:1073]
        if crop.shape[0]<400:raise RuntimeError("Screen detection failed")
        image=cv2.resize(crop,(width,height),interpolation=cv2.INTER_CUBIC)
        shift=np.float32([[1,0,110],[0,1,0]])
        image=cv2.warpAffine(image,shift,(width,height),flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_CONSTANT,borderValue=(200,208,220))
        image=np.uint8(np.clip(image.astype(np.float32)*alpha+
                               bg[None,None,:]*(1-alpha),0,255))
        Image.fromarray(cv2.cvtColor(image,cv2.COLOR_BGR2RGB)).save(
            destination/f"frame_{next_frame+1:04d}.webp",
            format="WEBP",quality=77,method=1)
        next_frame+=1
        if next_frame>=count:break
    cap.release()
    files=list(destination.glob('frame_*.webp'))
    if len(files)!=count:raise RuntimeError(f"Expected {count}, got {len(files)}")
    print(f"Generated {count} scroll frames. Total {sum(x.stat().st_size for x in files)} bytes.")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--input",required=True,type=Path)
    p.add_argument("--output",default="frames-film")
    args=p.parse_args()
    generate(args.input,args.output)
