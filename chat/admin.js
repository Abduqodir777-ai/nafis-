'use strict';
const $=selector=>document.querySelector(selector);
const esc=NafisData.escape;
let state=NafisData.load();
const labels={xamir:'Xamirli taomlar',gosht:'Go‘shtli taomlar',pishiriq:'Pishiriqlar'};
function status(text,error=false){$('#status').textContent=text;$('#status').classList.toggle('error',error);}
function commit(next){try{state=NafisData.save(next);render();return true;}catch(error){status('Saqlanmadi: '+error.message,true);return false;}}
function render(){
 $('#product-count').textContent=state.products.length;
 $('#bot-link').href='https://t.me/'+state.botUsername;
 $('#bot-username').value=state.botUsername;
 const query=$('#admin-search').value.trim().toLocaleLowerCase();
 const products=state.products.filter(p=>p.name.toLocaleLowerCase().includes(query));
 $('#admin-products').innerHTML=products.length?products.map(p=>`<article class="admin-product"><div><strong>${esc(p.food)} ${esc(p.name)}</strong><small>${labels[p.category]} · ${esc(p.weight)} · ${new Intl.NumberFormat('uz-UZ').format(p.price)} so‘m</small></div><div class="row-actions"><button class="quiet" data-edit="${p.id}">Tahrirlash</button><button class="quiet danger" data-delete="${p.id}" aria-label="${esc(p.name)}ni o‘chirish">O‘chirish</button></div></article>`).join(''):'<p class="hint">Mahsulot topilmadi.</p>';
}
function resetEditor(){ $('#product-form').reset();$('#product-id').value='';$('#editor-title').textContent='Yangi mahsulot'; }
function confirmAction(text,action){
 const dialog=$('#confirm-dialog');$('#confirm-text').textContent=text;
 $('#confirm-yes').onclick=()=>{dialog.close();action();};
 $('#confirm-no').onclick=()=>dialog.close();dialog.showModal();
}
$('#admin-products').addEventListener('click',event=>{
 const edit=event.target.closest('[data-edit]'),remove=event.target.closest('[data-delete]');
 if(edit){const p=state.products.find(p=>p.id===edit.dataset.edit);if(!p)return;$('#product-id').value=p.id;for(const key of ['name','price','weight','category','food','color','tag','description'])$('#'+key).value=p[key];$('#editor-title').textContent='Mahsulotni tahrirlash';$('.editor').scrollIntoView({block:'start'});$('#name').focus();}
 if(remove){const p=state.products.find(p=>p.id===remove.dataset.delete);if(!p)return;confirmAction(p.name+' mahsulotini o‘chirasizmi?',()=>{if(commit({...state,products:state.products.filter(item=>item.id!==p.id)})){if($('#product-id').value===p.id)resetEditor();status('Mahsulot o‘chirildi.');}});}
});
$('#product-form').addEventListener('submit',event=>{
 event.preventDefault();
 const id=$('#product-id').value||'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 const product={id,price:Number($('#price').value)};
 for(const key of ['name','weight','category','food','color','tag','description'])product[key]=$('#'+key).value.trim();
 const exists=state.products.some(p=>p.id===id);
 const products=exists?state.products.map(p=>p.id===id?product:p):[...state.products,product];
 if(commit({...state,products})){resetEditor();status('Mahsulot saqlandi. Sayt sahifasini yangilang.');}
});
$('#new-product').addEventListener('click',()=>{resetEditor();$('.editor').scrollIntoView({block:'start'});$('#name').focus();});
$('#cancel-edit').addEventListener('click',resetEditor);
$('#admin-search').addEventListener('input',render);
$('#settings-form').addEventListener('submit',event=>{
 event.preventDefault();const username=$('#bot-username').value.trim().replace(/^https?:\/\/t\.me\//i,'').replace(/^@/,'').replace(/\/$/,'');
 if(commit({...state,botUsername:username}))status('Bot havolasi saqlandi. Sayt sahifasini yangilang.');
});
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('#export-data').addEventListener('click',()=>{download('nafis-katalog.json',JSON.stringify(state,null,2),'application/json');status('Zaxira fayli yuklab olishga tayyorlandi.');});
$('#import-data').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  if(file.size>1000000)throw Error('Fayl 1 MB dan kichik bo‘lishi kerak.');
  const imported=NafisData.validate(JSON.parse(await file.text()));
  confirmAction(`${imported.products.length} ta mahsulot import qilinadi. Joriy katalog almashtirilsinmi?`,()=>{if(commit(imported)){resetEditor();status('Katalog import qilindi.');}});
 }catch(error){status('Import bajarilmadi: '+error.message,true);}finally{event.target.value='';}
});
$('#export-source').addEventListener('click',()=>{
 const source=`'use strict';\nconst DEFAULT_PRODUCTS = ${JSON.stringify(state.products,null,2)};\nconst DEFAULT_BOT_USERNAME = ${JSON.stringify(state.botUsername)};\n${createNafisData.toString()}\nconst NafisData = createNafisData();\n`;
 download('data.js',source,'text/javascript');status('data.js tayyor. Loyiha ichidagi data.js bilan almashtirib, saytni qayta joylashtiring.');
});
render();
