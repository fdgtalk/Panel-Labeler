import { ArrowRight, Bath, BedDouble, Car, ChartNoAxesColumnIncreasing, ChevronDown, ChevronUp, Download, Dumbbell, Fan, Hammer, Lightbulb, ListOrdered, Minus, Moon, MousePointer2, NotebookPen, PanelTop, Plug, Printer, RotateCcw, Settings2, Sofa, Sun, Trees, Trash2, Triangle, Upload, Utensils, WashingMachine, Waves, Wrench } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { create } from 'zustand'
import { SmartInput } from './components/SmartInput'
import { IconPicker } from './components/IconPicker'

const nativeConfirm=window.confirm.bind(window)
window.confirm=message=>String(message).startsWith('Delete label at breaker')?true:nativeConfirm(message)

const rooms = ['Workshop','Laundry room','Kitchen','Bedroom','Bachelor','Bathroom','Office','Gym','Sauna','Staircase','Living room','Dining room','Garage','Terrace','Outside','Utility']
const floors = ['BSM','MAIN','1ST','MEZ','2ND','OUT','MEC']
const roomChoices={EN:rooms,FR:['Atelier','Salle de lavage','Cuisine','Chambre','Garçonnière','Salle de bain','Bureau','Gym','Sauna','Escalier','Salon','Salle à manger','Garage','Terrasse','Extérieur','Mécanique']}
const floorChoices={EN:floors,FR:['SS','RDC','1ER','MEZ','2E','EXT','MEC']}
const initialLanguage=new URLSearchParams(window.location.search).get('lang')?.toUpperCase()==='FR'?'FR':'EN'
const storageKey=`panel-labeler-v1-${initialLanguage.toLowerCase()}`
const savedProject=(()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch{return null}})()
const savedConfig=(({dotMode,...config})=>config)(savedProject?.config||{})
const seed = Array.from({ length: 30 }, (_, i) => ({ left:{ floor:floors[i%5], room:rooms[i%rooms.length], items:['Lights','Outlets'], icon:'auto' }, right:{ floor:floors[(i+1)%5], room:rooms[(i+4)%rooms.length], items:['Lights','Dryer'], icon:'auto' } }))
seed[4].left.double=true;seed[5].left.reserved=true;seed[14].right.double=true;seed[15].right.reserved=true
const demoRows=(language='EN')=>{const rs=roomChoices[language],fs=floorChoices[language],fx=fixtureChoicesByLanguage[language],rows=Array.from({length:30},(_,i)=>({left:{floor:fs[i%5],room:rs[i%rs.length],items:[fx[0],fx[1]],icon:'auto'},right:{floor:fs[(i+1)%5],room:rs[(i+4)%rs.length],items:[fx[0],fx[3]],icon:'auto'}}));[[3,'left'],[8,'right'],[15,'left'],[22,'right']].forEach(([i,side])=>{rows[i][side].double=true;rows[i+1][side].reserved=true});[[1,'right'],[2,'right'],[6,'left'],[7,'left'],[12,'right'],[13,'right'],[19,'left'],[26,'right'],[27,'right']].forEach(([i,side])=>rows[i][side]=blank());return rows}
const blank = () => ({ floor:'', room:'', items:[], icon:'auto', empty:true })
const emptyRows = () => Array.from({ length:30 }, () => ({ left:blank(), right:blank() }))
const iconMap={Workshop:Hammer,Laundry:WashingMachine,'Laundry room':WashingMachine,Kitchen:Utensils,Bedroom:BedDouble,Bachelor:BedDouble,Bathroom:Bath,Office:NotebookPen,Gym:Dumbbell,Sauna:Waves,Staircase:ChartNoAxesColumnIncreasing,'Living room':Sofa,'Dining room':Utensils,Garage:Car,Terrace:Trees,Outside:Trees,'Outside / Exterior':Trees,Utility:Wrench}
Object.assign(iconMap,{Atelier:Hammer,'Salle de lavage':WashingMachine,Cuisine:Utensils,Chambre:BedDouble,'Garçonnière':BedDouble,'Salle de bain':Bath,Bureau:NotebookPen,Escalier:ChartNoAxesColumnIncreasing,Salon:Sofa,'Salle à manger':Utensils,Garage:Car,Terrasse:Trees,'Extérieur':Trees,'Mécanique':Wrench})
const icons={auto:null,none:null,light:Lightbulb,plug:Plug,fan:Fan,hammer:Hammer,bed:BedDouble,bath:Bath,gym:Dumbbell,stairs:ChartNoAxesColumnIncreasing,trees:Trees,wrench:Wrench,waves:Waves,utensils:Utensils,sofa:Sofa,car:Car}
Object.assign(icons,LucideIcons)
icons.heater=LucideIcons.Heater
icons.laundry=WashingMachine
icons.appliance=Utensils
icons.hood=LucideIcons.Wind
icons.vacuum=LucideIcons.CircleDot
icons.ventilation=LucideIcons.Wind
iconMap.Utility=Wrench
iconMap['Mécanique']=Wrench
const fixtureChoicesByLanguage={EN:['Lights','Outlets','GFCI','Dryer','Washer','Baseboard heater','Floor heat','Ceiling fan','Oven','Dishwasher','Air exchange','Central vacuum','Water heater'],FR:['Lumières','Prises','DDFT','Sécheuse','Laveuse','Plinthe électrique','Plancher chauffant','Ventilateur de plafond','Four','Lave-vaisselle','Échangeur d’air','Aspirateur central','Chauffe-eau']}
const autoFixture=(text='')=>/water heater|chauffe-eau|heater tank/i.test(text)?'heater':/washer|laveuse|dryer|sécheuse/i.test(text)?'laundry':/central vacuum|aspirateur central/i.test(text)?'vacuum':/air exchange|échangeur d.?air|ventilation/i.test(text)?'ventilation':/stove fan|oven fan|range hood|hotte/i.test(text)?'hood':/stove|range|oven|cuisinière|four/i.test(text)?'appliance':/light|lamp|lumière/i.test(text)?'light':/outlet|plug|gfci|prise|ddft/i.test(text)?'plug':/fan|ventilateur/i.test(text)?'fan':null
const autoRoom=(room='')=>{const exact={Workshop:'Hammer',Atelier:'Hammer',Laundry:'WashingMachine','Laundry room':'WashingMachine','Salle de lavage':'WashingMachine',Kitchen:'Utensils',Cuisine:'Utensils',Bedroom:'BedDouble',Chambre:'BedDouble',Bachelor:'BedDouble','Garçonnière':'BedDouble',Bathroom:'Bath','Salle de bain':'Bath',Office:'NotebookPen',Bureau:'NotebookPen',Gym:'Dumbbell',Sauna:'Waves',Staircase:'ChartNoAxesColumnIncreasing',Escalier:'ChartNoAxesColumnIncreasing','Living room':'Sofa',Salon:'Sofa','Dining room':'Utensils','Salle à manger':'Utensils',Garage:'Car',Terrace:'Trees',Terrasse:'Trees',Outside:'Trees','Outside / Exterior':'Trees','Extérieur':'Trees',Utility:'Wrench','Mécanique':'Wrench'};return exact[room]||(/outside|extérieur|exterieur/i.test(room)?'Trees':undefined)}
const roomIcon=room=>iconMap[room]||icons[autoRoom(room)]
function LevelIndicator({floor}){const Icon=({BSM:ChevronDown,SS:ChevronDown,'1ST':Minus,'1ER':Minus,'2ND':ChevronUp,'2E':ChevronUp,MEZ:Triangle,OUT:Trees,EXT:Trees,MEC:Wrench}[floor]);if(floor==='MAIN'||floor==='RDC')return <span className="level-dot" aria-label="Main floor"/>;return Icon?<Icon className="level-indicator"/>:null}

