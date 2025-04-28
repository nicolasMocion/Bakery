const twilio = require('twilio');

const accountSid = 'TU_ACCOUNT_SID';
const authToken = 'TU_AUTH_TOKEN';
const client = twilio(accountSid, authToken);

client.messages
  .create({
     from: 'whatsapp:+13343102037', // número sandbox de Twilio
     to: 'whatsapp:+573143375950', // tu número personal
     body: 'Nuevo pedido recibido: 2 panes de bono y 1 de queso',
   })
  .then(message => console.log(message.sid))
  .catch(error => console.error(error));