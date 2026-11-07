import"./modulepreload-polyfill-P2Xu9kJm.js";import{t as e}from"./theme-5frQzmif.js";import{s as t,t as n}from"./progress-Doaclg-4.js";e();var r=e=>document.getElementById(e),i=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`);function a(){let e=e=>200+520/e,t=(e,t)=>300+e*300/t,n=1.35,i=(n,r,i,a)=>`${t(i,n)},${e(n)} ${t(a,n)},${e(n)} ${t(a,r)},${e(r)} ${t(i,r)},${e(r)}`,a=``;for(let e=0;e<8;e++){let t=-.86+e*.22;a+=`<polygon class="r-paint" points="${i(1.3900000000000001,1.85,t,t+.13)}"/>`}let o=[],s=[];for(let n=0;n<=360;n+=6){let r=n*Math.PI/180,i=5.05/2+Math.cos(r)*.9500000000000002/2;o.push(`${t(Math.sin(r)*.3,i)},${e(i)}`);let a=5.05/2+Math.cos(r)*.9500000000000002*.62/2;s.push(`${t(Math.sin(r)*.15,a)},${e(a)}`)}a+=`<path class="r-paint" fill-rule="evenodd" d="M${o.join(` L`)} Z M${s.reverse().join(` L`)} Z"/>`;for(let e=3.4;e<14;e*=1.16)a+=`<polygon class="r-paint r-dash" points="${i(e,e*1.07,-.012,.012)}"/>`;let c=``,l=0;for(let r=n;r<14;r*=1.11,l++){let n=Math.max(1.2,5.5/r);for(let i of[-1.03,1.03])c+=`<circle class="r-edge" style="--i:${l}" cx="${t(i,r)}" cy="${e(r)}" r="${n}"/>`}for(let n=-8;n<=8;n++)c+=`<circle class="r-thr" cx="${t(n*.125,1.33)}" cy="${e(1.33)}" r="4"/>`;for(let n=0;n<6;n++){let r=.9+n*.075;c+=`<circle class="r-app" cx="300" cy="${e(r)}" r="${6/r}"/>`,c+=`<circle class="r-rabbit" style="--k:${n}" cx="300" cy="${e(r)}" r="${9/r}"/>`;for(let n of[-.18,.18])c+=`<circle class="r-app" cx="${t(n,r)}" cy="${e(r)}" r="${4/r}"/>`}r(`runway`).innerHTML=`
    <svg viewBox="0 0 600 760" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="r-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1a212b"/><stop offset="1" stop-color="#2a323d"/>
        </linearGradient>
      </defs>
      <polygon fill="url(#r-asphalt)" points="${i(n,14,-1,1)}"/>
      ${a}
      ${c}
    </svg>`}var o={a320:{img:`img/a320-main.jpg`,alt:`A320 main panel in cruise: PFD, ND and engine display`,line:`Fly-by-wire airliner. Overhead, FCU, ECAM pages and the MCDU, from cold and dark to a generator fault.`,open:`Open the A320`},b737:{img:`img/b737-main.jpg`,alt:`B737 main panel with the MCP and three large screens`,line:`Large-screen airliner. Overhead, MCP autopilot and the FMC, from cold and dark to LNAV and VNAV.`,open:`Open the B737`},c172:{img:`img/c172-instruments.jpg`,alt:`C172 glass cockpit PFD and MFD`,line:`High-wing trainer with a glass cockpit. Engine start, radios, VOR and ILS, run-up and an alternator failure.`,open:`Open the C172`},pa28:{img:`img/pa28-panel.jpg`,alt:`PA-28 lower panel with the fuel selector and hand primer`,line:`Low-wing trainer. Hand primer, two tanks with no BOTH, run-up and an engine fuel pump failure.`,open:`Open the PA-28`}};function s(){let e=n(),a=[{title:`Airliners`,note:`Two-crew jets on the Delhi to Mumbai route.`,ids:[`a320`,`b737`]},{title:`Light aircraft`,note:`Single-engine trainers, the kind most pilots learn on.`,ids:[`c172`,`pa28`]}];r(`aircraft-groups`).innerHTML=a.map(n=>`
      <div class="w-group">
        <div class="w-group-head"><h3>${n.title}</h3><p>${n.note}</p></div>
        <div class="w-planes">${n.ids.map(n=>{let r=t.find(e=>e.id===n),a=o[n],s=r.lessons.filter(t=>e[t.id]?.finished).length,c=r.lessons.reduce((e,t)=>e+t.minutes,0);return`
            <article class="w-plane">
              <a class="w-shot" href="${r.page}" tabindex="-1" aria-hidden="true"><img src="${a.img}" alt="${i(a.alt)}" loading="lazy" width="880" height="588"></a>
              <div class="w-plane-body">
                <h4>${i(r.name)}</h4>
                <p>${i(a.line)}</p>
                <p class="w-meta">${r.lessons.length} lessons, about ${Math.round(c/5)*5} minutes in all${s?`. You have finished ${s}.`:``}</p>
                <a class="w-btn w-btn-main" href="${r.page}">${a.open}</a>
              </div>
            </article>`}).join(``)}</div>
      </div>`).join(``)}var c=[{who:`Just want to fly`,why:`Take the controls with the keyboard and the view out of the window. Taxi out, take off, fly a circuit and land.`,steps:[[`c172`,`c172-ff-takeoff`],[`c172`,`c172-ff-circuit`],[`c172`,`c172-ff-landing`]]},{who:`New to flying`,why:`Start small. A light aircraft has fewer switches, and each one does something you can see.`,steps:[[`c172`,`c172-start`],[`c172`,`c172-pfd`],[`c172`,`c172-runup`]]},{who:`Learning to fly`,why:`Practise the parts that take time in the air: the radio calls, VOR and ILS, and handling a failure.`,steps:[[`c172`,`c172-radios`],[`c172`,`c172-nav`],[`pa28`,`pa28-pumpfail`]]},{who:`Aiming for the airlines`,why:`Learn an airliner flow by flow, the way it is taught in type training, from cold and dark.`,steps:[[`a320`,`powerup`],[`a320`,`mcdu`],[`a320`,`beforestart`]]}];function l(){r(`paths`).innerHTML=c.map(e=>{let n=e.steps.map(([e,n])=>{let r=t.find(t=>t.id===e);return{a:r,l:r.lessons.find(e=>e.id===n),href:`${r.page}?lesson=${n}`}});return`
      <div class="w-path">
        <h3>${i(e.who)}</h3>
        <p>${i(e.why)}</p>
        <ol>${n.map(e=>`<li><a href="${e.href}"><span>${i(e.l.title)}</span><small>${i(e.a.name)}, about ${e.l.minutes} min</small></a></li>`).join(``)}</ol>
        <a class="w-btn w-btn-quiet" href="${n[0].href}">Start this path</a>
      </div>`}).join(``)}a(),s(),l();