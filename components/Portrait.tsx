'use client';
import {Person} from '../lib/network';
const palette:Record<string,string>={AI:'#a2b6ad',Platforms:'#a5b9cd',Founders:'#d5b18c',Community:'#c9b6ce',You:'#91b8a2'};
export default function Portrait({person,size=44}:{person:Person;size?:number}){
 const initials=person.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
 return <span className="portrait" style={{width:size,height:size,background:palette[person.group]}} title={person.name}>
 {person.photo?<img src={person.photo} alt={person.name} draggable={false}/>:<span style={{fontSize:Math.max(10,size*.3)}}>{initials}</span>}
 </span>;
}