const usePanel = create((set) => ({ rows:savedProject?.rows||demoRows(initialLanguage), theme:savedProject?.theme||'dark', started:false, edit:null, settingsOpen:false, dragging:null, config:{title:'Panel',count:60,width:3,row:.75,language:initialLanguage,paper:'letter',...savedConfig},
  set:(key,value)=>set({[key]:value}),
  save:(side,index,breaker,card)=>set(s=>{
    const targetSide=breaker%2?'left':'right',targetIndex=Math.floor((breaker-1)/2),rows=s.rows.map(row=>({left:{...row.left},right:{...row.right}})),previous=rows[index][side],target=rows[targetIndex][targetSide]
    rows[targetIndex][targetSide]={...card,empty:false,reserved:false}
    if(targetSide!==side||targetIndex!==index)rows[index][side]={...target,reserved:false}
    if(targetIndex+1<rows.length)rows[targetIndex+1][targetSide]={...rows[targetIndex+1][targetSide],reserved:!!card.double}
    if((targetSide!==side||targetIndex!==index)&&index+1<rows.length)rows[index+1][side]={...rows[index+1][side],reserved:!!previous.double}
    return {rows,edit:null}
  }),
  clipboard:null,
  pasteMode:false,
  copy:(card)=>set({clipboard:structuredClone(card),pasteMode:true,edit:null}),
  cancelPaste:()=>set({pasteMode:false}),
  pasteAt:(side,index)=>set(s=>{
    if(!s.clipboard)return {}
    const rows=s.rows.map(row=>({left:{...row.left},right:{...row.right}})),target=rows[index][side],copy={...structuredClone(s.clipboard),empty:false,reserved:false}
    if(copy.double&&index===rows.length-1){window.alert('A double-height label needs two available positions.');return {}}
    rows[index][side]=copy
    if(index+1<rows.length){
      if(copy.double)rows[index+1][side]={...blank(),reserved:true}
      else if(target.double)rows[index+1][side]=blank()
    }
    return {rows,pasteMode:false}
  }),
  swap:(source,target)=>set(s=>{
    if(source.side===target.side&&source.index===target.index)return {}
    const sourceCard=s.rows[source.index][source.side],targetCard=s.rows[target.index][target.side]
    const rows=s.rows.map(row=>({left:{...row.left},right:{...row.right}}))
    if(sourceCard.double){
      if(target.index===rows.length-1){window.alert('A double-height breaker needs two open positions.');return {}}
      const targetNext=rows[target.index+1][target.side]
      if(target.side===source.side&&target.index===source.index-1){
        rows[target.index][target.side]={...sourceCard,reserved:false,double:true}
        rows[source.index][source.side]={...blank(),reserved:true}
        rows[source.index+1][source.side]={...targetCard,reserved:false,double:false}
        return {rows}
      }
      if(target.side===source.side&&target.index===source.index+2){
        rows[source.index][source.side]={...targetCard,reserved:false,double:false}
        rows[source.index+1][source.side]={...sourceCard,reserved:false,double:true}
        rows[target.index][target.side]={...blank(),reserved:true}
        return {rows}
      }
      if(targetCard.double){
        rows[source.index][source.side]={...targetCard,reserved:false}
        rows[target.index][target.side]={...sourceCard,reserved:false}
        return {rows}
      }
      if(targetNext.reserved||targetNext.double){window.alert('Drop the double-height breaker onto the first of two normal labels.');return {}}
      rows[source.index][source.side]={...targetCard,reserved:false,double:false}
      rows[source.index+1][source.side]={...targetNext,reserved:false,double:false}
      rows[target.index][target.side]={...sourceCard,reserved:false,double:true}
      rows[target.index+1][target.side]={...blank(),reserved:true}
      return {rows}
    }
    if(targetCard.double){window.alert('To move a double-height breaker, drag the double label itself.');return {}}
    rows[source.index][source.side]={...targetCard,reserved:false}
    rows[target.index][target.side]={...sourceCard,reserved:false}
    return {rows}
  }),
  dragTarget:null,
  beginDrag:(dragging)=>set({dragging,dragTarget:null}),
  setDragTarget:(dragTarget)=>set({dragTarget}),
  endDrag:()=>set({dragging:null,dragTarget:null}),
  deleteLabel:(side,index)=>set(s=>{
    const rows=s.rows.map(row=>({left:{...row.left},right:{...row.right}})),card=rows[index][side]
    rows[index][side]=blank()
    if(card.double&&index+1<rows.length)rows[index+1][side]=blank()
    return {rows,edit:null}
  }),
  reset:()=>set({rows:emptyRows()}), dummy:(language)=>set(s=>({rows:demoRows(language||s.config.language)}))
}))
usePanel.subscribe(state=>localStorage.setItem(storageKey,JSON.stringify({rows:state.rows,config:state.config,theme:state.theme})))

