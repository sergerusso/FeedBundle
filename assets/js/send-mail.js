//sergerusso 2018

export default (text) => {
  let formData = new FormData()
  formData.append("error", text)
  fetch('https://script.google.com/macros/s/AKfycbzTnq0WlYCo8-rynpz9SRpLj-KZDpwe6UV6Rd0D6zZ8VPFLsjGC/exec', {
    method: 'POST',
    mode:'no-cors',
    body: formData
  }).catch(()=>{})
}