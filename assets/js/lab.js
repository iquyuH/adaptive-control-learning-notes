'use strict';
(() => {
  if (!document.getElementById('variance-lab')) return;
  const el=id=>document.getElementById(id), math=window.ControlNumerics;
  let latest;
  function linePlot(target,series,{start=0,label='归一化输出 y',height=250}={}){
    const w=800,h=height,p={l:63,r:22,t:25,b:43},n=series[0].data.length;
    const extent=Math.max(.1,...series.flatMap(s=>s.data.map(Math.abs)))*1.12;
    const x=i=>p.l+i/(n-1)*(w-p.l-p.r),y=v=>p.t+(extent-v)/(2*extent)*(h-p.t-p.b);
    let svg=`<title>${label}随采样序号变化</title><text x="14" y="16" font-size="11" fill="#617382">${label}</text>`;
    for(let j=0;j<=4;j++){const v=extent-j*extent/2,yy=y(v);svg+=`<line x1="${p.l}" y1="${yy}" x2="${w-p.r}" y2="${yy}" stroke="#e6edf2"/><text x="${p.l-8}" y="${yy+4}" text-anchor="end" font-size="11" fill="#617382">${v.toFixed(1)}</text>`;}
    for(let j=0;j<=4;j++){const i=Math.round((n-1)*j/4);svg+=`<text x="${x(i)}" y="${h-24}" text-anchor="middle" font-size="11" fill="#617382">${i+start}</text>`;}
    svg+=`<line x1="${p.l}" y1="${y(0)}" x2="${w-p.r}" y2="${y(0)}" stroke="#bac9d4"/><text x="${w/2}" y="${h-4}" text-anchor="middle" font-size="11" fill="#617382">采样序号 k（拍）</text>`;
    for(const s of series)svg+=`<polyline fill="none" stroke="${s.color}" stroke-width="1.6" points="${s.data.map((v,i)=>x(i).toFixed(2)+','+y(v).toFixed(2)).join(' ')}"/>`;
    el(target).innerHTML=svg;
  }
  function run(){
    const sigma=Number(el('noise-sigma').value),count=Number(el('sample-count').value),seed=Number(el('random-seed').value);
    if(!Number.isFinite(sigma)||sigma<.1||sigma>5||!Number.isInteger(seed)||seed<1||seed>2147483647){el('sim-error').textContent='请输入 0.1–5 的噪声标准差，以及 1–2147483647 的整数随机种子。';return;}
    el('sim-error').textContent='';
    latest=math.simulate({sigma,count,seed});
    el('var-open').textContent=(latest.openVariance/sigma**2).toFixed(3);
    el('var-controlled').textContent=(latest.closedVariance/sigma**2).toFixed(3);
    el('variance-reduction').textContent=(100*(1-latest.closedVariance/latest.openVariance)).toFixed(2)+'%';
    const segment=a=>a.slice(latest.burn,latest.burn+180);
    linePlot('output-plot',[{data:segment(latest.open),color:'#9babb9'},{data:segment(latest.closed),color:'#2464a1'}],{start:latest.burn});
    linePlot('input-plot',[{data:segment(latest.u),color:'#24705d'}],{start:latest.burn,label:'归一化控制输入 u',height:230});
    el('simulation-caption').textContent=`来源：第 2 题差分模型数值仿真 · 种子 ${seed} · σ=${sigma} · 统计区间 k=${latest.burn}–${latest.burn+count-1} · N=${count.toLocaleString()} · 曲线区间 k=${latest.burn}–${latest.burn+179}。`;
  }
  function exportCSV(){if(!latest)return;const rows=['k,noise_v,output_open,output_mvc,input_mvc,in_statistics,seed,sigma'];for(let k=0;k<latest.v.length;k++)rows.push([k,latest.v[k],latest.open[k],latest.closed[k],latest.u[k],k>=latest.burn?1:0,latest.seed,latest.sigma].join(','));const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`chapter2-exercise2-seed${latest.seed}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function drawPoles(){
    const r=Number(el('control-weight').value),model=el('pole-model').value, p=math.poles(model,r);
    el('weight-label').textContent=r.toFixed(2);
    const boundary=Math.abs(p.moving-1)<1e-10,stable=p.moving<1-1e-10;
    el('pole-status').textContent=`${stable?'严格稳定':boundary?'稳定边界：不满足严格稳定':'不稳定'} · 可变极点 q=${p.moving.toFixed(5)} · 稳定要求 r>${model==='4'?'3':'20/7 ≈ 2.85714'}。`;
    const cx=225,cy=130,scale=87,px=q=>cx+q*scale;
    let svg=`<title>第${model}题，r=${r}的闭环极点</title><circle cx="${cx}" cy="${cy}" r="${scale}" fill="#f6f9fc" stroke="#9babb9" stroke-dasharray="5 4"/><line x1="85" y1="${cy}" x2="565" y2="${cy}" stroke="#bac9d4"/><line x1="${cx}" y1="20" x2="${cx}" y2="242" stroke="#bac9d4"/><text x="574" y="135" font-size="12" fill="#617382">Re(q)</text><text x="235" y="20" font-size="12" fill="#617382">Im(q)</text><text x="130" y="36" font-size="11" fill="#617382">单位圆 |q|=1</text>`;
    for(const n of [-1,0,1,2,3])svg+=`<text x="${px(n)}" y="151" text-anchor="middle" font-size="11" fill="#617382">${n}</text>`;
    for(const q of p.fixed)svg+=`<circle cx="${px(q)}" cy="${cy}" r="4" fill="#7e8f9d"/>`;
    svg+=`<circle cx="${px(p.moving)}" cy="${cy}" r="6" fill="#2464a1"/><text x="605" y="80" font-size="12" fill="#2464a1">可变极点</text><text x="605" y="105" font-size="19" fill="#2464a1">${p.moving.toFixed(5)}</text><text x="605" y="155" font-size="12" fill="#617382">固定极点</text><text x="605" y="178" font-size="15" fill="#617382">${p.fixed.join('，')}</text><text x="225" y="261" text-anchor="middle" font-size="11" fill="#617382">q 平面（无量纲）</text>`;
    el('pole-plot').innerHTML=svg;
  }
  el('run-sim').addEventListener('click',run);el('download-csv').addEventListener('click',exportCSV);
  el('control-weight').addEventListener('input',drawPoles);el('pole-model').addEventListener('change',drawPoles);
  run();drawPoles();
})();
