const input=document.getElementById("input"), messages=document.getElementById("messages");
function scrollToChat(){document.getElementById("chat").scrollIntoView({behavior:"smooth"})}
function newChat(){messages.innerHTML=`<div class="msg ai"><div class="bot-avatar">V</div><div class="bubble">Chat baru siap! 👋<br>Apa yang ingin kamu tanyakan?<small>sekarang</small></div></div>`}
function sendMessage(){
 const text=input.value.trim(); if(!text)return;
 const row=document.createElement("div"); row.className="msg user";
 row.innerHTML=`<div class="bubble">${escapeHtml(text)}<small>sekarang ✓✓</small></div>`;
 messages.appendChild(row); input.value=""; messages.scrollTop=messages.scrollHeight;
 setTimeout(()=>reply(text),700);
}
function reply(text){
 const row=document.createElement("div"); row.className="msg ai";
 row.innerHTML=`<div class="bot-avatar">V</div><div class="bubble">Saya VEXLIY AI. ✨<br><br>Saya menerima pesan kamu: <b>${escapeHtml(text)}</b><br><br>Versi demo ini sudah siap digunakan sebagai tampilan frontend. Untuk jawaban AI sungguhan, hubungkan fungsi chat ini ke API AI pilihanmu.<small>sekarang</small></div>`;
 messages.appendChild(row); messages.scrollTop=messages.scrollHeight;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
document.getElementById("themeBtn").onclick=()=>document.body.classList.toggle("light");
