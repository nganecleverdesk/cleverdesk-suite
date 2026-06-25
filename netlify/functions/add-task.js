const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { uid, task, secret } = JSON.parse(event.body);

    if (secret !== process.env.WEBHOOK_SECRET) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const db = admin.firestore();
    await db.collection('users').doc(uid).update({
      smarttasks: admin.firestore.FieldValue.arrayUnion(task)
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
