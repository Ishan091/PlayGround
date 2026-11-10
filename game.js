import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const $=s=>document.querySelector(s), gameEl=$('#game');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x121e2a); scene.fog=new THREE.FogExp2(0x121e2a,.0065);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.16; gameEl.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9bb7d1,0x293526,1.35));
const moon=new THREE.DirectionalLight(0x9ebce0,2.1); moon.position.set(-38,62,-25); moon.castShadow=true; moon.shadow.mapSize.set(2048,2048); moon.shadow.camera.left=-100; moon.shadow.camera.right=100; moon.shadow.camera.top=100; moon.shadow.camera.bottom=-100; moon.shadow.bias=-.0002; scene.add(moon);
const warm=new THREE.PointLight(0xf19a49,45,95,2); warm.position.set(12,13,22); scene.add(warm);
const materials={}; const mat=(color,rough=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness:rough,...extra});
const M={ground:mat(0x293238),tileA:mat(0x41494a),tileB:mat(0x354044),road:mat(0x202c32),line:mat(0x9e8d6e),wood:mat(0x604735),darkWood:mat(0x382f2a),roof:mat(0x394751),wall:mat(0x988c75),cream:mat(0xd5c4a0),red:mat(0x9a4438),lantern:mat(0xffa54a,.4,{emissive:0xff7a19,emissiveIntensity:2.1}),gold:mat(0xd9aa68,.48),leaf:mat(0x344c3e),leaf2:mat(0x52654a),stone:mat(0x727870),water:mat(0x253f4c,.32,{metalness:.18}),playerTop:mat(0xd0d5cf),playerDark:mat(0x293b4a),skin:mat(0xb77c5d),enemyRed:mat(0xa65243),enemyBlue:mat(0x526d7b),enemyYellow:mat(0xb68b4c),black:mat(0x252a2c)};
function box(parent,x,y,z,w,h,d,material,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function cyl(parent,x,y,z,rt,rb,h,material,seg=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function sphere(parent,x,y,z,r,material,seg=9){const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,7),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function plane(x,z,w,d,material,y=.01){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);return o}
const worldFloor=new THREE.Mesh(new THREE.PlaneGeometry(230,230),M.ground);worldFloor.rotation.x=-Math.PI/2;worldFloor.position.y=-.09;worldFloor.receiveShadow=true;scene.add(worldFloor);
// Streets, courtyards, and walkable open-world zones.
plane(0,0,11,190,M.road,.005); plane(0,0,190,11,M.road,.006); plane(-48,0,8,190,M.road,.007); plane(48,0,8,190,M.road,.007);
plane(0,-47,190,8,M.road,.008); plane(0,48,190,8,M.road,.009);
// Stone promenade and tiled plaza.
for(let x=-84;x<85;x+=4)for(let z=-84;z<85;z+=4){if(Math.abs(x)<6||Math.abs(z)<6||Math.abs(x-48)<5||Math.abs(x+48)<5||Math.abs(z-48)<5||Math.abs(z+47)<5)continue;
 const plaza=(z<-15&&Math.abs(x)<39)||(z>14&&Math.abs(x)<39);if(!plaza)continue;
 const tile=new THREE.Mesh(new THREE.BoxGeometry(3.92,.1,3.92),((Math.floor(x/4)+Math.floor(z/4))&1)?M.tileA:M.tileB);tile.position.set(x,-.025,z);tile.receiveShadow=true;scene.add(tile);
}
// Drain lines and painted street markings.
for(let n=-88;n<90;n+=8){box(scene,n,.018,0,.12,.02,3,M.line,false);box(scene,0,.018,n,3,.02,.12,M.line,false);}
// Narrow canal at the eastern edge, plus stepping bridges.
plane(87,0,10,190,M.water,-.04); for(const z of [-55,0,52]){box(scene,80,.11,z,12,.25,7,M.cream);for(let i=-1;i<=1;i++)box(scene,80,.25,z+i*2,12,.12,.14,M.wood);}
for(let z=-82;z<=82;z+=7){cyl(scene,82,.35,z,.12,.17,.7,M.stone,7);sphere(scene,82,.78,z,.21,M.lantern,8);}
// World boundaries as gardens and traditional low walls.
for(let x=-92;x<=92;x+=4){box(scene,x,.42,-92,3.8,.85,1.2,M.stone);box(scene,x,.42,92,3.8,.85,1.2,M.stone);}
for(let z=-88;z<=88;z+=4){box(scene,-92,.42,z,1.2,.85,3.8,M.stone);if(z< -8||z>9)box(scene,92,.42,z,1.2,.85,3.8,M.stone);}
const hazards=[];
function makeCrate(x,z,size=1.4){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const body=box(g,0,size*.42,0,size,size*.84,size,M.wood);for(const s of [-1,1]){const beam=box(g,s*size*.34,size*.43,0,.1,size*.9,size+.04,M.gold);beam.rotation.z=s*.62;const beam2=box(g,0,size*.43,s*size*.34,size+.04,size*.9,.1,M.gold);beam2.rotation.x=s*.62;}hazards.push({x,z,r:size*.78,hp:1,group:g,kind:'crate'});return g}
function makeBarrel(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cyl(g,0,.65,0,.55,.48,1.3,M.wood,10);for(const y of [.25,1.05])cyl(g,0,y,0,.56,.56,.1,M.gold,10);hazards.push({x,z,r:.85,hp:1,group:g,kind:'barrel'});return g}
function makeLantern(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cyl(g,0,1.4,0,.1,.15,2.8,M.darkWood,7);box(g,0,2.25,0,.67,.68,.67,M.lantern);for(const s of [-1,1])box(g,s*.39,2.25,0,.08,.8,.82,M.darkWood);const roof=cyl(g,0,2.74,0,.59,.22,.18,M.red,8);roof.rotation.y=Math.PI/8;box(g,0,3.22,0,.08,.75,.08,M.darkWood);sphere(g,0,3.62,0,.12,M.gold);const glow=new THREE.PointLight(0xff9a47,9,10,2);glow.position.set(0,2.25,0);g.add(glow);hazards.push({x,z,r:.8,hp:2,group:g,kind:'lantern'});return g}
function lanternString(x1,z1,x2,z2,count=6){for(let i=0;i<count;i++){const t=i/(count-1),x=THREE.MathUtils.lerp(x1,x2,t),z=THREE.MathUtils.lerp(z1,z2,t);const y=6-Math.sin(t*Math.PI)*1.1;const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);sphere(g,0,0,0,.08,M.darkWood,6);box(g,0,-.45,0,.42,.55,.42,M.lantern);box(g,0,-.45,.24,.05,.62,.03,M.darkWood);}}
function tree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);cyl(g,0,1.35,0,.35,.52,2.7,M.wood,7);for(let i=0;i<5;i++){const y=2.1+i*.36, r=1.65-i*.18;const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),i%2?M.leaf:M.leaf2);crown.position.set(Math.sin(i*3)*.35,y,Math.cos(i*2.4)*.3);crown.castShadow=true;g.add(crown);}const lamp=new THREE.PointLight(0xffa74d,5,8,2);lamp.position.set(.5,2.2,.5);g.add(lamp);return g;}
const solids=[];
function building(x,z,w,d,h,wall,roof=M.roof){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);solids.push({x,z,hw:w/2+.5,hd:d/2+.5});box(g,0,h/2,0,w,h,d,wall);box(g,0,h+.25,0,w+1,.5,d+1,roof);for(let i=-w/2+1;i<w/2;i+=2.6){box(g,i,h*.55,d/2+.03,.8,1.65,.08,M.darkWood);box(g,i,h*.55,-d/2-.03,.8,1.65,.08,M.darkWood);}for(let side of [-1,1])for(let i=-d/2+2;i<d/2;i+=3){box(g,side*(w/2+.02),h*.55,i,.08,1.6,.8,M.darkWood);}for(const sx of [-1,1]){const e=box(g,sx*(w/2+.1),h+.67,0,1.8,.18,d+.9,M.red);e.rotation.z=sx*.06;}return g;}
function stall(x,z,color=0x9c5145){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);solids.push({x,z,hw:1.75,hd:1});for(const dx of [-1.4,1.4]){box(g,dx,1.25,0,.15,2.5,.15,M.wood);box(g,dx,2.4,0,.19,.16,.19,M.gold);}box(g,0,1.05,0,3.2,1.3,1.6,M.darkWood);box(g,0,2.3,0,3.8,.2,2.1,mat(color));for(let i=-1;i<=1;i++)box(g,i*1.1,1.1,.84,.12,1.35,.1,M.gold);return g;}
// Neighborhood landmarks: dojo, tea house, gate, market, gardens.
building(-27,-58,22,18,8,M.wall);building(24,-58,23,17,7,mat(0x817963));building(-26,61,24,17,7,mat(0x7d7664));building(25,61,24,18,8,mat(0xa49377));
building(-67,-30,18,22,9,mat(0x806f5d));building(68,-29,18,23,10,mat(0x8c7661));building(-68,31,18,22,8,mat(0x948367));
// Pagoda roofs and dojo front steps.
for(let level=0;level<3;level++){const y=1.8+level*2.1,w=13-level*2,d=10-level*1.5;const roof=new THREE.Mesh(new THREE.CylinderGeometry(w*.68,w*.78,.55,4,1),M.red);roof.rotation.y=Math.PI/4;roof.scale.z=d/w;roof.position.set(0,y,-57);roof.castShadow=true;scene.add(roof);cyl(scene,0,y+1.15, -57,.16,.2,1.9,M.gold,8);}
for(let z=-19;z< -9;z+=3){box(scene,-17,.3,z,16,.6,.35,M.wood);box(scene,17,.3,z,16,.6,.35,M.wood);}
// Torii-style gate on the north promenade.
for(const x of [-12,12]){cyl(scene,x,3,-15,.36,.46,6,M.red,8);box(scene,x,5.9,-15,.62,.55,.62,M.gold);}
box(scene,0,6.2,-15,29,.55,1.3,M.red);box(scene,0,7,-15,34,.5,1.7,M.darkWood);box(scene,0,7.3,-15,31,.18,1.5,M.gold);
// Market canopy and warm lanterns.
for(const x of [-11,-5,5,11]){stall(x,27,x<0?0x9b5146:0x557268);makeLantern(x,22);}
lanternString(-14,21,14,21,8);lanternString(-14,32,14,32,8);
// Garden groves, stepping stones and small ponds.
for(const [x,z,s] of [[-30,-26,1.25],[-22,-32,.9],[23,-27,1.1],[31,-34,1.2],[-29,36,1.1],[29,37,1.25],[-39,4,.85],[38,4,1]])tree(x,z,s);
for(let i=0;i<9;i++){const x=-18+i*4.5;const stone=new THREE.Mesh(new THREE.CylinderGeometry(1.05,.95,.22,7),M.stone);stone.position.set(x,.04,4+Math.sin(i*1.1)*1.3);stone.receiveShadow=true;scene.add(stone);}
plane(-31,-3,14,10,M.water,.015);plane(31,9,12,8,M.water,.018);
for(const [x,z] of [[-18,24],[18,24],[-40,-12],[41,-12],[-40,51],[39,50],[55,13],[-55,11]])makeCrate(x,z,1.45);
for(const [x,z] of [[-15,17],[15,17],[-39,8],[40,11],[-53,8],[53,12],[-18,-9],[19,-9]])makeBarrel(x,z);
for(const [x,z] of [[-21,17],[21,17],[-43,-10],[43,-8],[-44,51],[45,52],[-9,-12],[9,-12]])makeLantern(x,z);
// Decorative low hedges to frame paths without sealing the routes.
for(const z of [-38,38])for(let x=-18;x<=18;x+=3.1){if(Math.abs(x)>8){box(scene,x,.55,z,2.5,1,1.1,M.leaf2);}}
for(const x of [-40,40])for(let z=-8;z<=8;z+=3)box(scene,x,.45,z,1,0.8,2.2,M.leaf);

