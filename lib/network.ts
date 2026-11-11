export type Group='AI'|'Platforms'|'Founders'|'Community'|'You';
export type Person={id:string;name:string;role:string;group:Group;x:number;y:number;photo?:string};
export type Edge={from:string;to:string};
export type Graph={nodes:Person[];edges:Edge[]};
export const catalog:Omit<Person,'x'|'y'>[]=[
{id:'elon',name:'Elon Musk',role:'Tesla / SpaceX / xAI',group:'Founders'},
{id:'bezos',name:'Jeff Bezos',role:'Amazon / Blue Origin',group:'Founders'},
{id:'jensen',name:'Jensen Huang',role:'NVIDIA',group:'AI'},
{id:'zuck',name:'Mark Zuckerberg',role:'Meta',group:'Platforms'},
{id:'gates',name:'Bill Gates',role:'Microsoft co-founder',group:'Founders'},
{id:'altman',name:'Sam Altman',role:'OpenAI',group:'AI'},
{id:'pichai',name:'Sundar Pichai',role:'Alphabet / Google',group:'Platforms'},
{id:'nadella',name:'Satya Nadella',role:'Microsoft',group:'AI'},
{id:'cook',name:'Tim Cook',role:'Apple',group:'Platforms'},
{id:'page',name:'Larry Page',role:'Google co-founder',group:'Founders'},
{id:'lisa',name:'Lisa Su',role:'AMD',group:'AI'},
{id:'huang',name:'Fei-Fei Li',role:'AI researcher',group:'AI'},
{id:'karpathy',name:'Andrej Karpathy',role:'AI researcher / educator',group:'AI'},
{id:'hoffman',name:'Reid Hoffman',role:'LinkedIn co-founder',group:'Founders'},
{id:'chesky',name:'Brian Chesky',role:'Airbnb',group:'Founders'},
{id:'whitman',name:'Meg Whitman',role:'Technology executive',group:'Platforms'},
];
const starters=['elon','bezos','jensen','zuck','gates','altman','pichai','nadella','cook','page'];
export const clone=(g:Graph):Graph=>({nodes:g.nodes.map(n=>({...n})),edges:g.edges.map(e=>({...e}))});
export function baseGraph(name='You'):Graph{
 const people:Person[]=[{id:'you',name,role:'Newcomer',group:'You',x:500,y:335},...starters.map((id,i)=>({...catalog.find(p=>p.id===id)!,x:500+315*Math.cos((i/10)*Math.PI*2),y:310+225*Math.sin((i/10)*Math.PI*2)})),{id:'dave',name:'Dave',role:'Indie founder',group:'Community',x:380,y:445},{id:'kevin',name:'Kevin',role:'Networking founder',group:'Community',x:660,y:445}];
 const edges:Edge[]=[];const add=(from:string,to:string)=>{if(from!==to&&!edges.some(e=>e.from===from&&e.to===to))edges.push({from,to})};
 // Synthetic, pedagogical endorsements; not real-world social connections.
 const ids=starters;
 ids.forEach((id,i)=>{add(id,ids[(i+1)%ids.length]);add(id,ids[(i+3)%ids.length]);if(i%2===0)add(id,'jensen');});
 ['elon','bezos','zuck','pichai','gates','nadella','cook'].forEach(id=>add('kevin',id));
 ['altman','jensen','nadella'].forEach(id=>add('dave',id));
 add('dave','you');add('you','dave');add('you','kevin');add('kevin','zuck');add('pichai','kevin');add('jensen','altman');
 return {nodes:people,edges};
}
export function rank(g:Graph,d=.85):Map<string,number>{
 const n=g.nodes.length;if(!n)return new Map();const idx=new Map(g.nodes.map((p,i)=>[p.id,i]));
 const outs=g.nodes.map(p=>g.edges.filter(e=>e.from===p.id&&idx.has(e.to)));
 let scores=Array(n).fill(1/n);
 for(let t=0;t<400;t++){
  const next=Array(n).fill((1-d)/n);
  for(let i=0;i<n;i++){const out=outs[i];if(!out.length){for(let j=0;j<n;j++)next[j]+=d*scores[i]/n;}else for(const e of out)next[idx.get(e.to)!]+=d*scores[i]/out.length;}
  const err=next.reduce((s,x,i)=>s+Math.abs(x-scores[i]),0);scores=next;if(err<1e-12)break;
 }
 return new Map(g.nodes.map((p,i)=>[p.id,scores[i]]));
}
export function followers(g:Graph,id:string){return g.edges.filter(e=>e.to===id).length}
export function addEdge(g:Graph,from:string,to:string):Graph{if(from===to||g.edges.some(e=>e.from===from&&e.to===to)||!g.nodes.some(n=>n.id===from)||!g.nodes.some(n=>n.id===to))return g;return {...g,edges:[...g.edges,{from,to}]}}
export function removeEdge(g:Graph,from:string,to:string):Graph{return {...g,edges:g.edges.filter(e=>!(e.from===from&&e.to===to))}}
export function addPerson(g:Graph,p:Omit<Person,'x'|'y'>):Graph{if(g.nodes.some(n=>n.id===p.id))return g;const i=g.nodes.length;return {...g,nodes:[...g.nodes,{...p,x:500+300*Math.cos(i*2.39996),y:310+200*Math.sin(i*2.39996)}]}}
export function scenario(g:Graph,type:string):Graph{
 let result=clone(g);if(type==='celebrity')return addEdge(result,'jensen','you');
 if(type==='crowd'){for(let i=0;i<16;i++){const id='crowd'+i;result=addPerson(result,{id,name:'Contact '+(i+1),role:'Ordinary contact',group:'Community'});result=addEdge(result,id,'you');}return result;}
 if(type==='echo'){const elite=['elon','bezos','jensen','zuck','gates'];for(const a of elite)for(const b of elite)if(a!==b)result=addEdge(result,a,b);return result;}
 if(type==='bridge'){for(const id of ['jensen','altman','nadella'])result=addEdge(result,id,'you');for(const id of ['zuck','pichai','cook'])result=addEdge(result,'you',id);return result;}
 return result;
}
