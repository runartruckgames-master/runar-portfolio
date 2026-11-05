document.addEventListener("DOMContentLoaded",()=>{if(!new URLSearchParams(location.search).has("preview"))return;
const read=key=>{try{return localStorage.getItem(key)}catch(e){return null}};
const photo=read("runar-portfolio-photo-v2"),img=document.getElementById("profile-preview"),hint=document.getElementById("profile-hint");
if(photo&&img&&photo.startsWith("data:image/jpeg;base64,")){img.onload=()=>{img.hidden=false;if(hint)hint.hidden=true};img.onerror=()=>{img.hidden=true;if(hint)hint.hidden=false};img.src=photo}
const lead=read("runar-portfolio-lead-draft"),leadTarget=document.querySelector(".hero .lead");if(lead&&leadTarget)leadTarget.textContent=lead;
const about=read("runar-portfolio-about-draft"),aboutTarget=document.querySelector("#about > div:last-child");if(about&&aboutTarget){aboutTarget.replaceChildren();for(const value of about.split(/\n\s*\n/)){const valueTrim=value.trim();if(!valueTrim)continue;const p=document.createElement("p");p.textContent=valueTrim;aboutTarget.append(p)}}
const contact=read("runar-portfolio-contact-draft"),contactTarget=document.querySelector("#contacts > p");if(contact&&contactTarget)contactTarget.textContent=contact;
});