function makeFighter(isPlayer=false,uniform=M.enemyRed){
 const root=new THREE.Group(), rig={root,limbs:[],isPlayer}; scene.add(root);
 const gi=isPlayer?M.playerTop:uniform, pants=isPlayer?M.playerDark:mat(0x343b40), skin=M.skin;rig.uniform=uniform;
 sphere(root,0,.13,0,.34,M.black,8);
 const torso=box(root,0,1.27,0,.84,.86,.48,gi);torso.rotation.z=-.035;
 box(root,0,1.01,.26,.88,.15,.12,isPlayer?M.red:M.gold);
 box(root,1.5,0,0,.01,.01,.01,M.black,false);
 const head=sphere(root,0,2.05,0,.35,skin,10);head.scale.set(.84,1.03,.82);
 sphere(root,0,2.17,-.015,.36,isPlayer?M.playerDark:uniform,9).scale.set(1,.34,.92);
 box(root,0,1.68,0,.53,.12,.55,isPlayer?M.red:M.darkWood);
 const leftLeg=new THREE.Group();leftLeg.position.set(-.23,.86,0);root.add(leftLeg);cyl(leftLeg,0,-.39,0,.18,.24,.8,pants,7);sphere(leftLeg,0,-.78,.11,.21,M.black,7);rig.limbs.push({part:leftLeg,type:'leg',side:-1});
 const rightLeg=new THREE.Group();rightLeg.position.set(.23,.86,0);root.add(rightLeg);cyl(rightLeg,0,-.39,0,.18,.24,.8,pants,7);sphere(rightLeg,0,-.78,.11,.21,M.black,7);rig.limbs.push({part:rightLeg,type:'leg',side:1});
 for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.47,1.62,0);root.add(arm);cyl(arm,0,-.34,0,.16,.2,.72,gi,7);sphere(arm,0,-.72,.05,.19,skin,7);rig.limbs.push({part:arm,type:'arm',side});}
 const healthGroup=new THREE.Group();healthGroup.position.y=2.65;root.add(healthGroup);box(healthGroup,0,0,0,.9,.09,.08,mat(0x161b1f),false);const fill=box(healthGroup,0,.005,.05,.86,.045,.02,mat(0xe47761),false);rig.healthFill=fill;rig.healthGroup=healthGroup;
 rig.body=torso; rig.alive=true; rig.hitFlash=0;rig.anim=0;rig.stun=0;rig.knock=new THREE.Vector3();return rig;
}
const player=makeFighter(true);player.root.position.set(0,0,28);player.hp=100;player.focus=100;player.speed=0;player.attackTime=0;player.dashTime=0;player.grabbed=null;player.attackAnim=0;
const enemySpots=[[-10,9],[10,9],[-30,14],[30,14],[-13,-28],[14,-32],[-56,6],[59,-7]];
const uniforms=[M.enemyRed,M.enemyBlue,M.enemyYellow,M.enemyRed,M.enemyBlue,M.enemyYellow,M.enemyRed,M.enemyBlue];
const enemies=enemySpots.map(([x,z],i)=>{const a=makeFighter(false,uniforms[i]);a.root.position.set(x,0,z);a.hp=100;a.maxHp=100;a.speed=0;a.attackClock=1.2+i*.23;a.alive=true;a.id=i;return a;});
const keys=new Set(), touchMove={up:false,down:false,left:false,right:false};let started=false,paused=false,gameFinished=false, cameraYaw=0,cameraPitch=.27,cameraDistance=8.2, toastTimer=0, gameTime=0, score=0, targetEnemy=null;
const scratch=new THREE.Vector3(), moveVec=new THREE.Vector3(), rightVec=new THREE.Vector3();
function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');toastTimer=2.15;}
function updateHud(){const hp=Math.max(0,Math.ceil(player.hp)),focus=Math.round(player.focus);$('#hp-text').textContent=hp;$('#focus-text').textContent=focus;$('#hp-bar').style.width=hp+'%';$('#focus-bar').style.width=focus+'%';$('#score-count').textContent=score;const remains=enemies.filter(e=>e.alive).length;$('#objective-text').textContent=remains?`${remains} challenger${remains===1?'':'s'} still standing`:'The district is yours';if(score>=8&&!gameFinished){gameFinished=true;$('#result-screen').classList.remove('hidden');}}
function nearestEnemy(max=3.6,front=true){let found=null,best=max;const p=player.root.position;const forward=new THREE.Vector3(-Math.sin(player.root.rotation.y),0,-Math.cos(player.root.rotation.y));for(const e of enemies){if(!e.alive||e.carried)continue;const d=scratch.set(e.root.position.x-p.x,0,e.root.position.z-p.z).length();if(d>best)continue;if(front){const dir=scratch.set(e.root.position.x-p.x,0,e.root.position.z-p.z).normalize();if(forward.dot(dir)<-.1)continue;}found=e;best=d;}return found;}
function knockOut(e){if(!e.alive)return;e.alive=false;e.carried=false;e.root.rotation.z=Math.PI/2;e.root.position.y=.2;e.healthGroup.visible=false;e.speed=0;e.knock.set(0,0,0);score++;showToast('CHALLENGER DOWN  ·  +1 RESPECT');updateHud();}
function damageEnemy(e,amount,push=0,source=null){if(!e.alive)return;e.hp-=amount;e.stun=.38;e.healthFill.scale.x=Math.max(.02,e.hp/e.maxHp);e.healthFill.position.x=-(.86*(1-e.hp/e.maxHp))/2;e.knock.set(e.root.position.x-player.root.position.x,0,e.root.position.z-player.root.position.z).normalize().multiplyScalar(push);e.hitFlash=.13;
 if(source==='environment'){e.hp-=24;e.stun=.8;showToast('ENVIRONMENTAL IMPACT  ·  BONUS DAMAGE');}
 if(e.hp<=0)knockOut(e);
}
function makeBurst(x,y,z,color=0xffd08a,count=12){const c=new THREE.Color(color);for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.07+Math.random()*.06,0),new THREE.MeshBasicMaterial({color:c,transparent:true}));m.position.set(x,y,z);scene.add(m);particles.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5),life:.55+Math.random()*.35});}}
const particles=[];
function breakHazard(h,e){if(h.hp<=0)return;h.hp=0;h.group.visible=false;damageEnemy(e,0,0,'environment');makeBurst(h.x,1,h.z,h.kind==='lantern'?0xffb94e:0xd9a66a,20);}
function strike(){if(!started||paused||player.attackTime>0)return;player.attackTime=.39;player.attackAnim=.32;const target=nearestEnemy(3.2,false);if(target){const dir=new THREE.Vector3(target.root.position.x-player.root.position.x,0,target.root.position.z-player.root.position.z).normalize();player.root.rotation.y=Math.atan2(-dir.x,-dir.z);damageEnemy(target,24,5.6);if(Math.random()<.25)showToast('CLEAN STRIKE  ·  FOCUS +12');player.focus=Math.min(100,player.focus+12);}
 else {for(const h of hazards){if(h.hp<=0)continue;const dx=h.x-player.root.position.x,dz=h.z-player.root.position.z,d=Math.hypot(dx,dz);if(d<2.8){h.hp--;if(h.hp<=0){h.group.visible=false;makeBurst(h.x,1,h.z,h.kind==='lantern'?0xffb94e:0xd9a66a,14);showToast('THE CITY IS PART OF YOUR STYLE');}break;}}}
}
function grab(){if(!started||paused)return;if(player.grabbed){toss();return;}const e=nearestEnemy(3.3,false);if(!e){showToast('GET CLOSE TO A CHALLENGER TO GRAB');return;}player.root.rotation.y=Math.atan2(-(e.root.position.x-player.root.position.x),-(e.root.position.z-player.root.position.z));player.grabbed=e;e.carried=true;e.stun=99;showToast('GRABBED  ·  PRESS R TO TOSS');}
function toss(){const e=player.grabbed;if(!e)return;player.grabbed=null;e.carried=false;e.stun=.9;const forward=new THREE.Vector3(-Math.sin(player.root.rotation.y),0,-Math.cos(player.root.rotation.y));e.knock.copy(forward).multiplyScalar(13);e.hp-=16;e.root.rotation.y=player.root.rotation.y;e.root.position.y=.25;showToast('TOSS  ·  USE THE STREETS');if(e.hp<=0)knockOut(e);}
function dash(){if(!started||paused||player.focus<18||player.dashTime>0)return;player.focus-=18;player.dashTime=.24;const f=new THREE.Vector3(-Math.sin(player.root.rotation.y),0,-Math.cos(player.root.rotation.y));player.speed=17;player.root.position.addScaledVector(f,1.6);makeBurst(player.root.position.x,.5,player.root.position.z,0x98c9d8,5);}
function clampWorld(p){p.x=THREE.MathUtils.clamp(p.x,-87,86);p.z=THREE.MathUtils.clamp(p.z,-87,87);}
function moveAgainstSolids(p,dx,dz,r=.45){let nx=p.x+dx,nz=p.z+dz;for(const s of solids){if(Math.abs(nz-s.z)<s.hd+r&&Math.abs(nx-s.x)<s.hw+r){const oldX=p.x,oldZ=p.z;if(Math.abs(nx-s.x)-s.hw>Math.abs(nz-s.z)-s.hd)nx=oldX;else nz=oldZ;}}p.x=nx;p.z=nz;clampWorld(p);}
function getMoveInput(){let x=(keys.has('KeyD')||touchMove.right?1:0)-(keys.has('KeyA')||touchMove.left?1:0);let y=(keys.has('KeyW')||touchMove.up?1:0)-(keys.has('KeyS')||touchMove.down?1:0);if(x||y){const l=Math.hypot(x,y);x/=l;y/=l;}return {x,y};}
function animateRig(a,dt,walking){a.anim+=dt*(walking?10:4);const swing=walking?Math.sin(a.anim)*.47:Math.sin(a.anim)*.035;for(const l of a.limbs){l.part.rotation.x=l.type==='leg'?swing*l.side:-swing*l.side*.7;l.part.rotation.z=l.type==='arm'?l.side*.05:0;}
 if(a===player&&player.attackAnim>0){const arm=a.limbs.find(l=>l.type==='arm'&&l.side===1);if(arm)arm.part.rotation.x=-1.9*Math.sin((player.attackAnim/.32)*Math.PI);a.body.rotation.z=Math.sin((player.attackAnim/.32)*Math.PI)*.11;}
 else if(a===player)a.body.rotation.z=0;
 a.healthGroup.quaternion.copy(camera.quaternion);
 if(a.hitFlash>0){a.hitFlash-=dt;a.body.material=M.cream;}else if(!a.isPlayer)a.body.material=a.uniform||a.body.material;
}
function updateActor(e,dt){if(!e.alive){e.root.position.y=Math.max(.15,e.root.position.y-dt*.3);return;}
 if(e.carried){const f=new THREE.Vector3(-Math.sin(player.root.rotation.y),0,-Math.cos(player.root.rotation.y));e.root.position.copy(player.root.position).addScaledVector(f,1.45);e.root.position.y=.35;e.root.rotation.y=player.root.rotation.y;e.root.rotation.z=Math.sin(gameTime*9)*.08;return;}
 if(e.stun>0){e.stun-=dt;const v=e.knock.length();if(v>.2){e.root.position.x+=e.knock.x*dt;e.root.position.z+=e.knock.z*dt;e.knock.multiplyScalar(Math.max(0,1-dt*3.4));}}
 else{const delta=new THREE.Vector3(player.root.position.x-e.root.position.x,0,player.root.position.z-e.root.position.z),d=delta.length();if(d>2.3){delta.normalize();const sp=e.id<2?2.45:2.05;e.root.position.x+=delta.x*sp*dt;e.root.position.z+=delta.z*sp*dt;e.root.rotation.y=Math.atan2(-delta.x,-delta.z);e.root.position.y=Math.sin(gameTime*6+e.id)*.025;}else{e.attackClock-=dt;if(e.attackClock<=0){e.attackClock=1.6+Math.random()*.7;if(player.dashTime<=0){player.hp-=7+Math.random()*4;player.root.position.x+=(player.root.position.x-e.root.position.x)*.09;showToast('WATCH YOUR GUARD');if(player.hp<=0){player.hp=55;player.root.position.set(0,0,28);player.speed=0;showToast('BACK ON YOUR FEET  ·  VITALITY RESTORED');}}}if(d>.3)e.root.rotation.y=Math.atan2(-delta.x,-delta.z);}}
 for(const h of hazards){if(h.hp<=0||e.knock.length()<2)continue;if(Math.hypot(e.root.position.x-h.x,e.root.position.z-h.z)<h.r+.2){breakHazard(h,e);e.knock.multiplyScalar(.28);break;}}
 e.root.position.x=THREE.MathUtils.clamp(e.root.position.x,-86,85);e.root.position.z=THREE.MathUtils.clamp(e.root.position.z,-86,86);animateRig(e,dt,e.stun<=0&&Math.hypot(e.root.position.x-player.root.position.x,e.root.position.z-player.root.position.z)>2.3);
}
function updatePlayer(dt){const input=getMoveInput(),moving=!!(input.x||input.y);player.attackTime=Math.max(0,player.attackTime-dt);player.attackAnim=Math.max(0,player.attackAnim-dt);player.dashTime=Math.max(0,player.dashTime-dt);player.focus=Math.min(100,player.focus+dt*(player.dashTime>0?0:8));
 if(moving){rightVec.set(Math.cos(cameraYaw),0,-Math.sin(cameraYaw));const forward=new THREE.Vector3(-Math.sin(cameraYaw),0,-Math.cos(cameraYaw));moveVec.copy(rightVec).multiplyScalar(input.x).addScaledVector(forward,input.y).normalize();const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');const speed=sprint?7.2:4.7;player.speed=THREE.MathUtils.damp(player.speed,speed,12,dt);moveAgainstSolids(player.root.position,moveVec.x*player.speed*dt,moveVec.z*player.speed*dt);player.root.rotation.y=Math.atan2(-moveVec.x,-moveVec.z);}
 else player.speed=THREE.MathUtils.damp(player.speed,0,8,dt);
 if(player.dashTime>0){const f=new THREE.Vector3(-Math.sin(player.root.rotation.y),0,-Math.cos(player.root.rotation.y));moveAgainstSolids(player.root.position,f.x*dt*10,f.z*dt*10);}
 animateRig(player,dt,moving);if(player.grabbed&&player.grabbed.alive)updateActor(player.grabbed,dt);
}
function updateCamera(dt){const p=player.root.position;const desired=new THREE.Vector3(p.x+Math.sin(cameraYaw)*cameraDistance,p.y+3.1+cameraPitch*2,p.z+Math.cos(cameraYaw)*cameraDistance);camera.position.lerp(desired,1-Math.exp(-dt*5));camera.lookAt(p.x,p.y+1.15,p.z);}
let minimapTick=0;
function drawMinimap(dt){minimapTick-=dt;if(minimapTick>0)return;minimapTick=.13;const c=$('#minimap'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);ctx.beginPath();ctx.arc(0,0,w/2-2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#25343b';ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='#4b4e47';for(let x=-90;x<90;x+=8)for(let z=-90;z<90;z+=8){if((x<-40||x>40||z<-15)&&Math.abs(x*3+z*7)%41===0)ctx.fillRect(x*.72,z*.72,2,2);}ctx.fillStyle='#18252b';ctx.fillRect(-4,-68,8,136);ctx.fillRect(-68,-4,136,8);ctx.fillRect(-39,-68,5,136);ctx.fillRect(34,-68,5,136);ctx.fillRect(-68,-39,136,5);ctx.fillRect(-68,34,136,5);ctx.strokeStyle='#d5b06d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,w/2-2,0,Math.PI*2);ctx.stroke();
 const px=player.root.position.x*.72,pz=player.root.position.z*.72;for(const e of enemies){if(!e.alive)continue;ctx.fillStyle=e===targetEnemy?'#fff1c8':'#d96558';ctx.beginPath();ctx.arc(e.root.position.x*.72,e.root.position.z*.72,2.4,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#9dd8df';ctx.save();ctx.translate(px,pz);ctx.rotate(player.root.rotation.y);ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(3.2,3.8);ctx.lineTo(-3.2,3.8);ctx.closePath();ctx.fill();ctx.restore();ctx.restore();
 const p=player.root.position;let district='OLD TOWN';if(p.z>13)district='NIGHT MARKET';else if(p.z< -15)district='LOTUS TEMPLE';else if(p.x>45)district='RIVER WALK';else if(Math.abs(p.x)>52)district='OUTER ALLEY';$('#district-name').textContent=district;
}
const targetRing=new THREE.Mesh(new THREE.RingGeometry(.72,.85,28),new THREE.MeshBasicMaterial({color:0xf0c77f,side:THREE.DoubleSide,transparent:true,opacity:.88}));targetRing.rotation.x=-Math.PI/2;targetRing.position.y=.12;targetRing.visible=false;scene.add(targetRing);
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-(frame.last||now))/1000);frame.last=now;gameTime+=dt;if(started&&!paused){updatePlayer(dt);for(const e of enemies)if(e!==player.grabbed)updateActor(e,dt);targetEnemy=nearestEnemy(9,false);if(targetEnemy){targetRing.visible=true;targetRing.position.set(targetEnemy.root.position.x,.12,targetEnemy.root.position.z);targetRing.material.opacity=.65+Math.sin(gameTime*5)*.2;}else targetRing.visible=false;updateCamera(dt);drawMinimap(dt);if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('#toast').classList.remove('show');}updateHud();}else{updateCamera(dt);}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.mesh.position.addScaledVector(p.vel,dt);p.vel.y-=8*dt;p.mesh.scale.multiplyScalar(.975);p.mesh.material.opacity=Math.max(0,p.life);p.mesh.material.transparent=true;if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();particles.splice(i,1);}}
 renderer.render(scene,camera);}
