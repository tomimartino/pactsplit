import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allocation,parseAmount,parsePercent,formatMoney } from '../src/lib/amounts.ts';
test('native USDC uses 18 decimals and exact cents',()=>{assert.equal(parseAmount('10.01'),10010000000000000000n);assert.equal(formatMoney(10010000000000000000n),'10.01');});
test('decimal shares preserve tiny payments without floating point',()=>{const shares=[parsePercent('33.33'),parsePercent('33.33'),parsePercent('33.34')];const amounts=allocation(parseAmount('0.01'),shares);assert.deepEqual(amounts,[3333000000000000n,3333000000000000n,3334000000000000n]);assert.equal(formatMoney(amounts[0]),'0.003333');});
test('rejects invalid values, excess precision, and unbalanced shares',()=>{for(const s of ['0','-1','1e3','0.001','NaN','1000000.01'])assert.throws(()=>parseAmount(s));for(const s of ['0','101','1.001','-2','NaN'])assert.throws(()=>parsePercent(s));assert.throws(()=>allocation(1n,[3000,6000]));});
test('allocation conserves every smallest native unit',()=>{for(let amount=1n;amount<1000n;amount+=13n){const values=allocation(amount,[1234,2345,6421]);assert.equal(values.reduce((a,b)=>a+b,0n),amount);assert(values.every(n=>n>=0n));}});
