export function initCapacity(){
  const button=document.querySelector("[data-capacity-calc]");
  if(!button)return;
  button.addEventListener("click",()=>{
    const form=button.closest("form");
    const hours=Number(form.querySelector("input[type=number]")?.value)||6;
    const numbers=[...form.querySelectorAll("input[type=number]")];
    const daily=Number(numbers[0]?.value)||6;
    const days=Number(numbers[1]?.value)||22;
    const income=Number(numbers[2]?.value)||3600;
    const total=daily*days;
    const hourly=income/total;
    document.querySelector("[data-capacity-total]").textContent=`${total.toFixed(0)}h / mês`;
    document.querySelector("[data-capacity-hourly]").textContent=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(hourly);
  });
}
