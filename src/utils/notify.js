// src/utils/notify.js
export const sendOSNotification = (title, body, icon = '🧠') => {

  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/favicon.ico' }); // Use your app's favicon
  } 
  // Ask for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    });
  }
};