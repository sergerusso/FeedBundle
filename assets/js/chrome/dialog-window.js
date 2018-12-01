/**
 * Created by Serge <contact@sergerusso.com> on 8/21/17.
 */

// vex.defaultOptions.className = 'vex-theme-default';

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  if(!request.dialog) return;
  //create dialog



  let {
      content,
      buttons,
      input,
      className,
      autoResize,
      winId,
      checkbox
    } = request.dialog,
    clickedButton = null,
    checkboxStatus = false,
    modal = null,
    focusTimeout,
    vexButtons = buttons.map((button)=>{

      button.click = function(){
        clickedButton = button.id || button.text.toLowerCase().replace(/\s/g, '_')

        !button.primary && modal.close();
      }

      button.type = (button.primary) ? 'submit' : 'button';
      button.className = (button.primary) ? 'vex-dialog-button-primary' : 'vex-dialog-button-secondary';


      return button;
    });



  modal = vex.dialog.open({
    unsafeMessage: content || '',
    input: input || '',
    contentClassName: className,
    buttons:vexButtons,
    beforeClose: function(){
      sendResponse({clicked:clickedButton, values:this.value, checkbox:checkboxStatus})
      setTimeout(window.close, 300)

    },
    afterClose: ()=>{

    }
  });

  //add checkbox
  if(checkbox){
    $(modal.contentEl).find('.vex-dialog-buttons').prepend(
      `<label class="checkbox-label"><input type='checkbox'><span></span>${checkbox} </label>`
    ).find(".checkbox-label input").on('change', (e)=>{
      checkboxStatus = e.target.checked;
    })
  }

  if(autoResize){
    let newHeight = window.outerHeight - window.innerHeight + modal.rootEl.scrollHeight;
    window.moveBy(0, window.innerHeight - newHeight);
    window.resizeTo(window.innerWidth, newHeight)
  }

  /*
  $('.selectize').selectize({
    sortField: {field: 'text'}
  });
  //todo prevent direct enter
  $('.selectize-input')
    .css({cursor: 'pointer'})
      .find('input')
      .prop('disabled', true)
*/

  setInterval(()=>{
    chrome.windows.update(winId, {focused:true})
  }, 2000);

  chrome.windows.update(winId, {focused:true})


  /*  window.addEventListener('blur', function() {
   chrome.windows.update(winId, {focused:true})
   });*/
  return true; //asynchronously sendResponse


});

if(location.hash) { //innerHeight
  window.resizeTo(window.innerWidth, window.outerHeight - window.innerHeight + parseInt(location.hash.replace("#", '')));
}