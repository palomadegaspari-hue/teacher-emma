import fs from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

const databaseUrl=process.env.DATABASE_URL;
const dataDir=process.env.DATA_DIR || path.resolve('data');
let pool=null;
export async function initStore(){
 if(databaseUrl){pool=new Pool({connectionString:databaseUrl, max:3,ssl:process.env.PGSSL==='true'?{rejectUnauthorized:true}:undefined});await pool.query('CREATE TABLE IF NOT EXISTS emma_profiles (id TEXT PRIMARY KEY, payload JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())');return;}
 if(process.env.NODE_ENV==='production' && !process.env.DATA_DIR)throw Error('Configure DATABASE_URL ou DATA_DIR com disco persistente. Armazenamento efêmero não é permitido em produção.');
 await fs.mkdir(dataDir,{recursive:true,mode:0o700});
}
function fileFor(id){if(!['paloma','valen'].includes(id))throw Error('Invalid profile');return path.join(dataDir,`${id}.json`);}
export async function readProfile(id){if(pool){const result=await pool.query('SELECT payload FROM emma_profiles WHERE id=$1',[id]);return result.rows[0]?.payload||null;}
 try{return JSON.parse(await fs.readFile(fileFor(id),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
export async function writeProfile(id,payload){if(pool){await pool.query('INSERT INTO emma_profiles (id,payload) VALUES($1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=now()',[id,JSON.stringify(payload)]);return;}
 const filename=fileFor(id),tmp=filename+'.tmp';await fs.writeFile(tmp,JSON.stringify(payload),{mode:0o600});await fs.rename(tmp,filename);
}
export async function closeStore(){if(pool)await pool.end();}
