export async function initFooter(){
  const targets=document.querySelectorAll('[data-footer]');
  if(!targets.length) return;

  const inPages=window.location.pathname.includes('/pages/');
  const componentPath=inPages?'../components/footer.html':'components/footer.html';

  try{
    const response=await fetch(componentPath,{cache:'no-store'});
    if(!response.ok) throw new Error(`Footer HTTP ${response.status}`);
    const html=await response.text();

    targets.forEach(target=>{
      target.innerHTML=html;
      target.querySelectorAll('[data-footer-path]').forEach(link=>{
        const path=link.getAttribute('data-footer-path');
        link.href=inPages?`../${path}`:path;
      });
    });
  }catch(error){
    console.error('FEITURA footer:',error);
  }
}
