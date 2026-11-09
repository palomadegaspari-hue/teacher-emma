import { createHmac, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';

export const USERS = Object.freeze({paloma:{name:'Paloma',audience:'adult'},valen:{name:'Valen',audience:'minor'}});
const COOKIE='emma_session';
const LIFETIME=7*24*3600;
const key=()=>process.env.SESSION_SECRET || '';
export function credentialsConfigured(){return Boolean(key().length>=32 && process.env.PALOMA_PASSWORD?.length>=10 && process.env.VALEN_PASSWORD?.length>=10 && process.env.PALOMA_PASSWORD !== process.env.VALEN_PASSWORD);}
function mac(s){return createHmac('sha256',key()).update(s).digest('base64url');}
function secureCompare(a,b){const aB=Buffer.from(a),bB=Buffer.from(b);return aB.length===bB.length && timingSafeEqual(aB,bB);}
// scrypt makes comparisons expensive even when the password is incorrect.
export function passwordMatches(id,pwd){const expected=id==='paloma'?process.env.PALOMA_PASSWORD:id==='valen'?process.env.VALEN_PASSWORD:null;
 if(!expected||typeof pwd!=='string'||pwd.length>256)return false;
 const salt=`teacher-emma:${id}`;return secureCompare(scryptSync(pwd,salt,64).toString('hex'),scryptSync(expected,salt,64).toString('hex'));
}
export function issueCookie(id,secure=true){const payload=Buffer.from(JSON.stringify({id,exp:Math.floor(Date.now()/1000)+LIFETIME,nonce:randomBytes(12).toString('hex')})).toString('base64url');return `${COOKIE}=${payload}.${mac(payload)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${LIFETIME}${secure?'; Secure':''}`;}
export function clearCookie(secure=true){return `${COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure?'; Secure':''}`;}
export function readSession(req){if(!credentialsConfigured())return null;const value=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!value)return null;const [payload,sig,...extra]=value.split('.');if(!payload||!sig||extra.length||!secureCompare(mac(payload),sig))return null;try{const x=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return USERS[x.id]&&Number.isSafeInteger(x.exp)&&x.exp>Date.now()/1000?x.id:null;}catch{return null;}}
export function requireUser(req,res,next){const user=readSession(req);if(!user)return res.status(401).json({error:'Acesse seu perfil para continuar.'});req.user=user;next();}
export function enforceOrigin(req,res,next){if(!['POST','PUT','PATCH','DELETE'].includes(req.method))return next();const origin=req.get('origin');const host=req.get('host');if(origin){try{if(new URL(origin).host===host)return next();}catch{}}return res.status(403).json({error:'Origem da requisição não autorizada.'});}
