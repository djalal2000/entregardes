#!/usr/bin/env python3
"""Build 120 WebP frames for PEMESA's scroll-controlled homepage.

When source.mp4 is provided, use the reference clip and crop only the filmed
webpage content. Otherwise generate a distinct original fiber-art sequence.
No confidential data, user accounts or sensor readings are used.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, os, random, subprocess
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
DEST=ROOT/'frames'
DEST.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'source.mp4'
W,H=1280,720
KEYS=[(0,.12),(18,.95),(39,2.42),(62,3.65),(81,4.37),(105,5.10),(119,5.36)]

def at(i):
    for (a,x),(b,y) in zip(KEYS,KEYS[1:]):
        if a<=i<=b:return x+(y-x)*(i-a)/(b-a)
    return KEYS[-1][1]

def canvas_base():
    a=np.empty((H,W,3),dtype=np.uint8)
    y,x=np.ogrid[:H,:W]
    light=4*np.exp(-(((x-865)/540)**2+((y-295)/340)**2))
    shade=5*((x-640)/1280)**2+4*((y-360)/720)**2
    for j,v in enumerate((220,208,200)):a[:,:,j]=np.uint8(np.clip(v+light-shade,0,255))
    return Image.fromarray(a,'RGB')

def save(i,image):
    image.save(DEST/f'frame_{i+1:04d}.webp','WEBP',quality=76,method=2)

def from_video():
    tmp=ROOT/'.frames-source'
    tmp.mkdir(exist_ok=True)
    result=subprocess.run([
       'ffmpeg','-hide_banner','-loglevel','error','-threads','2','-y',
       '-i',str(SOURCE),'-t','5.6','-vf','fps=24,crop=602:410:250:588,scale=830:566',
       '-q:v','4',str(tmp/'frame_%04d.jpg')
    ],check=False)
    if result.returncode or not (tmp/'frame_0001.jpg').exists():return False
    base=canvas_base()
    py,px=np.mgrid[:566,:830]
    left=np.clip((px-175)/130,0,1)
    right=np.clip((830-px-13)/82,0,1)
    top=np.clip((py-6)/78,0,1)
    bottom=np.clip((566-py-7)/105,0,1)
    alpha=np.clip(np.minimum(np.minimum(left,right),np.minimum(top,bottom)),0,1)**.85
    mask=Image.fromarray(np.uint8(alpha*255),'L').filter(ImageFilter.GaussianBlur(8))
    for i in range(120):
       number=min(134,max(1,round(at(i)*24)+1))
       im=np.asarray(Image.open(tmp/f'frame_{number:04d}.jpg').convert('RGB')).astype(np.int16)
       bg=np.median(im[40:98,700:790].reshape(-1,3),axis=0)
       im=np.uint8(np.clip(im+(np.array([220,208,200])-bg)*.75,0,255))
       out=base.copy()
       out.paste(Image.fromarray(im,'RGB'),(453,72),mask)
       save(i,out)
    return True

def procedural():
    # Fully original fallback, not a misleading recreation of a human portrait.
    base=canvas_base()
    rng=random.Random(20261122)
    specks=[(rng.randrange(400,1250),rng.randrange(80,660),rng.random()*1.8) for _ in range(90)]
    for i in range(120):
      t=i/119
      frame=base.copy()
      draw=ImageDraw.Draw(frame,'RGBA')
      cx,cy=875,350
      # Fiber stream evolves into a radial knitted orb.
      ring=max(0,min(1,(t-.58)/.22))
      cable=max(0,min(1,(t-.25)/.18))*(1-ring)
      portrait=max(0,1-t/.38)
      if portrait>0:
        for j in range(115):
          a=2*math.pi*j/115
          wav=11*math.sin(j*.63+i*.03)
          pts=[]
          for k in range(51):
            p=k/50
            lat=-1.4+2.8*p
            x=cx+(168+wav)*math.cos(lat)*math.cos(a)
            y=cy+230*math.sin(lat)
            z=(168+wav)*math.cos(lat)*math.sin(a)
            pts.append((x+z*.10,y))
          draw.line(pts,fill=(250,242,234,int(255*portrait*.42)),width=2)
      if cable>0:
        for j in range(100):
          r=(j-50)/50
          p0=(1450+r*220, -200+r*150)
          p1=(490+r*180, 810+r*130)
          pts=[]
          for k in range(31):
            q=k/30
            x=p0[0]*(1-q)+p1[0]*q+40*math.sin(q*math.pi+j*.21+i*.04)
            y=p0[1]*(1-q)+p1[1]*q-100*math.sin(q*math.pi)
            pts.append((x,y))
          draw.line(pts,fill=(253,250,243,int(cable*200)),width=3)
          if j%3==0:
            x,y=pts[-1]
            draw.ellipse((x-3,y-3,x+3,y+3),fill=(255,122,35,int(240*cable)))
      if ring>0:
        rr=190
        for j in range(240):
          a=2*math.pi*j/240+i*.004
          pts=[]
          for k in range(28):
            q=k/27
            b=a+q*math.pi*.7
            r=rr+48*math.cos(q*2*math.pi+j*.17)
            pts.append((cx+math.cos(b)*r,cy+math.sin(b)*r))
          draw.line(pts,fill=(251,247,239,int(180*ring)),width=3)
        glow=Image.new('RGBA',(W,H)); gd=ImageDraw.Draw(glow,'RGBA')
        for r in range(190,0,-7):
          q=1-r/190
          gd.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(255,int(95+145*q),int(29+70*q),int(9+45*q)*int(ring)))
        glow=glow.filter(ImageFilter.GaussianBlur(28))
        frame=Image.alpha_composite(frame.convert('RGBA'),glow).convert('RGB')
        draw=ImageDraw.Draw(frame,'RGBA')
      for x,y,r in specks:
        visibility=max(cable,ring,1-portrait)
        if visibility>.01:
           shift=9*math.sin(i*.07+x)
           draw.ellipse((x+shift-r,y-r,x+shift+r,y+r),fill=(255,159,81,int(90*visibility)))
      save(i,frame)

if __name__=='__main__':
    done=False
    if SOURCE.exists():
      try:done=from_video()
      except Exception as error:print('Source extraction failed:',error,flush=True)
    if not done:
      print('Using original procedural fallback',flush=True)
      procedural()
    assert len(list(DEST.glob('frame_*.webp')))==120
    print('Generated 120 WebPs in',DEST,flush=True)
