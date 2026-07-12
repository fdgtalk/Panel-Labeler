import { useMemo, useState } from 'react'

export function SmartInput({ value, onChange, options, placeholder }) {
  const [open,setOpen]=useState(false)
  const matches=useMemo(()=>options.filter(x=>x.toLowerCase().includes(value.toLowerCase())).slice(0,10),[options,value])
  return <div className="smart-input"><input value={value} placeholder={placeholder} onFocus={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);setOpen(true)}} onBlur={()=>setTimeout(()=>setOpen(false),150)}/>{open&&matches.length>0&&<div className="suggestions">{matches.map(x=><button type="button" key={x} onMouseDown={()=>onChange(x)}>{x}</button>)}</div>}</div>
}
