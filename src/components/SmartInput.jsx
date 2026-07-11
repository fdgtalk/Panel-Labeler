import { useMemo, useState } from 'react'

export function SmartInput({ value, onChange, options, placeholder }) {
  const [open,setOpen]=useState(false)
  const [colorTick,setColorTick]=useState(0)
  const isLevel=options?.some(x=>['BSM','1ST','SS','RDC'].includes(x))
  const matches=useMemo(()=>options.filter(x=>x.toLowerCase().includes(value.toLowerCase())).slice(0,10),[options,value])
  const colors=window.__panelLevelColors||(window.__panelLevelColors={BSM:'#3b82f6','1ST':'#16a36a',SS:'#3b82f6',RDC:'#16a36a',MEZ:'#9b51e0',OUT:'#f79009',EXT:'#f79009',MEC:'#667085'})
  return <div className={`smart-input ${isLevel?'level-smart-input':''}`}><input value={value} placeholder={placeholder} onFocus={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);setOpen(true)}} onBlur={()=>setTimeout(()=>setOpen(false),150)}/>{isLevel&&<input aria-label="Level color" className="level-color" type="color" value={colors[value]||'#667085'} onChange={e=>{colors[value]=e.target.value;setColorTick(colorTick+1)}}/>}{open&&matches.length>0&&<div className="suggestions">{matches.map(x=><button type="button" key={x} onMouseDown={()=>onChange(x)}>{x}</button>)}</div>}</div>
}
