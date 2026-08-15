import{initializeApp}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import{getFirestore,collection,addDoc,deleteDoc,doc,query,where,getDocs}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import{getStorage,ref,uploadBytes,getDownloadURL,deleteObject}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

/* ================================
   MASUKKAN CONFIG FIREBASE DI SINI
   ================================ */
const firebaseConfig={
 apiKey:"AIzaSyCrZM88r3c6W8IE0eyb9POfrN7OZiIN",
 authDomain:"fahristorage-40303.firebaseapp.com",
 projectId:"fahristorage-40303",
 storageBucket:"fahristorage-40303.firebasestorage.app",
 messagingSenderId:"938557970517",
 appId:"57970517:web:bdb0de89c04a04a03f5cdc"
};

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
const authPage=document.getElementById("authPage"),dashboard=document.getElementById("dashboard"),loginBox=document.getElementById("loginBox"),registerBox=document.getElementById("registerBox");
const userName=document.getElementById("userName"),welcomeName=document.getElementById("welcomeName"),fileList=document.getElementById("fileList"),fileCount=document.getElementById("fileCount"),storageText=document.getElementById("storageText"),storagePercent=document.getElementById("storagePercent"),storageProgress=document.getElementById("storageProgress");
let allFiles=[];

onAuthStateChanged(auth,async user=>{
 if(user){authPage.classList.add("hidden");dashboard.classList.remove("hidden");const name=user.displayName||user.email.split("@")[0];userName.textContent=name;welcomeName.textContent=name;await renderFiles()}
 else{authPage.classList.remove("hidden");dashboard.classList.add("hidden")}
});

window.login=async()=>{
 const email=document.getElementById("loginEmail").value.trim(),password=document.getElementById("loginPassword").value;
 if(!email||!password)return toast("Isi email dan password.");
 try{await signInWithEmailAndPassword(auth,email,password);toast("Login berhasil!")}catch(e){toast(getError(e))}
};

window.register=async()=>{
 const name=document.getElementById("registerName").value.trim(),email=document.getElementById("registerEmail").value.trim(),password=document.getElementById("registerPassword").value;
 if(!name||!email||!password)return toast("Semua data wajib diisi.");
 if(password.length<6)return toast("Password minimal 6 karakter.");
 try{
  const result=await createUserWithEmailAndPassword(auth,email,password);
  await updateProfile(result.user,{displayName:name});
  await addDoc(collection(db,"users"),{uid:result.user.uid,name,email,createdAt:new Date()});
  toast("Akun berhasil dibuat!");
 }catch(e){toast(getError(e))}
};

window.logout=async()=>{await signOut(auth);toast("Berhasil logout.")};
window.showRegister=()=>{loginBox.classList.add("hidden");registerBox.classList.remove("hidden")};
window.showLogin=()=>{registerBox.classList.add("hidden");loginBox.classList.remove("hidden")};

window.uploadFiles=async()=>{
 const input=document.getElementById("fileInput"),files=Array.from(input.files),user=auth.currentUser;if(!user||!files.length)return;
 for(const file of files){
  try{
   toast("Mengupload "+file.name+"...");
   const path=`users/${user.uid}/${Date.now()}_${file.name}`,storageRef=ref(storage,path),snapshot=await uploadBytes(storageRef,file),url=await getDownloadURL(snapshot.ref);
   await addDoc(collection(db,"files"),{uid:user.uid,name:file.name,size:file.size,type:file.type||"application/octet-stream",url,path,createdAt:new Date()});
  }catch(e){console.error(e);toast("Gagal upload "+file.name)}
 }
 input.value="";toast("Upload selesai!");await renderFiles();
};

window.renderFiles=async()=>{
 const user=auth.currentUser;if(!user)return;
 try{
  const q=query(collection(db,"files"),where("uid","==",user.uid)),snapshot=await getDocs(q);
  allFiles=[];snapshot.forEach(x=>allFiles.push({id:x.id,...x.data()}));
  const search=document.getElementById("searchInput").value.toLowerCase().trim(),filtered=allFiles.filter(f=>f.name.toLowerCase().includes(search));
  fileList.innerHTML="";
  if(!filtered.length)fileList.innerHTML=`<div class="empty"><i class="fa-regular fa-folder-open"></i>${allFiles.length===0?"Belum ada file.":"File tidak ditemukan."}</div>`;
  filtered.sort((a,b)=>getDate(b.createdAt)-getDate(a.createdAt)).forEach(createFileElement);
  fileCount.textContent=allFiles.length+" file";updateStorage();
 }catch(e){console.error(e);toast("Gagal mengambil data file.")}
};

function createFileElement(file){
 const div=document.createElement("div");div.className="file";
 div.innerHTML=`<div class="file-icon"><i class="${getIcon(file.type)}"></i></div><div class="file-info"><div class="file-name">${escapeHTML(file.name)}</div><div class="file-meta">${formatSize(file.size)} • ${formatDate(file.createdAt)}</div></div><div class="file-actions"><button title="Download"><i class="fa-solid fa-download"></i></button><button title="Hapus"><i class="fa-solid fa-trash"></i></button></div>`;
 div.querySelectorAll("button")[0].onclick=()=>window.open(file.url,"_blank");
 div.querySelectorAll("button")[1].onclick=()=>removeFile(file.id);
 fileList.appendChild(div);
}

window.removeFile=async id=>{
 const file=allFiles.find(x=>x.id===id);if(!file)return;
 if(!confirm(`Hapus "${file.name}"?`))return;
 try{await deleteObject(ref(storage,file.path));await deleteDoc(doc(db,"files",id));toast("File berhasil dihapus.");await renderFiles()}catch(e){console.error(e);toast("Gagal menghapus file.")}
};

function updateStorage(){
 let total=0;allFiles.forEach(f=>total+=Number(f.size)||0);
 const max=1024*1024*1024,percent=Math.min((total/max)*100,100);
 storageProgress.style.width=percent+"%";storagePercent.textContent=Math.round(percent)+"%";storageText.textContent=formatSize(total)+" digunakan";
}
function getIcon(t=""){if(t.includes("image"))return"fa-regular fa-image";if(t.includes("video"))return"fa-solid fa-film";if(t.includes("audio"))return"fa-solid fa-music";if(t.includes("pdf"))return"fa-solid fa-file-pdf";if(t.includes("zip")||t.includes("rar"))return"fa-solid fa-file-zipper";if(t.includes("text"))return"fa-solid fa-file-lines";return"fa-solid fa-file"}
function formatSize(b){if(!b)return"0 B";const u=["B","KB","MB","GB"],i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i===0?0:2)+" "+u[i]}
function getDate(v){if(!v)return 0;if(typeof v.toDate==="function")return v.toDate();return new Date(v)}
function formatDate(v){return getDate(v).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function escapeHTML(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function getError(e){const c=e?.code||"";if(c.includes("invalid-credential"))return"Email atau password salah.";if(c.includes("email-already-in-use"))return"Email sudah terdaftar.";if(c.includes("invalid-email"))return"Format email tidak valid.";if(c.includes("weak-password"))return"Password terlalu lemah.";if(c.includes("network"))return"Periksa koneksi internet.";if(c.includes("permission-denied"))return"Akses Firebase ditolak.";return"Terjadi kesalahan. Coba lagi."}
function toast(m){const e=document.getElementById("toast");e.textContent=m;e.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>e.classList.remove("show"),2500)}
