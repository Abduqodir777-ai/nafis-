'use strict';
// BOT ULANISHI: bot o‘zgarsa, shu username qiymatini almashtiring.
// Token kerak emas. Buyurtma nusxalanadi va foydalanuvchi botga yuboradi.
const CONFIG = {botUsername:NafisData.load().botUsername,storageKey:'nafis-cart-v1'};
// NAMUNA KATALOG: haqiqiy narx, vazn, nom va tavsiflarni shu yerda o‘zgartiring.
const PRODUCTS = NafisData.load().products;

const $=selector=>document.querySelector(selector);
const money=value=>new Intl.NumberFormat('uz-UZ').format(value)+' so‘m';
document.querySelectorAll('[data-bot]').forEach(link=>{link.href=`https://t.me/${CONFIG.botUsername}`;});
let cart={};
try{const saved=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))PRODUCTS.forEach(p=>{if(Number.isInteger(saved[p.id])&&saved[p.id]>0&&saved[p.id]<=99)cart[p.id]=saved[p.id];});}catch{/* Savat saqlash bloklanganda ham ishlaydi. */}
let filter='all',toastTimer;
const dialog=$('#cart-dialog');
const selected=()=>PRODUCTS.filter(p=>cart[p.id]);
const total=()=>selected().reduce((sum,p)=>sum+p.price*cart[p.id],0);
function save(){try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(cart));}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function normalize(value){return value.toLocaleLowerCase().replace(/[‘’ʻʼ`]/g,"'").trim();}
function renderProducts(){const query=normalize($('#search').value);const visible=PRODUCTS.filter(p=>(filter==='all'||p.category===filter)&&normalize(p.name+' '+p.description).includes(query));$('#products').innerHTML=visible.map(p=>`<article class="product"><div class="food-art ${p.color}" aria-hidden="true"><span class="tag">${NafisData.escape(p.tag)}</span><span class="food">${NafisData.escape(p.food)}</span><small>RAMZIY TASVIR</small></div><div class="product-title"><h3>${NafisData.escape(p.name)}</h3><span class="weight">${NafisData.escape(p.weight)} / qadoq</span></div><p>${NafisData.escape(p.description)}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="${NafisData.escape(p.name)} savatga qo‘shish">Savatga qo‘shish ＋</button></div></article>`).join('');$('#empty-search').hidden=visible.length!==0;}
function buildOrder(){const rows=selected().map((p,i)=>`${i+1}. ${p.name} (${p.weight}) × ${cart[p.id]} — ${money(p.price*cart[p.id])}`);const note=$('#order-note').value.trim();const customer=customerDetails();return `Assalomu alaykum! NAFIS saytidan buyurtma bermoqchiman.\n\n${customer}\n\n${rows.join('\n')}\n\nTaxminiy jami: ${money(total())}\nNarx va mavjudlikni tasdiqlab bering. Yetkazib berish alohida kelishiladi.${note?'\n\nIzoh: '+note:''}`;}
function renderCart(){const items=selected();$('#cart-count').textContent=Object.values(cart).reduce((sum,n)=>sum+n,0);$('#checkout').hidden=!items.length;$('#cart-items').innerHTML=items.length?items.map(p=>`<div class="cart-row"><div><h3>${NafisData.escape(p.name)}</h3><small>${NafisData.escape(p.weight)} · ${money(p.price)}</small></div><div class="quantity"><button data-id="${p.id}" data-delta="-1" aria-label="${NafisData.escape(p.name)} miqdorini kamaytirish">−</button><span>${cart[p.id]}</span><button data-id="${p.id}" data-delta="1" aria-label="${NafisData.escape(p.name)} miqdorini oshirish" ${cart[p.id]>=99?'disabled':''}>+</button><button class="remove" data-id="${p.id}" data-remove aria-label="${NafisData.escape(p.name)}ni savatdan o‘chirish">×</button></div></div>`).join(''):'<p class="empty-cart">Savatingiz hozircha bo‘sh.<br>Katalogdan yoqqan mahsulotingizni tanlang.</p>';$('#cart-total').textContent=money(total());$('#order-text').value=items.length?buildOrder():'';$('#copy-status').textContent='';}
$('#products').addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;const p=PRODUCTS.find(p=>p.id===button.dataset.add);if(!p)return;if((cart[p.id]||0)>=99){toast('Bitta mahsulot uchun eng ko‘p 99 qadoq.');return;}cart[p.id]=(cart[p.id]||0)+1;save();renderCart();toast(p.name+' savatga qo‘shildi');});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});renderProducts();}));
$('#search').addEventListener('input',renderProducts);
$('#open-cart').addEventListener('click',()=>{renderCart();dialog.showModal();document.body.classList.add('modal-open');});
$('#close-cart').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
$('#cart-items').addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(!button)return;const id=button.dataset.id;if(!cart[id])return;if(button.hasAttribute('data-remove'))delete cart[id];else{cart[id]=Math.min(99,cart[id]+Number(button.dataset.delta));if(cart[id]<=0)delete cart[id];}const delta=button.dataset.delta;save();renderCart();const next=delta?$(`[data-id="${id}"][data-delta="${delta}"]`):null;(next&&!next.disabled?next:$('#close-cart')).focus();});
$('#order-note').addEventListener('input',()=>{$('#order-text').value=buildOrder();$('#copy-status').textContent='';});
$('#copy-order').addEventListener('click',async()=>{if(!validateCustomer())return;try{if(!navigator.clipboard||!window.isSecureContext)throw new Error('Manual copy');await navigator.clipboard.writeText($('#order-text').value);$('#copy-status').textContent='Nusxalandi! Botga o‘tib, matnni chatga joylang va yuboring.';}catch{$('#order-text').focus();$('#order-text').select();$('#copy-status').textContent='Matn belgilandi. Ctrl+C yoki telefonda “Nusxalash”ni bosing, so‘ng botga yuboring.';}});
function closeMenu(){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#menu').setAttribute('aria-label','Menyuni ochish');}
$('#menu').addEventListener('click',()=>{const open=!$('#nav').classList.contains('open');$('#nav').classList.toggle('open',open);$('#menu').setAttribute('aria-expanded',String(open));$('#menu').setAttribute('aria-label',open?'Menyuni yopish':'Menyuni ochish');});
document.querySelectorAll('#nav a').forEach(link=>link.addEventListener('click',closeMenu));document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});$('#year').textContent=new Date().getFullYear();renderProducts();renderCart();

// Rasm topilmaganda mavjud matnli logo ko‘rinib turadi.
document.querySelectorAll('.brand-image').forEach(image => {
  const showLogo = () => { image.hidden = false; image.closest('.logo').classList.add('has-image'); };
  image.addEventListener('load', showLogo);
  image.addEventListener('error', () => { image.hidden = true; image.closest('.logo').classList.remove('has-image'); });
  if (image.complete && image.naturalWidth > 0) showLogo();
});
const botLabel=document.querySelector(".telegram small");if(botLabel)botLabel.textContent="@"+CONFIG.botUsername;

function customerDetails(){
 const name=$('#customer-name').value.trim(),phone=$('#customer-phone').value.trim();
 const pickup=$('#delivery-method').value==='pickup';
 return `Ism: ${name}\nTelefon: ${phone}\nOlish usuli: ${pickup?'Olib ketish':'Yetkazib berish'}${pickup?'':'\nManzil: '+$('#customer-address').value.trim()}`;
}
function validateCustomer(){
 if(!selected().length){toast('Avval mahsulot tanlang.');return false;}
 const name=$('#customer-name'),phone=$('#customer-phone'),address=$('#customer-address');
 name.setCustomValidity(name.value.trim().length>=2?'':'Ismingizni to‘liq yozing.');
 const digits=phone.value.replace(/\D/g,'');
 const valid=/^[+\d\s()-]+$/.test(phone.value)&&(/^[0-9]{9}$/.test(digits)||/^998[0-9]{9}$/.test(digits));
 phone.setCustomValidity(valid?'':'Telefonni +998 90 123 45 67 ko‘rinishida kiriting.');
 address.setCustomValidity(!address.required||address.value.trim().length>=5?'':'To‘liq yetkazib berish manzilini yozing.');
 if(!$('#customer-form').reportValidity())return false;
 if(buildOrder().length>3500){$('#copy-status').textContent='Buyurtma juda uzun. Mahsulotlarni ikki buyurtmaga ajrating.';return false;}
 return true;
}
$('#customer-form').addEventListener('submit',event=>event.preventDefault());
$('#customer-form').addEventListener('input',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity('');$('#order-text').value=buildOrder();$('#copy-status').textContent='';});
$('#delivery-method').addEventListener('change',()=>{const pickup=$('#delivery-method').value==='pickup';$('#address-field').hidden=pickup;$('#customer-address').required=!pickup;$('#customer-address').setCustomValidity('');$('#order-text').value=buildOrder();});
$('#send-order').addEventListener('click',event=>{if(!validateCustomer()){event.preventDefault();return;}$('#copy-status').textContent='Telegram botda buyurtma matnini joylang va yuboring. Admin tasdiqlaguncha buyurtma yakunlanmagan.';});