requestAnimationFrame(frame);
function startGame(){if(started)return;started=true;paused=false;$('#start-screen').classList.add('hidden');$('#pause-screen').classList.add('hidden');$('#hud').classList.remove('hidden');if(matchMedia('(max-width: 700px), (pointer: coarse)').matches)$('#mobile-controls').classList.remove('hidden');else renderer.domElement.requestPointerLock?.();showToast('EXPLORE THE DISTRICT  ·  THE NIGHT IS YOURS');updateHud();}
$('#start-button').addEventListener('click',startGame);
$('#resume-button').addEventListener('click',()=>{paused=false;$('#pause-screen').classList.add('hidden');renderer.domElement.requestPointerLock?.();});
$('#continue-button').addEventListener('click',()=>$('#result-screen').classList.add('hidden'));
document.addEventListener('pointerlockchange',()=>{if(!started)return;if(document.pointerLockElement===renderer.domElement){paused=false;$('#pause-screen').classList.add('hidden');}else if(!matchMedia('(pointer: coarse)').matches&&!$('#start-screen').classList.contains('hidden')){}else if(!matchMedia('(pointer: coarse)').matches){paused=true;$('#pause-screen').classList.remove('hidden');}});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==renderer.domElement||paused)return;cameraYaw-=e.movementX*.0026;cameraPitch=THREE.MathUtils.clamp(cameraPitch-e.movementY*.0012,-.18,.68);});
renderer.domElement.addEventListener('click',()=>{if(started&&!paused&&document.pointerLockElement===renderer.domElement)strike();});
renderer.domElement.addEventListener('wheel',e=>{cameraDistance=THREE.MathUtils.clamp(cameraDistance+e.deltaY*.008,5,12);},{passive:true});
document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='Space')strike();if(e.code==='KeyE')grab();if(e.code==='KeyR')toss();if(e.code==='ShiftLeft'||e.code==='ShiftRight')dash();if(e.code==='Escape'&&started&&!paused){paused=true;$('#pause-screen').classList.remove('hidden');}});
document.addEventListener('keyup',e=>keys.delete(e.code));
function bindTouchButton(id,fn){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();fn();});}
bindTouchButton('#touch-attack',strike);bindTouchButton('#touch-dash',dash);bindTouchButton('#touch-grab',grab);bindTouchButton('#touch-throw',toss);
for(const btn of document.querySelectorAll('[data-move]')){const dir=btn.dataset.move;const on=e=>{e.preventDefault();touchMove[dir]=true;};const off=e=>{e.preventDefault();touchMove[dir]=false;};btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointerleave',off);btn.addEventListener('pointercancel',off);}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));});
