#!/usr/bin/env python3
"""Generate PEMESA's 120-frame cinematic 2.5D sequence from five key images.
This does NOT reconstruct a rigged 3D mesh. The WebP frames are a visual
animation synchronized to scroll. Use original / authorized images only.
"""
from pathlib import Path
import math
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'assets'/'keyframes'
OUTPUT=ROOT/'frames-v2'
INPUTS=[SOURCE/f'keyframe_{i:02d}.webp' for i in range(1,6)]
W,H=1280,720
BG=np.array([220,208,200],dtype=np.float32)
X=np.broadcast_to(np.linspace(0,1,W,dtype=np.float32)[None,:],(H,W))
Y=np.broadcast_to(np.linspace(0,1,H,dtype=np.float32)[:,None],(H,W))
rng=np.random.default_rng(20261122)
noise=cv2.GaussianBlur(rng.random((H,W),dtype=np.float32),(0,0),sigmaX=9)
noise=(noise-noise.mean())/(noise.std()+1e-8)
dust=rng.random((H,W),dtype=np.float32)

def smooth(x):
    x=np.clip(x,0,1)
    return x*x*(3-2*x)

def load(path):
    im=cv2.imread(str(path),cv2.IMREAD_COLOR)
    if im is None: raise RuntimeError(f'Missing image: {path}')
    im=cv2.cvtColor(im,cv2.COLOR_BGR2RGB)
    im=cv2.resize(im,(W,H),interpolation=cv2.INTER_AREA).astype(np.float32)
    corners=np.concatenate((im[:45,:70].reshape(-1,3),im[:45,-70:].reshape(-1,3),
                            im[-45:,:70].reshape(-1,3),im[-45:,-70:].reshape(-1,3)))
    return np.clip(im+(BG-np.median(corners,axis=0))*.56,0,255)

def shift_image(src,i,scene):
    t=i/119.
    scale=1.008+.021*math.sin(math.pi*(t+.03))
    angle=.36*math.sin(t*5+scene*.7)
    mat=cv2.getRotationMatrix2D((W/2,H/2),angle,scale)
    mat[0,2]+=8*math.sin(t*math.pi*1.75+scene*.44)+[14,10,-8,4,7][scene]
    mat[1,2]+=(scene-2)*.7+2*math.sin(t*4)
    return cv2.warpAffine(src,mat,(W,H),flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REPLICATE)

def phase(i):
    if i<=11:return (0,0,0)
    if i<=36:return (0,1,(i-11)/25)
    if i<=43:return (1,1,0)
    if i<=66:return (1,2,(i-43)/23)
    if i<=69:return (2,2,0)
    if i<=90:return (2,3,(i-69)/21)
    if i<=111:return (3,4,(i-90)/21)
    return (4,4,0)

def dissolve(a,b,t,section,i):
    t=float(smooth(t))
    # Directed reveal replaces the crossfade with a narrow transition edge.
    # This avoids ghost portraits (two faces superposed in the same frame).
    coord=X if section==0 else 1-X
    bend=(Y-.5)*(.16 if section%2 else -.10)
    grain=noise*.012+(dust-.5)*.04
    alpha=smooth(np.clip((t-coord-bend-grain)*8.0+.5,0,1))
    if t<=.035:alpha[:]=0
    if t>=.965:alpha[:]=1
    alpha=alpha[:,:,None]
    return a*(1-alpha)+b*alpha

def main():
    missing=[str(p) for p in INPUTS if not p.is_file()]
    if missing: raise SystemExit('Missing keyframe inputs: '+', '.join(missing))
    images=[load(path) for path in INPUTS]
    OUTPUT.mkdir(parents=True,exist_ok=True)
    for i in range(120):
        a,b,t=phase(i)
        frame=shift_image(images[a],i,a)
        if a!=b: frame=dissolve(frame,shift_image(images[b],i,b),t,a,i)
        Image.fromarray(np.uint8(np.clip(frame,0,255)),'RGB').save(
            OUTPUT/f'frame_{i+1:04d}.webp','WEBP',quality=77,method=4)
        if (i+1)%20==0:print(f'Generated {i+1}/120 frames',flush=True)
    assert len(list(OUTPUT.glob('frame_*.webp')))==120

if __name__=='__main__':
    main()
