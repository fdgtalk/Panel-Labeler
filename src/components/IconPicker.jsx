import * as Icons from 'lucide-react'
import { Search, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'

const names=Object.keys(Icons).filter(x=>/^[A-Z]/.test(x)&&typeof Icons[x]==='object').slice(0,500)
export function IconPicker({ value='auto', autoIcon, onChange }) { const [open,setOpen]=useState(false),[query,setQuery]=useState('');const list=useMemo(()=>names.filter(x=>x.toLowerCase().includes(query.toLowerCase())).slice(0,80),[query]);const Picked=value==='auto'?(Icons[autoIcon]||Sparkles):value==='none'?X:Icons[value]||Sparkles
 return <div className="icon-picker"><button type="button" className="icon-trigger" onClick={()=>setOpen(!open)}><Picked/> {value==='auto'?'Auto':value==='none'?'None':value}</button>{open&&<div className="icon-popover"><input autoFocus placeholder="Search icons…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="icon-actions"><button type="button" onClick={()=>{onChange('auto');setOpen(false)}}>Auto</button><button type="button" onClick={()=>{onChange('none');setOpen(false)}}>No icon</button></div><div className="icon-grid">{list.map(name=>{const I=Icons[name];return <button type="button" title={name} key={name} onClick={()=>{onChange(name);setOpen(false)}}><I/><small>{name}</small></button>})}</div></div>}</div> }
