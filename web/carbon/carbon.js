const $ = s => document.querySelector(s);
const fmt = (n,d=0) => Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-IN',{maximumFractionDigits:d}) : '—';
const compact = n => n == null || n === '' || !Number.isFinite(Number(n)) ? '—' : new Intl.NumberFormat('en-IN',{notation:'compact',maximumFractionDigits:2}).format(n);
const fuelNames = {coal:'Coal',lignite:'Lignite',gas:'Gas',diesel:'Diesel',naphtha:'Naphtha',oil:'Oil',hydro:'Hydro',nuclear:'Nuclear',solar:'Solar',wind:'Wind',biomass:'Biomass',waste:'Waste',pumped_storage:'Pumped storage'};
let records=[], filtered=[], trendChart, fleetChart;
const fuelColor = {coal:'#a45d37',lignite:'#c58a43',gas:'#5489a6',diesel:'#8b718f',naphtha:'#a58b4b',oil:'#8c705c',hydro:'#4b9a9b',nuclear:'#7a8f54',solar:'#d1a83b',wind:'#6b9c79',biomass:'#8c9c66',waste:'#9a9a9a',pumped_storage:'#7182a6'};
function regression(points, targetYear) {
  if(points.length<2) return null;
  const xs=points.map(p=>p.year), ys=points.map(p=>p.value);
  const mx=xs.reduce((a,b)=>a+b,0)/xs.length, my=ys.reduce((a,b)=>a+b,0)/ys.length;
  const den=xs.reduce((s,x)=>s+(x-mx)**2,0);
  if(!den) return null;
  const slope=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/den;
  return Math.max(0,my+slope*(targetYear-mx));
}
function makeTrend(r) {
  const hist=Object.entries(r.em.co2_hist||{}).map(([year,value])=>({year:Number(year.slice(0,4)),value:Number(value)})).filter(p=>Number.isFinite(p.value)).sort((a,b)=>a.year-b.year);
  const last=hist.at(-1);
  if(!last) { $('#trend-caption').textContent='No historical CO₂ intensity series is available for this station.'; trendChart?.destroy(); return; }
  const forecastYears=[last.year+1,last.year+2,last.year+3,last.year+4];
  const future=forecastYears.map(year=>({year,value:regression(hist,year)}));
  const labels=[...hist.map(p=>String(p.year)),...future.map(p=>String(p.year))];
  const actual=[...hist.map(p=>p.value),...Array(future.length).fill(null)];
  const projected=[...Array(Math.max(0,hist.length-1)).fill(null),last.value,...future.map(p=>p.value)];
  trendChart?.destroy();
  trendChart=new Chart($('#trend-chart'),{type:'line',data:{labels,datasets:[
    {label:'CEA observed intensity',data:actual,borderColor:'#28765e',backgroundColor:'#28765e',pointRadius:3,tension:.25,spanGaps:false},
    {label:'Linear trend projection',data:projected,borderColor:'#c17a37',backgroundColor:'#c17a37',borderDash:[6,5],pointRadius:2,tension:0,spanGaps:false}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:7}},tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmt(c.parsed.y,3)+' tCO₂/MWh'}}},scales:{y:{title:{display:true,text:'tCO₂ / MWh'},beginAtZero:false,grid:{color:'#eeece5'}},x:{grid:{display:false}}}}});
  const projectedEnd=future.at(-1).value;
  $('#trend-caption').textContent=hist.length+' annual observations from '+hist[0].year+' to '+last.year+'. 4-year trend baseline: '+fmt(projectedEnd,3)+' tCO₂/MWh in '+future.at(-1).year+'.';
}
function renderTable() {
  const q=$('#search').value.trim().toLowerCase(), fuel=$('#fuel-filter').value;
  filtered=records.filter(r=>(!fuel||r.plant.type===fuel)&&(!q||(r.plant.name+' '+r.plant.state).toLowerCase().includes(q))).sort((a,b)=>(b.em.co2_t||0)-(a.em.co2_t||0));
  $('#table-summary').textContent=filtered.length+' matching stations · sorted by reported CO₂ baseline';
  $('#station-rows').innerHTML=filtered.slice(0,250).map(r=>{
    const est=r.em.est?.co2_t, intensity=r.em.co2_t_per_mwh, fgd=r.em.fgd||'Not reported';
    return '<tr><td><span class="station">'+r.plant.name+'</span><span class="sub">'+r.plant.sector?.toUpperCase?.()+'</span></td><td>'+r.plant.state+'</td><td><span class="pill">'+(fuelNames[r.plant.type]||r.plant.type)+'</span></td><td>'+fmt(intensity,3)+' <span class="sub">tCO₂/MWh</span></td><td>'+compact(r.em.co2_t)+' <span class="sub">t · '+(r.em.co2_fy||'—')+'</span></td><td>'+compact(est)+' <span class="sub">t/year · estimate</span></td><td><span class="pill '+(/overdue|not installed|no/i.test(fgd)?'warn':'')+'">'+fgd+'</span>'+(r.em.so2_deadline?'<span class="sub">SO₂ deadline '+r.em.so2_deadline+'</span>':'')+'</td></tr>';
  }).join('')||'<tr><td colspan="7">No matching station records.</td></tr>';
}
function selectStation(id) {
  const r=records.find(x=>x.plant.id===id); if(r) makeTrend(r);
}
function render() {
  const baseline=records.reduce((s,r)=>s+(Number(r.em.co2_t)||0),0);
  const weighted=records.reduce((s,r)=>s+(Number(r.em.co2_t_per_mwh)||0)*(Number(r.em.co2_t)||0),0);
  const weight=records.reduce((s,r)=>s+(Number(r.em.co2_t)||0),0);
  const runrate=records.reduce((s,r)=>s+(Number(r.em.est?.co2_t)||0),0);
  $('#total-co2').textContent=compact(baseline)+' t';
  $('#avg-intensity').textContent=fmt(records.length?meanIntensity/records.length:null,3)+' t/MWh';
  $('#station-count').textContent=fmt(records.length);
  $('#runrate-co2').textContent=compact(runrate)+' t';
  const fy=records.map(r=>r.em.co2_fy).filter(Boolean).sort().at(-1)||'CEA baseline';
  $('#co2-period').textContent='Reported baseline · '+fy;
  const years=[...new Set(records.flatMap(r=>Object.keys(r.em.co2_hist||{})))].sort();
  $('#data-meta').textContent='Dataset generated '+(window.EMISSIONS_META?.generated||'unknown date')+' · '+records.length+' station matches · Historical years '+(years[0]||'—')+'–'+(years.at(-1)||'—');
  const sums={}; records.forEach(r=>{const f=r.plant.type;sums[f]=(sums[f]||0)+(Number(r.em.co2_t)||0)});
  const fuelEntries=Object.entries(sums).sort((a,b)=>b[1]-a[1]);
  fleetChart?.destroy();
  fleetChart=new Chart($('#fleet-chart'),{type:'doughnut',data:{labels:fuelEntries.map(([k])=>fuelNames[k]||k),datasets:[{data:fuelEntries.map(([,v])=>v),backgroundColor:fuelEntries.map(([k])=>fuelColor[k]||'#8b918a'),borderWidth:2,borderColor:'#fffefa'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.label+': '+compact(c.raw)+' tCO₂'}}}}});
  $('#fuel-legend').innerHTML=fuelEntries.slice(0,8).map(([k,v])=>'<span><b>'+(fuelNames[k]||k)+'</b>'+compact(v)+' t</span>').join('');
  const fuels=[...new Set(records.map(r=>r.plant.type))].sort();
  $('#fuel-filter').innerHTML='<option value="">All fuels</option>'+fuels.map(f=>'<option value="'+f+'">'+(fuelNames[f]||f)+'</option>').join('');
  const sel=$('#station-select');
  sel.innerHTML=records.slice().sort((a,b)=>a.plant.name.localeCompare(b.plant.name)).map(r=>'<option value="'+r.plant.id+'">'+r.plant.name+' · '+r.plant.state+'</option>').join('');
  const preferred=records.find(r=>r.plant.state==='Tamil Nadu'&&r.em.co2_hist&&Object.keys(r.em.co2_hist).length>1)||records.find(r=>r.em.co2_hist);
  if(preferred){sel.value=preferred.plant.id;makeTrend(preferred)}
  renderTable();
  const links=Object.entries(window.EMISSIONS_META?.sources||{}).filter(([,v])=>typeof v==='string'&&v.startsWith('http')).slice(0,5);
  $('#sources').innerHTML='<strong>Sources:</strong> '+links.map(([k,v])=>'<a href="'+v+'" target="_blank" rel="noopener">'+k.replaceAll('_',' ')+'</a>').join(' · ');
}
async function init(){
  try{
    const [em,atlas]=await Promise.all([fetch('../data/emissions.json').then(r=>{if(!r.ok)throw Error('emissions.json '+r.status);return r.json()}),fetch('../data/plants.json').then(r=>{if(!r.ok)throw Error('plants.json '+r.status);return r.json()})]);
    window.EMISSIONS_META=em.meta;
    records=atlas.plants.map(plant=>({plant,em:em.stations?.[plant.id]})).filter(r=>r.em&&r.em.co2_t_per_mwh!=null&&r.em.co2_t!=null&&Number.isFinite(Number(r.em.co2_t_per_mwh))&&Number.isFinite(Number(r.em.co2_t)));
    render();
  }catch(err){$('#data-meta').textContent='Unable to load emissions datasets: '+err.message;$('#station-rows').innerHTML='<tr><td colspan="7">Data unavailable. Serve the site over HTTP; do not open this file directly.</td></tr>';console.error(err)}
}
$('#station-select').addEventListener('change',e=>selectStation(e.target.value));
$('#search').addEventListener('input',renderTable);
$('#fuel-filter').addEventListener('change',renderTable);
init();