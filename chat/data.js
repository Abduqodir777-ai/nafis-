'use strict';
const DEFAULT_PRODUCTS = [
 {id:'chuchvara',name:'Uy chuchvarasi',category:'xamir',weight:'500 g',price:45000,food:'🥟',color:'sage',tag:'Oilaviy tanlov',description:'Yupqa xamirli chuchvara. Sho‘rva yoki qayla bilan dasturxonga torting.'},
 {id:'manti',name:'Go‘shtli manti',category:'xamir',weight:'6 dona',price:48000,food:'🥟',color:'peach',tag:'Sevimli ta’m',description:'Bug‘da pishirish uchun manti. Oilaviy tushlik uchun qulay tanlov.'},
 {id:'kotlet',name:'Uy kotleti',category:'gosht',weight:'500 g',price:52000,food:'🧆',color:'gold',tag:'Har kun uchun',description:'Garnir yoki salat bilan to‘ldiring. Tushlik va kechki ovqat uchun.'},
 {id:'somsa',name:'Go‘shtli somsa',category:'pishiriq',weight:'6 dona',price:42000,food:'🥟',color:'peach',tag:'Pech uchun',description:'Duxovkada pishirish uchun somsa. Issiq dasturxonga mos pishiriq.'},
 {id:'blinchik',name:'Go‘shtli blinchik',category:'pishiriq',weight:'6 dona',price:38000,food:'🥞',color:'pink',tag:'Qulay tanlov',description:'Ichlikli blinchiklar. Nonushta yoki yengil tushlik uchun.'},
 {id:'teftel',name:'Go‘shtli teftel',category:'gosht',weight:'500 g',price:49000,food:'🧆',color:'sage',tag:'Oilaviy taom',description:'Sevimli sousingiz bilan tayyorlang. Guruch va boshqa garnirlarga mos.'}
];

const DEFAULT_BOT_USERNAME = 'nafisyarimtayormahsulotlar_bot';
function createNafisData() {
 const key='nafis-catalog-v1';
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function validate(data){
  if(!data||!Array.isArray(data.products)||data.products.length>200||! /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(data.botUsername))throw Error('Bot username yoki katalog formati xato.');
  const ids=new Set();
  const products=data.products.map(p=>{
   if(!p||! /^[a-z0-9_-]{1,60}$/.test(p.id)||ids.has(p.id))throw Error('Mahsulot ID xato yoki takrorlangan.');
   ids.add(p.id);
   if(!['xamir','gosht','pishiriq'].includes(p.category)||!['sage','peach','gold','pink'].includes(p.color)||!Number.isSafeInteger(p.price)||p.price<1||p.price>100000000)throw Error('Toifa, rang yoki narx xato.');
   const result={id:p.id,category:p.category,color:p.color,price:p.price};
   for(const [field,max] of [['name',80],['weight',40],['food',16],['tag',40],['description',400]]){
    if(typeof p[field]!=='string'||!p[field].trim()||p[field].length>max)throw Error('Mahsulot maydoni xato: '+field);
    result[field]=p[field].trim();
   }
   return result;
  });
  return {version:1,botUsername:data.botUsername,products};
 }
 function defaults(){return {version:1,botUsername:DEFAULT_BOT_USERNAME,products:JSON.parse(JSON.stringify(DEFAULT_PRODUCTS))};}
 function load(){try{const raw=localStorage.getItem(key);return raw?validate(JSON.parse(raw)):defaults();}catch{return defaults();}}
 function save(data){const clean=validate(data);localStorage.setItem(key,JSON.stringify(clean));return clean;}
 return {load,save,validate,defaults,escape};
}
const NafisData = createNafisData();
