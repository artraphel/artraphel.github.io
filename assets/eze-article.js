/* Play only the film selected by the reader. */
document.addEventListener('DOMContentLoaded',()=>{
  const videos=[...document.querySelectorAll('.journal-film video')];
  videos.forEach(video=>video.addEventListener('play',()=>{
    videos.forEach(other=>{if(other!==video)other.pause();});
  }));
});
