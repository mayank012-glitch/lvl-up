"use client";
import {useCallback,useEffect,useRef,useState,type KeyboardEvent,type CSSProperties} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {stationImage,stationImageSet,type StationDetails} from '@/lib/stations';

export function StationShowcase({stations}:{stations:StationDetails[]}){
 const [current,setCurrent]=useState(0);
 const navigation=useRef<HTMLDivElement>(null);
 const showcase=useRef<HTMLElement>(null);
 const [carouselRef,carousel]=useEmblaCarousel({loop:true,startIndex:0,dragFree:false,skipSnaps:false,watchDrag:(_api,event)=>!(event.target as HTMLElement).closest('a,button,input,select,textarea,summary')});
 const syncSelection=useCallback(()=>{if(carousel)setCurrent(carousel.selectedScrollSnap());},[carousel]);
 useEffect(()=>{
  if(!carousel)return;
  syncSelection();carousel.on('select',syncSelection).on('reInit',syncSelection);
  return ()=>{carousel.off('select',syncSelection).off('reInit',syncSelection);};
 },[carousel,syncSelection]);
 useEffect(()=>{
  const nav=navigation.current,tab=nav?.querySelector<HTMLElement>('[aria-selected="true"]');
  if(!nav||!tab)return;
  const view=nav.getBoundingClientRect(),item=tab.getBoundingClientRect();
  const left=item.left<view.left?item.left-view.left-4:item.right>view.right?item.right-view.right+4:0;
  if(left)nav.scrollBy({left,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },[current]);
 useEffect(()=>{
  const root=showcase.current;if(!root)return;
  let frame=0;
  function fit(){
   const viewport=root!.querySelector<HTMLElement>('.station-carousel-viewport');
   if(!viewport)return;
   const mobile=window.matchMedia('(max-width:600px)').matches;
   const top=viewport.getBoundingClientRect().top+window.scrollY;
   const cue=root!.querySelector<HTMLElement>('.station-carousel-cue');
   const budget=Math.max(180,(window.visualViewport?.height||window.innerHeight)-top-(cue?.offsetHeight||44)-22);
   root!.querySelectorAll<HTMLElement>('.station-carousel-slide').forEach(slide=>{
    const article=slide.querySelector<HTMLElement>('article');if(!article)return;
    const natural=article.offsetHeight;
    const scale=mobile?Math.min(1,budget/natural):1;
    article.style.transform=scale<1?'scale('+scale+')':'';
    article.style.transformOrigin='top center';
    slide.style.height=mobile?(natural*scale+4)+'px':'';
   });
   const selected=root!.querySelector<HTMLElement>('.station-carousel-slide[aria-hidden="false"]');
   if(selected)viewport.style.height=selected.offsetHeight+'px';
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(fit);}
  const observer=new ResizeObserver(schedule);
  root.querySelectorAll('.station-showcase-content,.station-jumps,.station-carousel-cue').forEach(el=>observer.observe(el));
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);schedule();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);};
 },[stations,current]);
 const station=stations[current];
 if(!station)return null;
 function select(index:number){carousel?.scrollTo(index,window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
 function onTabKey(event:KeyboardEvent<HTMLButtonElement>,index:number){
  const next=event.key==='ArrowRight'?(index+1)%stations.length:event.key==='ArrowLeft'?(index-1+stations.length)%stations.length:event.key==='Home'?0:event.key==='End'?stations.length-1:-1;
  if(next<0)return;event.preventDefault();select(next);navigation.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus({preventScroll:true});
 }
 return <section ref={showcase} className="station-showcase" aria-label="Explore the stations" style={{'--station-glass-image':`url("${stationImage(station)}")`} as CSSProperties}>
  <div ref={navigation} className="station-jumps" role="tablist" aria-label="Choose a station">
   {stations.map((item,i)=><button type="button" role="tab" id={'station-tab-'+item.no} aria-selected={i===current} aria-controls={'station-display-'+item.no} tabIndex={i===current?0:-1} key={item.no} onClick={()=>select(i)} onKeyDown={event=>onTabKey(event,i)}>{item.title}</button>)}
  </div>
  <div className="station-showcase-frame station-carousel-viewport" ref={carouselRef} aria-describedby="station-swipe-hint">
   <div className="station-carousel-track">
    {stations.map((item,index)=><div className="station-carousel-slide" key={item.no} aria-hidden={index!==current} inert={index!==current?true:undefined}>
     <article id={'station-display-'+item.no} className="station-detail station-showcase-panel" role="tabpanel" aria-labelledby={'station-tab-'+item.no} tabIndex={index===current?0:-1} style={{'--station-glass-image':`url("${stationImage(item)}")`} as CSSProperties} onKeyDown={event=>{if(event.target===event.currentTarget&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();select((current+(event.key==='ArrowRight'?1:-1)+stations.length)%stations.length);}}}>
      <div className="station-showcase-content">
       <div className="station-photo" data-fit-full={item.no==='05'||item.no==='06'?true:undefined}><img src={stationImage(item)} srcSet={stationImageSet(item)} sizes="(max-width: 850px) calc(100vw - 34px), 57vw" alt={item.alt} width={1536} height={1024} loading={index===0?'eager':'lazy'} draggable={false}/></div>
       <div className="station-content">
        <p className="station-tag">{item.tag}</p><h2>{item.title}</h2>
        <p className="station-description">{item.description}</p>
        <h3>How it works</h3><ul className="station-pointers">{item.steps.map((step,i)=><li key={i}>{step}</li>)}</ul>
        <details className="station-extra"><summary>Before you start &amp; the challenge</summary><p className="station-safety"><strong>Before you start</strong>{item.safety}</p><p className="station-focus"><strong>The challenge</strong>{item.focus}</p></details>
        <p className="station-position" aria-hidden="true">STATION {index+1} OF {stations.length}</p>
       </div>
      </div>
     </article>
    </div>)}
   </div>
  </div>
  <div className="station-carousel-cue">
   <nav className="station-carousel-dots" aria-label="Station carousel">{stations.map((item,index)=><button type="button" key={item.no} aria-label={'Show '+item.title} aria-current={index===current?'true':undefined} onClick={()=>select(index)}><span/></button>)}</nav>
  </div>
  <p id="station-swipe-hint" className="sr-only">Swipe left or right to change the station, or choose a station above.</p>
  <p className="sr-only" role="status" aria-live="polite">Showing {station.title}, station {current+1} of {stations.length}.</p>
 </section>;
}
