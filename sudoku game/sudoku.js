export const levels = { Easy: 1, Medium: 1.5, Hard: 2 };
export function calculateScore(seconds, difficulty) { return Math.max(0, Math.round((10000-seconds)*levels[difficulty])); }
const digits = [1,2,3,4,5,6,7,8,9];
const units = [...digits.map((_,r)=>digits.map((_,c)=>r*9+c)),...digits.map((_,c)=>digits.map((_,r)=>r*9+c)),...digits.map((_,b)=>digits.map((_,i)=>Math.floor(b/3)*27+b%3*3+Math.floor(i/3)*9+i%3))];
export function options(board,i) { const used=new Set(units.filter(u=>u.includes(i)).flatMap(u=>u.map(j=>board[j]))); return digits.filter(n=>!used.has(n)); }
function shuffle(a) { for(let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
export function solve(board,limit=2,random=false) {
 const b=board.slice(); let count=0, solution;
 function visit() { let index=-1, choices;
  for(let i=0;i<81;i++) if(!b[i]) { const o=options(b,i); if(!o.length)return; if(!choices||o.length<choices.length){index=i;choices=o;} if(o.length===1)break; }
  if(index===-1){count++;solution=b.slice();return;}
  for(const n of random?shuffle(choices):choices){b[index]=n;visit();b[index]=0;if(count>=limit)return;}
 } visit(); return {count,solution};
}
export function rate(board) {
 const b=board.slice(); let hidden=0, steps=0;
 while(b.includes(0)) {
  const opts=b.map((v,i)=>v?[]:options(b,i)); let i=opts.findIndex(o=>o.length===1);
  if(i>=0){b[i]=opts[i][0];steps++;continue;}
  let found=false;
  for(const u of units){ for(const n of digits){const cells=u.filter(j=>opts[j].includes(n));if(cells.length===1){b[cells[0]]=n;hidden++;steps++;found=true;break;}}if(found)break;}
  if(!found)return {difficulty:'Hard',steps,hidden};
 } return {difficulty:hidden?'Medium':'Easy',steps,hidden};
}
export function generate(difficulty) {
 for(let attempt=0;attempt<500;attempt++){
  const solution=solve(Array(81).fill(0),1,true).solution, puzzle=solution.slice();
  const target={Easy:40,Medium:30,Hard:24}[difficulty]; let clues=81;
  for(const i of shuffle(Array.from({length:81},(_,i)=>i))){const old=puzzle[i];puzzle[i]=0;if(solve(puzzle).count!==1){puzzle[i]=old;continue;}clues--;const rating=rate(puzzle);if(clues<=target&&rating.difficulty===difficulty)return {puzzle,solution,rating};}
 } throw Error('Could not generate this difficulty. Please try again.');
}
