const socket = io();
const nameI = document.getElementById("name");
const passI = document.getElementById("pass");
const phoneI = document.getElementById("phone");
const msgI = document.getElementById("msg");
const msgs = document.getElementById("msgs");
const chat = document.getElementById("chat");
const auth = document.getElementById("auth");
const me = document.getElementById("me");

let token, user;

document.getElementById("signup").onclick = async ()=>{
  const name = nameI.value.trim(), pass = passI.value.trim();
  if(!name||!pass) return alert("Faltan datos");
  const r = await fetch("/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,password:pass})});
  const j = await r.json();
  if(j.ok){ token=j.user.token; user=j.user; start(); } else alert(j.error);
};
document.getElementById("login").onclick = async ()=>{
  const phone=phoneI.value.trim(), pass=passI.value.trim();
  if(!phone||!pass) return alert("Faltan datos");
  const r = await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,password:pass})});
  const j = await r.json();
  if(j.ok){ token=j.user.token; user=j.user; start(); } else alert(j.error);
};

function start(){
  auth.style.display="none"; chat.style.display="block";
  me.textContent = `${user.name} (${user.phone})`;
  socket.emit("auth", token);
}

document.getElementById("send").onclick = ()=>{
  const text = msgI.value.trim();
  if(!text) return;
  socket.emit("chat message", { text });
  msgI.value="";
};

socket.on("chat message", msg=>{
  const li=document.createElement("li");
  li.className = msg.user===user.phone?"mine":"other";
  li.textContent=`${msg.user}: ${msg.text}`;
  msgs.appendChild(li);
  msgs.scrollTop = msgs.scrollHeight;
});
