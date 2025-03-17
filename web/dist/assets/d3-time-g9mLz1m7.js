import{f as R,t as O}from"./d3-array-g_qRI3rN.js";const H=new Date,w=new Date;function o(e,n,u,y){function s(t){return e(t=arguments.length===0?new Date:new Date(+t)),t}return s.floor=t=>(e(t=new Date(+t)),t),s.ceil=t=>(e(t=new Date(t-1)),n(t,1),e(t),t),s.round=t=>{const r=s(t),i=s.ceil(t);return t-r<i-t?r:i},s.offset=(t,r)=>(n(t=new Date(+t),r==null?1:Math.floor(r)),t),s.range=(t,r,i)=>{const D=[];if(t=s.ceil(t),i=i==null?1:Math.floor(i),!(t<r)||!(i>0))return D;let l;do D.push(l=new Date(+t)),n(t,i),e(t);while(l<t&&t<r);return D},s.filter=t=>o(r=>{if(r>=r)for(;e(r),!t(r);)r.setTime(r-1)},(r,i)=>{if(r>=r)if(i<0)for(;++i<=0;)for(;n(r,-1),!t(r););else for(;--i>=0;)for(;n(r,1),!t(r););}),u&&(s.count=(t,r)=>(H.setTime(+t),w.setTime(+r),e(H),e(w),Math.floor(u(H,w))),s.every=t=>(t=Math.floor(t),!isFinite(t)||!(t>0)?null:t>1?s.filter(y?r=>y(r)%t===0:r=>s.count(0,r)%t===0):s)),s}const v=o(()=>{},(e,n)=>{e.setTime(+e+n)},(e,n)=>n-e);v.every=e=>(e=Math.floor(e),!isFinite(e)||!(e>0)?null:e>1?o(n=>{n.setTime(Math.floor(n/e)*e)},(n,u)=>{n.setTime(+n+u*e)},(n,u)=>(u-n)/e):v);v.range;const T=1e3,c=T*60,M=c*60,C=M*24,I=C*7,b=C*30,S=C*365,F=o(e=>{e.setTime(e-e.getMilliseconds())},(e,n)=>{e.setTime(+e+n*T)},(e,n)=>(n-e)/T,e=>e.getUTCSeconds());F.range;const x=o(e=>{e.setTime(e-e.getMilliseconds()-e.getSeconds()*T)},(e,n)=>{e.setTime(+e+n*c)},(e,n)=>(n-e)/c,e=>e.getMinutes());x.range;const j=o(e=>{e.setUTCSeconds(0,0)},(e,n)=>{e.setTime(+e+n*c)},(e,n)=>(n-e)/c,e=>e.getUTCMinutes());j.range;const q=o(e=>{e.setTime(e-e.getMilliseconds()-e.getSeconds()*T-e.getMinutes()*c)},(e,n)=>{e.setTime(+e+n*M)},(e,n)=>(n-e)/M,e=>e.getHours());q.range;const A=o(e=>{e.setUTCMinutes(0,0,0)},(e,n)=>{e.setTime(+e+n*M)},(e,n)=>(n-e)/M,e=>e.getUTCHours());A.range;const B=o(e=>e.setHours(0,0,0,0),(e,n)=>e.setDate(e.getDate()+n),(e,n)=>(n-e-(n.getTimezoneOffset()-e.getTimezoneOffset())*c)/C,e=>e.getDate()-1);B.range;const V=o(e=>{e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCDate(e.getUTCDate()+n)},(e,n)=>(n-e)/C,e=>e.getUTCDate()-1);V.range;const E=o(e=>{e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCDate(e.getUTCDate()+n)},(e,n)=>(n-e)/C,e=>Math.floor(e/C));E.range;function h(e){return o(n=>{n.setDate(n.getDate()-(n.getDay()+7-e)%7),n.setHours(0,0,0,0)},(n,u)=>{n.setDate(n.getDate()+u*7)},(n,u)=>(u-n-(u.getTimezoneOffset()-n.getTimezoneOffset())*c)/I)}const G=h(0),X=h(1),Z=h(2),_=h(3),$=h(4),k=h(5),p=h(6);G.range;X.range;Z.range;_.range;$.range;k.range;p.range;function m(e){return o(n=>{n.setUTCDate(n.getUTCDate()-(n.getUTCDay()+7-e)%7),n.setUTCHours(0,0,0,0)},(n,u)=>{n.setUTCDate(n.getUTCDate()+u*7)},(n,u)=>(u-n)/I)}const J=m(0),d=m(1),ee=m(2),ne=m(3),te=m(4),re=m(5),ue=m(6);J.range;d.range;ee.range;ne.range;te.range;re.range;ue.range;const K=o(e=>{e.setDate(1),e.setHours(0,0,0,0)},(e,n)=>{e.setMonth(e.getMonth()+n)},(e,n)=>n.getMonth()-e.getMonth()+(n.getFullYear()-e.getFullYear())*12,e=>e.getMonth());K.range;const L=o(e=>{e.setUTCDate(1),e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCMonth(e.getUTCMonth()+n)},(e,n)=>n.getUTCMonth()-e.getUTCMonth()+(n.getUTCFullYear()-e.getUTCFullYear())*12,e=>e.getUTCMonth());L.range;const W=o(e=>{e.setMonth(0,1),e.setHours(0,0,0,0)},(e,n)=>{e.setFullYear(e.getFullYear()+n)},(e,n)=>n.getFullYear()-e.getFullYear(),e=>e.getFullYear());W.every=e=>!isFinite(e=Math.floor(e))||!(e>0)?null:o(n=>{n.setFullYear(Math.floor(n.getFullYear()/e)*e),n.setMonth(0,1),n.setHours(0,0,0,0)},(n,u)=>{n.setFullYear(n.getFullYear()+u*e)});W.range;const z=o(e=>{e.setUTCMonth(0,1),e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCFullYear(e.getUTCFullYear()+n)},(e,n)=>n.getUTCFullYear()-e.getUTCFullYear(),e=>e.getUTCFullYear());z.every=e=>!isFinite(e=Math.floor(e))||!(e>0)?null:o(n=>{n.setUTCFullYear(Math.floor(n.getUTCFullYear()/e)*e),n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)},(n,u)=>{n.setUTCFullYear(n.getUTCFullYear()+u*e)});z.range;function N(e,n,u,y,s,t){const r=[[F,1,T],[F,5,5*T],[F,15,15*T],[F,30,30*T],[t,1,c],[t,5,5*c],[t,15,15*c],[t,30,30*c],[s,1,M],[s,3,3*M],[s,6,6*M],[s,12,12*M],[y,1,C],[y,2,2*C],[u,1,I],[n,1,b],[n,3,3*b],[e,1,S]];function i(l,g,U){const f=g<l;f&&([l,g]=[g,l]);const a=U&&typeof U.range=="function"?U:D(l,g,U),Y=a?a.range(l,+g+1):[];return f?Y.reverse():Y}function D(l,g,U){const f=Math.abs(g-l)/U,a=R(([,,Q])=>Q).right(r,f);if(a===r.length)return e.every(O(l/S,g/S,U));if(a===0)return v.every(Math.max(O(l,g,U),1));const[Y,P]=r[f/r[a-1][2]<r[a][2]/f?a-1:a];return Y.every(P)}return[i,D]}const[oe,ie]=N(z,L,J,E,A,j),[le,ce]=N(W,K,G,B,q,x);export{q as a,B as b,G as c,K as d,W as e,ce as f,le as g,A as h,V as i,J as j,L as k,z as l,ie as m,oe as n,d as o,X as p,te as q,$ as r,F as s,x as t,j as u};
