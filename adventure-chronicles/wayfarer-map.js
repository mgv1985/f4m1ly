const consoleView=document.querySelector('.map-console'),viewport=document.querySelector('#mapViewport'),image=document.querySelector('#mapImage'),zoomLevel=document.querySelector('#zoomLevel');
let zoom=1;
function setZoom(next){const oldWidth=viewport.scrollWidth,oldHeight=viewport.scrollHeight,centerX=(viewport.scrollLeft+viewport.clientWidth/2)/oldWidth,centerY=(viewport.scrollTop+viewport.clientHeight/2)/oldHeight;zoom=Math.max(1,Math.min(3,Math.round(next*4)/4));image.style.width=`${zoom*100}%`;zoomLevel.textContent=`${Math.round(zoom*100)}%`;requestAnimationFrame(()=>{viewport.scrollLeft=centerX*viewport.scrollWidth-viewport.clientWidth/2;viewport.scrollTop=centerY*viewport.scrollHeight-viewport.clientHeight/2;});}
document.querySelector('#zoomIn').onclick=()=>setZoom(zoom+.25);
document.querySelector('#zoomOut').onclick=()=>setZoom(zoom-.25);
document.querySelector('#resetMap').onclick=()=>{setZoom(1);viewport.scrollTo({left:0,top:0,behavior:'smooth'});};
document.querySelector('#fullscreenMap').onclick=async()=>{if(!document.fullscreenElement)await consoleView.requestFullscreen?.();else await document.exitFullscreen?.();};
viewport.addEventListener('wheel',event=>{if(!event.ctrlKey)return;event.preventDefault();const step=event.deltaY<0 ? 0.25 : -0.25;setZoom(zoom+step);},{passive:false});
let dragging=false,startX=0,startY=0,startLeft=0,startTop=0;
viewport.addEventListener('pointerdown',event=>{if(zoom===1)return;dragging=true;startX=event.clientX;startY=event.clientY;startLeft=viewport.scrollLeft;startTop=viewport.scrollTop;viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',event=>{if(!dragging)return;viewport.scrollLeft=startLeft-(event.clientX-startX);viewport.scrollTop=startTop-(event.clientY-startY);});
viewport.addEventListener('pointerup',()=>{dragging=false;viewport.classList.remove('dragging');});
