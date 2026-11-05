const examples={"Статьи и SEO":[["Статья о нейросетях","1NnnjQASmGE26EQAsGMBvjBf02jYOSAAJ"],["Поездка в Канаду","1ybY79OdRsHHMcORfEoovJ3Z_hfVijzAD"]],"Продающие тексты":[["Лендинг детских квестов","1VuXrUmqv8yEDVVrDf22JqC9kLQEwhOC7"],["Офферы веб-дизайна","1ygp75HBf1pHpQQ09D-LI73QcEr_Qa6rQ"]],"Исследование аудитории":[["Кухонный тайм-менеджмент","1gdL4nclPJ4DyIMgMC6QkTUNZ-QINf0vu"],["Тур во Францию","112O1K1bfDkBpkm-aW_bR5yA2DpUOo2j_"]],"Воронки продаж":[["Самодисциплина","1GAfYcMiZfmNCUfxLUyrOm3ZLQGyyO0a3"],["Бизнес-коучинг","1zLGfoFRgkW5RixDCINO0mpRoIjJlED_2"]]};
function attachExamples(){document.querySelectorAll(".project").forEach(card=>{if(card.querySelector(".example-list"))return;const title=card.querySelector("h3")?.textContent;const items=examples[title];if(!items)return;const list=document.createElement("div");list.className="example-list";items.forEach(([name,id])=>{const link=document.createElement("a");link.href="https://drive.google.com/file/d/"+id+"/preview";link.target="_blank";link.rel="noopener noreferrer";link.textContent=name;link.addEventListener("click",event=>{event.preventDefault();openDocument(link.href,name)});list.append(link)});card.insertBefore(list,card.querySelector(".tag"))})}attachExamples();document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",attachExamples));
const documentDialog=document.createElement("dialog");documentDialog.className="document-viewer";const documentClose=document.createElement("button");documentClose.type="button";documentClose.className="viewer-close";documentClose.textContent="×";documentClose.setAttribute("aria-label","Закрыть документ");const documentFrame=document.createElement("iframe");documentFrame.title="Просмотр работы";documentDialog.append(documentClose,documentFrame);document.body.append(documentDialog);documentClose.addEventListener("click",()=>documentDialog.close());documentDialog.addEventListener("click",e=>{if(e.target===documentDialog)documentDialog.close()});documentDialog.addEventListener("close",()=>documentFrame.removeAttribute("src"));function openDocument(url,name){documentFrame.title=name;documentFrame.src=url;documentDialog.showModal()}


// Video sources are external Google Drive files. Offer a file download fallback
// instead of a broken embedded player. A hosted HTML5 player will replace this.
const portfolioVideos=[
  {name:"Reels: Крошечные мастера за работой",id:"1_2hUsHOxxrWHE1BUIpOn3LCmzE1s8ruk"},
  {name:"Видеооткрытка: День рождения",id:"1VtapJQROMcZX2Zo0kvPBLEYHMmSR9fls"},
  {name:"От идеи до волшебного мира",id:"1tP-jjqsGHl0NBAJv-jChjBxc3fnjUzi5"}
];
function renderPortfolioVideos(){
 const card=[...document.querySelectorAll(".project")].find(x=>x.querySelector("h3")?.textContent==="Видеопроекты и озвучка");
 if(!card||card.querySelector(".video-list"))return;
 const list=document.createElement("div");list.className="video-list";
 const note=document.createElement("p");note.className="video-source-note";
 note.textContent="Видео размещены на Google Drive. Если онлайн-просмотр не откроется, можно скачать оригинал.";
 list.append(note);
 for(const video of portfolioVideos){
   const row=document.createElement("div");row.className="video-source-row";
   const title=document.createElement("strong");title.textContent=video.name;row.append(title);
   const links=document.createElement("div");links.className="video-source-links";
   const view=document.createElement("a");view.className="video-preview";view.href="https://drive.google.com/file/d/"+video.id+"/view";view.target="_blank";view.rel="noopener noreferrer";view.textContent="Открыть";
   const download=document.createElement("a");download.className="video-preview";download.href="https://drive.google.com/uc?export=download&id="+encodeURIComponent(video.id);download.target="_blank";download.rel="noopener noreferrer";download.textContent="Скачать оригинал";
   links.append(view,download);row.append(links);list.append(row);
 }
 card.insertBefore(list,card.querySelector(".tag"));
}
renderPortfolioVideos();
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",renderPortfolioVideos));
