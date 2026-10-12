/* Pure numerical models. Keep separate from DOM rendering for reproducibility. */
(function(root){
  'use strict';
  function randomGenerator(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return(s+0.5)/4294967296;};}
  function variance(a){const mean=a.reduce((x,y)=>x+y,0)/a.length;return a.reduce((v,x)=>v+(x-mean)**2,0)/a.length;}
  function simulate({sigma=1,count=10000,seed=20261012,burn=500}={}){
    if(!Number.isFinite(sigma)||sigma<=0||!Number.isInteger(count)||count<1||!Number.isInteger(seed)||!Number.isInteger(burn)||burn<0)throw Error('Invalid simulation parameters');
    const random=randomGenerator(seed),v=[],open=[],closed=[],u=[];
    const at=(a,k)=>k<0?0:a[k];
    for(let k=0;k<count+burn;k++){
      v[k]=sigma*Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
      open[k]=.8*at(open,k-1)+v[k]+.7*at(v,k-1);
      closed[k]=.8*at(closed,k-1)+at(u,k-2)+.5*at(u,k-3)+v[k]+.7*at(v,k-1);
      u[k]=-1.2*closed[k]-2*at(u,k-1)-.75*at(u,k-2);
      if(!Number.isFinite(u[k]))throw Error('Simulation became non-finite');
    }
    return{v,open,closed,u,burn,count,sigma,seed,openVariance:variance(open.slice(burn)),closedVariance:variance(closed.slice(burn))};
  }
  function poles(model,r){if(!Number.isFinite(r)||r<0)throw Error('Invalid weight');return model==='5'?{fixed:[.3,.2],moving:(3+.3*r)/(1+r),threshold:20/7}:{fixed:[.7],moving:(1.6+.8*r)/(1+r),threshold:3};}
  const api={simulate,variance,poles};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.ControlNumerics=api;
})(typeof window!=='undefined'?window:globalThis);
