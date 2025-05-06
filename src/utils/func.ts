export function generateUID() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let transactionID = '';
  for (let i = 0; i < 20; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    transactionID += characters[randomIndex];
  }
  return transactionID;
}
