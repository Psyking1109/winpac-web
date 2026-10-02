import { rng } from "./util";
// Simple product drawings, used until a photo is uploaded.
export function art(shape, swatch, seed){
  var A="var(--art-a)", B="var(--art-b)", C="var(--art-c)", D="var(--art-d)";
  var s = '<svg viewBox="0 0 200 150" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
  var r = rng(seed||7), i;
  switch(shape){
    case "frankfurt":
      s += '<path d="M40 104 70 60h60l30 44z" fill="'+B+'"/><path d="M40 104h120v14H40z" fill="'+A+'"/><path d="M70 60h60l-4-10H74z" fill="'+A+'" opacity=".55"/>';
      for (i=0;i<5;i++) s += '<path d="M'+(58+i*18)+' 104 '+(76+i*10)+' 62" stroke="'+D+'" stroke-width="3" opacity=".55"/>';
      break;
    case "fickert":
      s += '<path d="M30 100c0-26 16-40 40-40h60c24 0 40 14 40 40z" fill="'+B+'"/><rect x="30" y="100" width="140" height="16" fill="'+A+'"/>';
      for (i=0;i<6;i++) s += '<path d="M'+(50+i*20)+' 100v-34" stroke="'+D+'" stroke-width="3" opacity=".5"/>';
      break;
    case "pad":
      s += '<circle cx="100" cy="75" r="56" fill="'+A+'"/><circle cx="100" cy="75" r="56" fill="none" stroke="'+B+'" stroke-width="5"/>';
      for (i=0;i<8;i++){ var a=i*Math.PI/4; s += '<circle cx="'+(100+34*Math.cos(a)).toFixed(1)+'" cy="'+(75+34*Math.sin(a)).toFixed(1)+'" r="8" fill="'+B+'"/>'; }
      s += '<circle cx="100" cy="75" r="11" fill="'+D+'"/>';
      break;
    case "disc":
      s += '<circle cx="100" cy="75" r="58" fill="'+C+'" stroke="'+A+'" stroke-width="4"/>';
      for (i=0;i<6;i++){ var b=i*Math.PI/3; s += '<rect x="-12" y="-6" width="24" height="12" rx="2" fill="'+B+'" transform="translate('+(100+40*Math.cos(b)).toFixed(1)+' '+(75+40*Math.sin(b)).toFixed(1)+') rotate('+(b*180/Math.PI+90).toFixed(0)+')"/>'; }
      s += '<circle cx="100" cy="75" r="12" fill="'+A+'"/>';
      break;
    case "wheel":
      s += '<circle cx="100" cy="75" r="58" fill="'+A+'"/><circle cx="100" cy="75" r="46" fill="'+C+'"/>';
      for (i=0;i<16;i++){ var c=i*Math.PI/8; s += '<path d="M'+(100+48*Math.cos(c)).toFixed(1)+' '+(75+48*Math.sin(c)).toFixed(1)+'L'+(100+58*Math.cos(c)).toFixed(1)+' '+(75+58*Math.sin(c)).toFixed(1)+'" stroke="'+D+'" stroke-width="3"/>'; }
      s += '<circle cx="100" cy="75" r="14" fill="'+B+'"/>';
      break;
    case "block":
      s += '<path d="M40 70 70 50h90l-30 20z" fill="'+B+'" opacity=".7"/><path d="M40 70h90v50H40z" fill="'+B+'"/><path d="M130 70l30-20v50l-30 20z" fill="'+A+'"/>';
      for (i=0;i<40;i++) s += '<circle cx="'+(46+r()*80).toFixed(1)+'" cy="'+(76+r()*40).toFixed(1)+'" r="1.4" fill="'+D+'" opacity=".6"/>';
      break;
    case "sheet":
      s += '<rect x="44" y="34" width="84" height="94" rx="3" fill="'+B+'" transform="rotate(-8 86 81)"/><rect x="72" y="30" width="84" height="94" rx="3" fill="'+A+'" transform="rotate(6 114 77)"/>';
      for (i=0;i<60;i++) s += '<circle cx="'+(80+r()*70).toFixed(1)+'" cy="'+(38+r()*80).toFixed(1)+'" r="1.2" fill="'+D+'" opacity=".55"/>';
      break;
    case "machine":
      s += '<path d="M120 20 96 78" stroke="'+A+'" stroke-width="7" stroke-linecap="round"/><path d="M108 16h24" stroke="'+A+'" stroke-width="7" stroke-linecap="round"/><rect x="58" y="74" width="84" height="34" rx="8" fill="'+A+'"/><rect x="48" y="104" width="104" height="14" rx="3" fill="'+B+'"/><circle cx="150" cy="110" r="9" fill="'+D+'" stroke="'+A+'" stroke-width="4"/><rect x="70" y="82" width="30" height="8" rx="2" fill="'+B+'"/>';
      break;
    case "vacuum":
      s += '<rect x="62" y="44" width="64" height="72" rx="12" fill="'+A+'"/><rect x="58" y="36" width="72" height="16" rx="6" fill="'+B+'"/><path d="M126 60c30 0 36 20 30 50" stroke="'+B+'" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="72" cy="120" r="6" fill="'+B+'"/><circle cx="116" cy="120" r="6" fill="'+B+'"/>';
      break;
    case "sander":
      s += '<path d="M50 98h100l-8-22H58z" fill="'+A+'"/><rect x="46" y="98" width="108" height="12" rx="2" fill="'+B+'"/><path d="M78 76c0-22 44-22 44 0" stroke="'+A+'" stroke-width="10" fill="none" stroke-linecap="round"/>';
      break;
    case "tub":
      s += '<path d="M58 60h84l-8 58H66z" fill="'+A+'"/><rect x="52" y="48" width="96" height="16" rx="4" fill="'+B+'"/><rect x="72" y="78" width="56" height="22" rx="2" fill="'+D+'"/><path d="M80 89h40" stroke="'+B+'" stroke-width="3"/>';
      break;
    case "can":
      s += '<path d="M62 44h58l18 14v64H62z" fill="'+A+'"/><rect x="72" y="30" width="22" height="16" rx="3" fill="'+B+'"/><path d="M104 44v-8h24v14" stroke="'+B+'" stroke-width="6" fill="none"/><rect x="74" y="70" width="52" height="34" rx="2" fill="'+D+'"/><path d="M82 82h36M82 92h24" stroke="'+B+'" stroke-width="3"/>';
      break;
    case "chips":
      var sw = (swatch && swatch.length) ? swatch : ["#EDE9DF","#CFC9BA","#FFFFFF","#A9A393"];
      s += '<rect width="200" height="150" fill="'+sw[sw.length-1]+'" opacity=".25"/>';
      for (i=0;i<140;i++){ var x=r()*200, y=r()*150, k=6+r()*14, pts=[]; for (var j=0;j<5;j++){ var t=j/5*Math.PI*2 + r()*.6; pts.push((x+Math.cos(t)*k*(.6+r()*.5)).toFixed(1)+","+(y+Math.sin(t)*k*(.6+r()*.5)).toFixed(1)); } s += '<polygon points="'+pts.join(" ")+'" fill="'+sw[Math.floor(r()*sw.length)]+'" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>'; }
      break;
    case "pebbles":
      var pw = (swatch && swatch.length) ? swatch : ["#8D8A83","#5E5B55","#B3AFA6"];
      for (i=0;i<46;i++){ var px=r()*200, py=r()*150, rx=8+r()*12, ry=rx*(.55+r()*.3); s += '<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+rx.toFixed(1)+'" ry="'+ry.toFixed(1)+'" fill="'+pw[Math.floor(r()*pw.length)]+'" transform="rotate('+(r()*180).toFixed(0)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/><ellipse cx="'+(px-rx*.3).toFixed(1)+'" cy="'+(py-ry*.35).toFixed(1)+'" rx="'+(rx*.35).toFixed(1)+'" ry="'+(ry*.2).toFixed(1)+'" fill="#fff" opacity=".25"/>'; }
      break;
    default: /* bottle */
      s += '<rect x="80" y="26" width="28" height="14" rx="3" fill="'+B+'"/><path d="M84 40h20v10c14 4 20 12 20 24v46a6 6 0 0 1-6 6H70a6 6 0 0 1-6-6V74c0-12 6-20 20-24z" fill="'+A+'"/><rect x="72" y="78" width="44" height="30" rx="2" fill="'+D+'"/><path d="M79 88h30M79 97h20" stroke="'+B+'" stroke-width="3"/>';
  }
  return s + '</svg>';
}