const Button = ({ children, variant='ghost', ...props }) => <button className={`button ${variant}`} {...props}>{children}</button>
const drawJpegIcon=(ctx,Icon,x,y,size,color)=>new Promise(resolve=>{
  if(!Icon)return resolve()
  const image=new Image(),svg=renderToStaticMarkup(<Icon size={size} strokeWidth={2} color={color}/>)
  image.onload=()=>{ctx.drawImage(image,x,y,size,size);resolve()}
  image.onerror=resolve
  image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
})
const levelIconFor=floor=>({BSM:ChevronDown,SS:ChevronDown,'1ST':Minus,'1ER':Minus,'2ND':ChevronUp,'2E':ChevronUp,MEZ:Triangle,OUT:Trees,EXT:Trees,MEC:Wrench}[floor])
const makeJpeg=async(rows,config)=>{
  const activeRows=rows.slice(0,Math.ceil(config.count/2)),width=1080,padding=24,header=108,rowHeight=68,height=header+activeRows.length*rowHeight+padding
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')
  canvas.width=width;canvas.height=height
  ctx.fillStyle='#eef2f6';ctx.fillRect(0,0,width,height)
  ctx.fillStyle='#132238';ctx.fillRect(padding,padding,width-padding*2,header-24)
  ctx.fillStyle='#fff';ctx.font='700 32px Inter, system-ui, sans-serif';ctx.fillText(config.title||'Panel Labeler',padding+20,66)
  ctx.fillStyle='#a9b8ca';ctx.font='16px ui-monospace, SFMono-Regular, monospace';ctx.fillText(`${config.count} BREAKER PANEL  ·  ${config.language==='FR'?'FRANÇAIS':'ENGLISH'}`,padding+20,91)
  const cardWidth=(width-padding*2-20)/2
  const draw=async(card,side,rowIndex)=>{
    if(card.reserved)return
    const x=padding+(side==='right'?cardWidth+20:0),y=header+rowIndex*rowHeight,cardH=card.double?rowHeight*2-4:rowHeight-4
    ctx.fillStyle=card.backgroundColor||'#fff';ctx.fillRect(x,y,cardWidth,cardH)
    ctx.strokeStyle='#c7d2de';ctx.lineWidth=1.5;ctx.strokeRect(x+1,y+1,cardWidth-2,cardH-2)
    if(card.empty&&!card.room&&!card.items?.length)return
    const slotWidth=86,slotX=side==='left'?x+cardWidth-slotWidth:x,textX=side==='left'?x+13:x+slotWidth+13,maxText=cardWidth-slotWidth-26,RoomIcon=card.icon&&card.icon!=='auto'?icons[card.icon]:roomIcon(card.room)
    ctx.strokeStyle='#aeb9c8';ctx.beginPath();ctx.moveTo(side==='left'?slotX:slotX+slotWidth,y);ctx.lineTo(side==='left'?slotX:slotX+slotWidth,y+cardH);ctx.stroke()
    if(RoomIcon)await drawJpegIcon(ctx,RoomIcon,slotX+12,y+cardH/2-13,26,'#142032')
    const LevelIcon=levelIconFor(card.floor)
    if(LevelIcon)await drawJpegIcon(ctx,LevelIcon,slotX+48,y+cardH/2-13,18,'#142032')
    else if(card.floor==='MAIN'||card.floor==='RDC'){ctx.beginPath();ctx.arc(slotX+57,y+cardH/2-4,5,0,Math.PI*2);ctx.strokeStyle='#142032';ctx.lineWidth=2;ctx.stroke()}
    ctx.fillStyle='#142032';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.font='700 9px ui-monospace, SFMono-Regular, monospace';ctx.fillText(card.floor||'',slotX+57,y+cardH/2+18)
    const roomX=textX
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#0f1f35';ctx.font='700 17px Inter, system-ui, sans-serif';ctx.fillText((card.room||'UNLABELLED').toUpperCase(),roomX,y+27,maxText-(RoomIcon?23:0))
    let fixtureX=textX
    const fixtures=(card.fixtures||card.items?.map(text=>({text,icon:'auto'}))||[]).filter(f=>f.text).slice(0,3)
    ctx.fillStyle='#64748b';ctx.font='13px Inter, system-ui, sans-serif'
    for(const fixture of fixtures){const FixtureIcon=icons[fixture.icon==='auto'?autoFixture(fixture.text):fixture.icon],text=fixture.text;if(FixtureIcon){await drawJpegIcon(ctx,FixtureIcon,fixtureX,y+38,13,'#64748b');fixtureX+=17}ctx.fillText(text,fixtureX,y+49,Math.max(0,x+cardWidth-14-fixtureX));fixtureX+=ctx.measureText(text).width+10}
  }
  for(let index=0;index<activeRows.length;index+=1){const row=activeRows[index];await draw(row.left,'left',index);await draw(row.right,'right',index)}
  return canvas.toDataURL('image/jpeg',.94)
}
function Label({ card, side, index, onClick, beginDrag, setDragTarget, endDrag, dragging, dragTarget, swap, printRow }) {
  const position={side,index},isTarget=dragTarget?.side===side&&dragTarget?.index===index
  const dragStart=e=>{e.dataTransfer.effectAllowed='move';beginDrag(position)}
  const dragOver=e=>e.preventDefault()
  const dragEnter=e=>{e.preventDefault();setDragTarget(position)}
  const drop=e=>{e.preventDefault();if(dragging)swap(dragging,position);endDrag()}
  const className=`label ${side} ${card.double?'double':''} ${isTarget?'drop-target':''}`
  const props={draggable:true,onDragStart:dragStart,onDragEnd:endDrag,onDragOver:dragOver,onDragEnter:dragEnter,onDrop:drop,className,onClick}
  const Icon=card.icon&&card.icon!=='auto'?icons[card.icon]:roomIcon(card.room)
  const marker=card.room&&Icon?<i className="room-icon-slot"><Icon/><span className="level-meta"><LevelIndicator floor={card.floor}/><small>{card.floor}</small></span></i>:null
  if(card.empty&&!card.room&&!card.items?.length)return <button {...props} className={`${className} blank`} aria-label="Add circuit"><span className="blank-content"/></button>
  const fixtures=(card.fixtures||card.items.map(text=>({text,icon:'auto'}))).filter(x=>x.text).slice(0,3)
  const main=<span className="label-main"><b>{card.room}</b><span>{fixtures.map((f,i)=>{const I=icons[f.icon==='auto'?autoFixture(f.text):f.icon];return <em className={i<2?'primary-fixture':''} key={i}>{I&&<I/>}{f.text}</em>})}</span></span>
  const placement=printRow?{gridRow:`${printRow} / span ${card.double?2:1}`}:(card.double?{gridRow:'span 2'}:{})
  const labelStyle={...placement,...(card.backgroundColor?{backgroundColor:card.backgroundColor}:{})}
  return <button {...props} style={labelStyle}>{side==='right'?<>{marker}{main}</>:<>{main}{marker}</>}</button>
}
function Dialog({ side,index,card,language='EN' }) {
  const save=usePanel(s=>s.save),copy=usePanel(s=>s.copy),deleteLabel=usePanel(s=>s.deleteLabel),close=usePanel(s=>s.set),count=usePanel(s=>s.config.count),floors=floorChoices[language],rooms=roomChoices[language],fixtureChoices=fixtureChoicesByLanguage[language]
  const initialBreaker=side==='left'?index*2+1:index*2+2
  const [breaker,setBreaker]=useState(initialBreaker)
  const normalise=source=>({...source,fixtures:Array.from({length:4},(_,i)=>source.fixtures?.[i]||source.items?.[i]&&{text:source.items[i],icon:'auto'}||{text:'',icon:'auto'})})
  const [draft,set]=useState(normalise(card))
  const updateFixture=(i,part)=>set({...draft,fixtures:draft.fixtures.map((f,n)=>n===i?{...f,...part}:f)})
  const preparedCard=()=>{const fixtures=draft.fixtures.filter(f=>f.text);return {...draft,fixtures,items:fixtures.map(f=>f.text)}}
  const validBreaker=value=>Math.max(1,Math.min(count,Number(value)||initialBreaker))
  return <div className="scrim" onMouseDown={e=>{if(e.target===e.currentTarget)close('edit',null)}}><form className="dialog" onSubmit={e=>{e.preventDefault();const destination=validBreaker(breaker);if(draft.double&&destination!==initialBreaker){window.alert('Move double-height breakers by dragging the two-slot label.');return}save(side,index,destination,preparedCard())}}><header><div><span className="eyebrow">BREAKER {initialBreaker}</span><h2>Edit label</h2></div></header><div className="fields breaker-meta"><label>Move / swap with breaker<input type="number" min="1" max={count} step="1" value={breaker} onChange={e=>setBreaker(e.target.value)}/></label><label className="check"><input type="checkbox" checked={!!draft.double} onChange={e=>set({...draft,double:e.target.checked})}/> Double height</label></div><p className="drag-help">Drag swaps labels. Double labels use two slots.</p><div className="label-style-fields"><label>Level<SmartInput value={draft.floor} options={floors} onChange={floor=>set({...draft,floor})}/></label><label>Label background<input className="label-background-picker" type="color" value={draft.backgroundColor||'#ffffff'} onChange={e=>set({...draft,backgroundColor:e.target.value})}/></label></div><div className="fields"><label>Room<SmartInput value={draft.room} options={rooms} onChange={room=>set({...draft,room})}/></label><label>Room icon<IconPicker value={draft.icon||'auto'} autoIcon={autoRoom(draft.room)} onChange={icon=>set({...draft,icon})}/></label></div><label>Fixtures</label><div className="fixture-rows">{[0,1,2,3].map(i=>{const f=draft.fixtures[i]||{text:'',icon:'auto'};const auto=autoFixture(f.text);return <div key={i}><SmartInput value={f.text} placeholder="Type or choose a fixture" options={fixtureChoices} onChange={text=>updateFixture(i,{text})}/><IconPicker value={f.text?f.icon:'auto'} autoIcon={auto==='light'?'Lightbulb':auto==='plug'?'Plug':auto==='fan'?'Fan':undefined} onChange={icon=>updateFixture(i,{icon})}/></div>})}</div><footer className="dialog-actions"><div className="dialog-actions-left"><Button type="button" variant="danger" onClick={()=>{if(window.confirm(`Delete label at breaker ${initialBreaker}?`))deleteLabel(side,index)}}>Delete</Button><Button type="button" onClick={()=>copy(preparedCard())}>Copy</Button></div><div className="dialog-actions-right"><Button type="button" onClick={()=>close('edit',null)}>Cancel</Button><Button variant="primary">Save & move</Button></div></footer></form></div>
}
function Editor(){
  const {rows,edit,set,reset,dummy,swap,dragging,dragTarget,beginDrag,setDragTarget,endDrag,pasteMode,pasteAt,cancelPaste,config,settingsOpen}=usePanel(),rowCount=config.count/2
  const rail=side=><div className="rail"><h3>{side==='left'?'LEFT · ODD':'RIGHT · EVEN'}</h3>{rows.slice(0,rowCount).map((r,i)=>!r[side].reserved&&<Label key={i} card={r[side]} side={side} index={i} dragging={dragging} dragTarget={dragTarget} beginDrag={beginDrag} setDragTarget={setDragTarget} endDrag={endDrag} swap={swap} onClick={()=>pasteMode?pasteAt(side,i):set('edit',{side,index:i,card:r[side]})}/>)}</div>
  return <main className="editor"><section className="settings"><div><span className="eyebrow">PROJECT SETTINGS</span><h2>{config.count} breaker panel</h2><p>Drag a label onto a highlighted target to swap exactly those two labels. Nothing else shifts.</p></div></section>{pasteMode&&<div className="paste-banner">Copied label ready — click a breaker to paste it there.<Button onClick={cancelPaste}>Cancel paste</Button></div>}{settingsOpen&&<section className="settings-card"><label>Panel title<input value={config.title||''} placeholder="Main panel" onChange={e=>set('config',{...config,title:e.target.value})}/></label><label>Language<select value={config.language} onChange={e=>set('config',{...config,language:e.target.value})}><option value="EN">English</option><option value="FR">Français</option></select></label><label>Paper size<select value={config.paper} onChange={e=>set('config',{...config,paper:e.target.value})}><option value="letter">US Letter</option><option value="a4">A4</option></select></label><label>Breaker count<input type="number" min="2" max="60" step="2" value={config.count} onChange={e=>set('config',{...config,count:+e.target.value})}/></label><label>Label width (in)<input type="number" step=".25" value={config.width} onChange={e=>set('config',{...config,width:+e.target.value})}/></label><label>Row height (in)<input type="number" step=".05" value={config.row} onChange={e=>set('config',{...config,row:+e.target.value})}/></label><div className="settings-danger"><span>Danger zone</span><Button type="button" onClick={()=>{if(window.confirm('Clear every label from this panel?'))reset()}}>Delete panel</Button></div></section>}<div className="panel-actions"><Button onClick={()=>set('settingsOpen',!settingsOpen)}><Settings2/> Panel settings</Button></div><section className={`panel ${pasteMode?'paste-mode':''}`} style={{'--row-h':`${config.row}in`,'--label-w':`${config.width}in`}}>{rail('left')}<div className="numbers">{rows.slice(0,rowCount).map((_,i)=><span key={i}>{String(i*2+1).padStart(2,'0')} · {String(i*2+2).padStart(2,'0')}</span>)}</div>{rail('right')}</section>{edit&&<Dialog {...edit} language={config.language}/>}</main>
}
function PrintPages(){
  const {rows,config}=usePanel()
  const allRows=rows.slice(0,Math.ceil(config.count/2))
  const perPage=Math.max(1,Math.floor(((config.paper==='a4'?11.69:11)-1.45)/config.row))
  const pages=[]
  let start=0
  while(start<allRows.length){
    const pageStart=start,chunk=[]
    let slots=0
    while(start<allRows.length){
      const row=allRows[start]
      const isDouble=!!(row.left.double||row.right.double)
      const needed=isDouble?2:1
      if(chunk.length&&slots+needed>perPage)break
      chunk.push(row)
      slots+=needed
      start+=1
      if(isDouble&&start<allRows.length){
        chunk.push(allRows[start])
        start+=1
      }
    }
    pages.push(<section className="print-sheet" key={pageStart} style={{'--sheet-h':config.paper==='a4'?'11.69in':'11in','--label-w':`${config.width}in`}}><i className="mark tl"/><i className="mark tr"/><i className="mark bl"/><i className="mark br"/><div className="print-cut-guides" aria-hidden="true"><i className="outer-left"/><i className="outer-right"/></div><div className="print-panel" style={{'--row-h':`${config.row}in`,'--label-w':`${config.width}in`,'--print-rows':chunk.length}}>{['left','right'].map(side=><div className="print-rail" key={side}>{chunk.map((row,i)=>row[side].reserved?<div className="print-reserved" key={i}/>:<Label key={i} card={row[side]} side={side} index={pageStart+i} printRow={i+1} onClick={()=>{}} beginDrag={()=>{}} setDragTarget={()=>{}} endDrag={()=>{}} dragging={null} dragTarget={null} swap={()=>{}}/>)}</div>)}</div><p className="print-reference">{config.paper==='a4'?'A4':'US Letter'} · ¼in page margin · {config.row}in breaker height · print at 100%</p></section>)
  }
  return <div className="print-pages">{pages}</div>
}
function LandingLabel({side='left',floor,number,room,RoomIcon,fixtures=[]}){
  const content=<span className="demo-label-main"><b>{room}</b><span>{fixtures.map(([Icon,text],index)=><em className={index<2?'primary-fixture':''} key={text}>{Icon&&<Icon/>}{text}</em>)}</span></span>
  const marker=<i className="demo-icon-slot">{RoomIcon&&<RoomIcon/>}<span className="demo-level-meta"><LevelIndicator floor={floor}/><small>{floor}</small></span></i>
  return <div className={`demo-label ${side}`}>{side==='right'?<>{marker}{content}</>:<>{content}{marker}</>}</div>
}
function Landing(){
  const {theme,config,set}=usePanel()
  const chooseLanguage=language=>set('config',{...config,language})
  return <div className={`landing-screen ${theme}`}><header className="landing-bar"><a className="brand" href="#"><PanelTop/> Panel Labeler</a><div className="landing-nav"><div className="language-switch"><Button variant={config.language==='EN'?'primary':'ghost'} onClick={()=>chooseLanguage('EN')}>EN</Button><Button variant={config.language==='FR'?'primary':'ghost'} onClick={()=>chooseLanguage('FR')}>FR</Button></div><Button onClick={()=>set('theme',theme==='light'?'dark':'light')} title="Toggle dark mode">{theme==='light'?<Moon/>:<Sun/>}</Button><Button variant="primary" onClick={()=>set('started',true)}>Start labeling <ArrowRight/></Button></div></header><main className="landing-main"><section className="landing-copy"><span className="landing-kicker">PRINT-READY BREAKER LABELS</span><h1>Label it. Move it. <em>Print it.</em></h1><p>Build a clear panel schedule, drag breakers exactly where they belong, then print at the correct physical size.</p><Button variant="primary" onClick={()=>set('started',true)}>Start labeling your panel <ArrowRight/></Button><div className="landing-steps"><div><b>1</b><span>Click a breaker to add its room, level, fixtures, and icon.</span></div><div><b>2</b><span>Drag a card onto another breaker to swap the two positions.</span></div><div><b>3</b><span>Choose paper size, then print at 100% with no page margin.</span></div></div></section><section className="landing-demo" aria-label="Animated panel demonstration"><div className="demo-panel-head"><span>YOUR PANEL</span><small>{config.count} BREAKERS</small></div><div className="demo-rails"><div className="demo-rail"><strong>LEFT · ODD</strong><LandingLabel floor="BSM" number="01" room="Workshop" RoomIcon={Hammer} fixtures={[[Lightbulb,'Lights'],[Plug,'Outlets']]}/><LandingLabel floor="MEZ" number="05" room="Kitchen" RoomIcon={Utensils} fixtures={[[Lightbulb,'Lights'],[Plug,'Outlets']]}/></div><div className="demo-numbers"><span>01 · 02</span><span>03 · 04</span><span>05 · 06</span></div><div className="demo-rail"><strong>RIGHT · EVEN</strong><LandingLabel side="right" floor="1ST" number="02" room="Bachelor" RoomIcon={BedDouble} fixtures={[[Lightbulb,'Lights'],[WashingMachine,'Dryer']]}/><div className="demo-target"><MousePointer2/><b>DROP TO SWAP</b><small>exact positions</small></div></div></div><div className="demo-swap-hint"><MousePointer2/> Drag a card onto a highlighted breaker to swap.</div><div className="demo-output"><span><Printer/> Print at 100%</span><span><Download/> Save JPEG reference</span></div></section></main></div>
}
function App(){
  const {theme,set,config,reset,dummy,started}=usePanel()
  const exportData=()=>{const raw=JSON.stringify(usePanel.getState().rows,null,2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.download='panel-labels.json';a.click()}
  const downloadJpeg=async()=>{const data=await makeJpeg(usePanel.getState().rows,config),a=document.createElement('a');a.href=data;a.download='panel-labeler-reference.jpg';a.click()}
  const printPanel=()=>requestAnimationFrame(()=>window.print())
  const importData=e=>{const file=e.target.files?.[0];if(!file)return;file.text().then(text=>{const rows=JSON.parse(text);if(Array.isArray(rows))usePanel.getState().set('rows',rows)}).catch(()=>window.alert('That file is not valid panel JSON.'));e.target.value=''}
  const chooseLanguage=language=>{set('config',{...config,language});if(confirm(`Load the ${language==='FR'?'French':'English'} demo panel? This replaces the current panel.`))dummy()}
  if(!started)return <Landing/>
  return <div className={theme}><style>{`@page{size:${config.paper==='a4'?'A4':'letter'} portrait;margin:.25in}`}</style><header className="topbar"><a className="brand" href="#"><PanelTop/> Panel Labeler</a><nav><div className="language-switch"><Button variant={config.language==='EN'?'primary':'ghost'} onClick={()=>chooseLanguage('EN')}>EN</Button><Button variant={config.language==='FR'?'primary':'ghost'} onClick={()=>chooseLanguage('FR')}>FR</Button></div><Button onClick={()=>set('theme',theme==='light'?'dark':'light')} title="Toggle dark mode">{theme==='light'?<Moon/>:<Sun/>}</Button><Button variant="primary" onClick={printPanel}><Printer/> Print</Button><Button onClick={downloadJpeg}><Download/> JPEG</Button><details className="panel-menu"><summary className="button"><Settings2/> Options</summary><div className="panel-menu-items"><Button onClick={()=>dummy()}><RotateCcw/> Create demo</Button><label className="button"><Upload/> Import<input hidden type="file" accept="application/json" onChange={importData}/></label><Button onClick={exportData}><Download/> Export</Button><Button variant="danger" onClick={()=>{if(confirm('Clear every label from this panel?'))reset()}}><Trash2/> Clear panel</Button></div></details></nav></header><Editor/><PrintPages/></div>
}
export default App
