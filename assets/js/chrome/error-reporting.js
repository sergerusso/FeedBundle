//sergerusso 2018
import createDialog from './create-dialog.js'
import Settings from '../model/settings.js'
import sendMail from '../send-mail.js'

let counting = 0,
    blocked = false;

const errorReporting = async (error, force) => {
  counting = (counting || 0) + 1;

  if(counting >= 20 && !force){

    if(counting == 20) {
      errorReporting("max error reporting", true)
      console.log("max error reporting", )
    }
    return Promise.resolve();
  }

  let {errorReporting:allowed} = await Settings.fetch();

  if(allowed === false) return Promise.resolve();


  if (allowed) {
    sendMail("feedbundle " + error)
    return Promise.resolve();
  }

  //ask

  if(blocked) return Promise.resolve();

  blocked = true;

  createDialog({
    content: "An error occurred. Send report?",
    //className:'text-center',
    buttons: [{text: 'Yes', primary: true, id: 'yes'}, {text: 'No'}],
    checkbox: "Don't ask again",
    width: 385,
    height: 155
  }, async ({clicked, values, checkbox} = {}) => {

    let doReport = (clicked == 'yes');

    //save preference
    if (checkbox) {
      await Settings.set('errorReporting', doReport)
    }

    blocked = false;
    if (doReport) sendMail("feedbundle " + error);

  });



}



export default errorReporting