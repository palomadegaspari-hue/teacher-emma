import test from 'node:test';
import assert from 'node:assert/strict';
import {credentialsConfigured,passwordMatches,issueCookie,readSession} from '../auth.js';
test('only two fixed accounts, independent passwords and signed cookies',()=>{
 const before={a:process.env.PALOMA_PASSWORD,b:process.env.VALEN_PASSWORD,k:process.env.SESSION_SECRET};
 try{
  process.env.PALOMA_PASSWORD='correct-paloma-password';process.env.VALEN_PASSWORD='correct-valen-password';process.env.SESSION_SECRET='this-is-a-long-random-test-session-secret-123456789';
  assert.equal(credentialsConfigured(),true);assert.equal(passwordMatches('paloma','correct-paloma-password'),true);assert.equal(passwordMatches('valen','correct-paloma-password'),false);assert.equal(passwordMatches('outsider','correct-paloma-password'),false);
  const cookie=issueCookie('paloma',false).split(';')[0];assert.equal(readSession({headers:{cookie}}),'paloma');assert.equal(readSession({headers:{cookie:cookie+'modified'}}),null);
 }finally{for(const [k,v] of Object.entries({PALOMA_PASSWORD:before.a,VALEN_PASSWORD:before.b,SESSION_SECRET:before.k})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
