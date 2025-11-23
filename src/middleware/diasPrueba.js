/* se va a crear un cronjob sevam a agregar si en dos meses de inavlitala las cuentas  que tenga que ver con el administrador 
  que solicito los dias de prueba se creara un cron job para que se ejecute diariamente y verifique
  si alguna cuenta de administrador tiene dias de prueba vencidos y desactive esas cuentas se desactiva
  todas las que tengan que ver con esa comapania y administrador 
**/

/**
 * NOTA:
 * terminar de implementar el cron job para desactivar cuentas con periodo de prueba vencido
 */

const { getUsers, createUser, updateUser, deleteUser } = require('../../models/user/user.model');

exports.deactivateExpiredTrialAccounts = async (req, res, next) => {
  try {
    const users = await getUsers();
    const currentDate = new Date();

    for (const user of users) {
      if (user.trial_end_date && new Date(user.trial_end_date) < currentDate) {
        // Desactivar el usuario
        await updateUser(user.id, { estado: 'inactive' });
        console.log(`Cuenta de usuario ${user.email} desactivada por vencimiento de periodo de prueba.`);
      }
    }

    next();
  } catch (error) {
    console.error('Error al desactivar cuentas con periodo de prueba vencido:', error);
    next(error);
  }
};
