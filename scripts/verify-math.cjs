// Independent identities and long-run numerical checks for the course examples.
const assert=require('node:assert/strict');
const {simulate,poles}=require('../assets/js/numerics.js');
const mul=(a,b)=>{const c=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>c[i+j]+=x*y));return c;};
const add=(a,b)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+(b[i]||0));
const equal=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++)assert.ok(Math.abs((a[i]||0)-(b[i]||0))<1e-10,`${a} != ${b}`);};
for(const [A,C,F,G] of [ [[1,-.8],[1,.7],[1,1.5],[1.2]],[[1,2.5,.8],[1,-1.6,.9],[1,-4.1],[10.35,3.28]],[[1,-.8],[1,-.7],[1,.1],[.08]],[[1,.6],[1,-.2],[1,-.8],[.48]] ])equal(add(mul(A,F),[0,0,...G]),C);
equal(add(mul([1,-1.6],[1,.1]),[5,-3.5]),[6,-5,-.16]);
equal(add(mul(mul([1,.6],[1,-.8]),[1,-3]),mul([4,-1.2],[1,-.2])),[5,-5.2,.36,1.44]);
const run=simulate({count:200000});
assert.ok(Math.abs(run.openVariance-7.25)<.18);
assert.ok(Math.abs(run.closedVariance-3.25)<.07);
// Under the MVC law, closed output must equal the two-tap innovation filter.
for(let k=1;k<run.v.length;k++)assert.ok(Math.abs(run.closed[k]-run.v[k]-1.5*run.v[k-1])<1e-10);
assert.equal(poles('4',3).moving,1);
assert.ok(poles('4',2.99).moving>1&&poles('4',3.01).moving<1);
assert.ok(Math.abs(poles('5',20/7).moving-1)<1e-12);
assert.ok(poles('5',2.85).moving>1&&poles('5',4).moving<1);
assert.deepEqual(simulate({count:20,seed:7}).closed,simulate({count:20,seed:7}).closed);
console.log(JSON.stringify({status:'passed',samples:run.count,varianceOpen:run.openVariance,varianceMVC:run.closedVariance,theory:[7.25,3.25],checks:'Diophantine identities, expanded denominators, exact MVC noise response, stability boundaries, seed reproducibility'},null,2));
